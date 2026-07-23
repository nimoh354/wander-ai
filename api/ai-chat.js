// api/ai-chat.js
import Groq from 'groq-sdk';

// ============================================
// ✅ CONFIGURATION
// ============================================

const GROQ_API_KEY = 
  process.env.GROQ_API_KEY || 
  process.env.VITE_GROQ_API_KEY || 
  process.env.NEXT_PUBLIC_GROQ_API_KEY;

// ✅ Debug logging (won't expose the key)
console.log('🔍 GROQ_API_KEY Status:');
console.log('  - GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Not set');
console.log('  - VITE_GROQ_API_KEY:', process.env.VITE_GROQ_API_KEY ? '✅ Set' : '❌ Not set');
console.log('  - NEXT_PUBLIC_GROQ_API_KEY:', process.env.NEXT_PUBLIC_GROQ_API_KEY ? '✅ Set' : '❌ Not set');

// ============================================
// ✅ INITIALIZE GROQ
// ============================================

let groq;
try {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing. Please add it to your environment variables.');
  }
  
  groq = new Groq({
    apiKey: GROQ_API_KEY,
  });
  console.log('✅ Groq initialized successfully!');
} catch (error) {
  console.error('❌ Failed to initialize Groq:', error.message);
  groq = null;
}

// ============================================
// ✅ SYSTEM PROMPTS
// ============================================

const getSystemPrompt = (mode = 'planner', companyName = 'Your Company') => {
  if (mode === 'planner') {
    return `You are WanderAI, a professional trip planner for ${companyName}.

**Your Job:** Create detailed, realistic, and enjoyable day-by-day itineraries.

**Your Process:**
1. **Gather information** one question at a time:
   - Destination
   - Travel dates (or duration)
   - Group size & ages
   - Budget (total or per person)
   - Interests (adventure, culture, food, beach, nature, family)
   - Pace (relaxed / balanced / packed)
   - Must-sees or dealbreakers

2. **Generate a structured itinerary** with:
   - Day-by-day breakdown (Morning / Afternoon / Evening)
   - Estimated costs for each activity
   - Meal suggestions
   - Local insider tips
   - Practical info (transport, weather, booking tips)

3. **Always adapt** — if user says "make it cheaper," "add more days," or "I have kids," adjust accordingly.

**Format your itinerary like this:**
---
📍 **Day 1: [Date] — [Theme]**
🌅 **Morning:** [Activity + time]
🌤️ **Afternoon:** [Activity + time]
🌙 **Evening:** [Activity + time]
💰 **Daily Cost:** $XX
💡 **Insider Tip:** [Your unique tip]

[Repeat for all days]

**Total Estimated Cost:** $XXX
**Pro Tips:**
- [Tip 1]
- [Tip 2]
---
Would you like me to adjust anything? ✈️

**Rules:**
- Be realistic about time and budget
- Suggest alternatives when possible
- Flag if something needs advance booking
- Never invent prices — use estimates or say "check with our team"
- Keep responses warm, expert, and enthusiastic`;
  }

  // Chat mode (quick questions)
  return `You are WanderAI, a friendly and knowledgeable travel assistant for ${companyName}.

**Your Job:** Answer travel questions quickly and helpfully.

**Guidelines:**
- Keep responses concise (2-3 sentences for simple questions)
- Provide practical, actionable advice
- Mention local insights when relevant
- If a question needs detailed planning, suggest switching to Trip Planner mode
- Be warm, enthusiastic, and clear

**Examples:**
- "What's the best time to visit Bali?" → "The best time to visit Bali is during the dry season (April-October) when you'll enjoy sunny days and perfect beach weather! 🌴"
- "How do I find cheap flights?" → "Use flight comparison sites like Skyscanner or Google Flights, book 2-3 months in advance, and consider flying mid-week for the best deals! ✈️"`;
};

// ============================================
// ✅ HELPER: Check if trip info is complete
// ============================================

const isTripInfoComplete = (tripState) => {
  if (!tripState) return false;
  
  const hasDestination = tripState.destination && tripState.destination !== 'unknown';
  const hasDuration = tripState.hasDates || tripState.duration;
  const hasBudget = tripState.hasBudget;
  const hasGroup = tripState.hasGroup;
  
  // For a complete trip plan, we need at least destination + duration
  return hasDestination && hasDuration && hasBudget && hasGroup;
};

// ============================================
// ✅ MAIN HANDLER
// ============================================

export default async function handler(req, res) {
  // ===== CORS Headers =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ===== Handle Preflight =====
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ===== Debug Endpoint =====
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      groq_configured: !!groq,
      key_exists: !!GROQ_API_KEY,
      env_keys: Object.keys(process.env).filter(k => k.includes('GROQ')),
      timestamp: new Date().toISOString()
    });
  }

  // ===== Only Allow POST =====
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ===== Parse Request =====
    const { 
      message, 
      history = [], 
      mode = 'planner', 
      tripState = {},
      companyName = 'Your Company'
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ===== Check Groq =====
    if (!groq) {
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'GROQ_API_KEY is missing. Please add it to your environment variables.',
        details: 'Check your .env.local or Vercel environment variables.'
      });
    }

    console.log(`🤖 [${mode.toUpperCase()}] Request:`, message);
    console.log('📊 Trip State:', tripState);

    // ===== Build Messages =====
    const systemPrompt = getSystemPrompt(mode, companyName);
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add trip planning context if in planner mode
    if (mode === 'planner' && tripState) {
      const context = [];
      if (tripState.destination && tripState.destination !== 'unknown') {
        context.push(`Destination: ${tripState.destination}`);
      }
      if (tripState.hasDates) {
        context.push(`Duration: ${tripState.duration || 'specified'}`);
      }
      if (tripState.hasBudget) {
        context.push(`Budget: ${tripState.budget || 'specified'}`);
      }
      if (tripState.hasGroup) {
        context.push(`Group: ${tripState.group || 'specified'}`);
      }
      
      if (context.length > 0) {
        messages.push({
          role: 'system',
          content: `Trip planning context so far:\n${context.join('\n')}`
        });
      }
      
      // If info is complete, tell AI to generate full itinerary
      if (isTripInfoComplete(tripState)) {
        messages.push({
          role: 'system',
          content: 'The user has provided all necessary trip information. Generate a complete, detailed day-by-day itinerary with costs and insider tips.'
        });
      }
    }

    // Add conversation history (last 8 messages for context)
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-8);
      for (const msg of recentHistory) {
        if (msg.text && msg.sender) {
          messages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        }
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    // ===== Determine Max Tokens =====
    // Trip planner needs more tokens for detailed itineraries
    const maxTokens = mode === 'planner' ? 2000 : 500;

    // ===== Call Groq API =====
    console.log('🚀 Calling Groq API...');
    const startTime = Date.now();

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-70b-versatile', // Best for trip planning
      temperature: mode === 'planner' ? 0.7 : 0.5,
      max_tokens: maxTokens,
      top_p: 0.9,
    });

    const endTime = Date.now();
    console.log(`✅ Groq response in ${endTime - startTime}ms`);

    const response = completion.choices[0]?.message?.content || 
      "I'm not sure how to respond to that. Can you ask me something else? 🤔";

    // ===== Check if response is an itinerary (for planner mode) =====
    const isItinerary = mode === 'planner' && (
      response.includes('Day ') || 
      response.includes('📍') || 
      response.includes('itinerary')
    );

    console.log(`📝 Response length: ${response.length} chars, Itinerary: ${isItinerary}`);

    // ===== Return Response =====
    res.status(200).json({ 
      response,
      meta: {
        mode,
        isItinerary,
        tokens: completion.usage?.total_tokens || 0,
        responseTime: endTime - startTime,
        model: 'llama-3.1-70b-versatile'
      }
    });

  } catch (error) {
    console.error('❌ Groq API Error:', error);
    
    // ===== Specific Error Handling =====
    if (error.message?.includes('rate limit') || error.status === 429) {
      return res.status(429).json({ 
        error: 'Too many requests',
        message: 'Please wait a moment and try again.',
        retryAfter: 60
      });
    }
    
    if (error.message?.includes('API key') || error.status === 401) {
      return res.status(401).json({ 
        error: 'API key issue',
        message: 'Please check your GROQ_API_KEY configuration.'
      });
    }
    
    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'The AI service is taking too long. Please try again.'
      });
    }

    // ===== General Error =====
    res.status(500).json({ 
      error: 'Failed to get AI response',
      message: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    });
  }
}