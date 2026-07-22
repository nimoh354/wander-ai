// api/ai-chat.js
import Groq from 'groq-sdk';

// ✅ Initialize Groq with API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ✅ For local development
if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY is not set');
}

export default async function handler(req, res) {
  // ✅ Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    // ✅ Validate input
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 AI Request:', message);

    // ✅ Build conversation
    const messages = [
      {
        role: 'system',
        content: `You are WanderAI, a friendly travel assistant. Help users with travel destinations, tips, and recommendations. Keep responses concise (2-3 sentences) and friendly.`
      }
    ];

    // ✅ Add history (last 5 messages)
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

    // ✅ Call Groq API
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
    
    // ✅ Send more detailed error
    res.status(500).json({ 
      error: error.message || 'Failed to get AI response',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}