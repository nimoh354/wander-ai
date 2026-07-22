// api/ai-chat.js
import Groq from 'groq-sdk';

// ✅ Try multiple ways to get the API key
const GROQ_API_KEY = 
  process.env.GROQ_API_KEY || 
  process.env.VITE_GROQ_API_KEY || 
  process.env.NEXT_PUBLIC_GROQ_API_KEY;

// ✅ Debug: Log what's happening (won't show key)
console.log('🔍 GROQ_API_KEY check:');
console.log('  - process.env.GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Not set');
console.log('  - process.env.VITE_GROQ_API_KEY:', process.env.VITE_GROQ_API_KEY ? '✅ Set' : '❌ Not set');

// ✅ If no key found, use a fallback (for testing only!)
// ⚠️ WARNING: Only do this if you're stuck!
if (!GROQ_API_KEY) {
  console.error('❌ No Groq API key found!');
  // For debugging, you can hardcode temporarily:
  // const GROQ_API_KEY = 'gsk_xxxxxxxxxxxx'; // ⚠️ Remove after testing!
}

// ✅ Initialize Groq
let groq;
try {
  groq = new Groq({
    apiKey: GROQ_API_KEY,
  });
  console.log('✅ Groq initialized successfully!');
} catch (error) {
  console.error('❌ Failed to initialize Groq:', error.message);
  groq = null;
}

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Debug endpoint - check if key is set
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      groq_configured: !!groq,
      key_exists: !!GROQ_API_KEY,
      env_keys: Object.keys(process.env).filter(k => k.includes('GROQ'))
    });
  }

  // ✅ Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ✅ Check if Groq is initialized
    if (!groq) {
      return res.status(500).json({ 
        error: 'AI service not configured',
        message: 'GROQ_API_KEY is missing. Please add it to your environment variables.'
      });
    }

    console.log('🤖 AI Request:', message);

    const messages = [
      {
        role: 'system',
        content: `You are WanderAI, a friendly travel assistant. Help users with travel destinations, tips, and recommendations. Keep responses concise (2-3 sentences) and friendly.`
      }
    ];

    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-5);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    }

    messages.push({
      role: 'user',
      content: message
    });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || "I'm not sure how to respond to that. Can you ask me something else? 🤔";

    console.log('✅ AI Response:', response);

    res.status(200).json({ response });

  } catch (error) {
    console.error('❌ Groq API Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get AI response'
    });
  }
}