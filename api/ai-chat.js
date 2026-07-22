// api/ai-chat.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  // ✅ Allow CORS
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

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 AI Request:', message);

    // ✅ Build conversation history
    const messages = [
      {
        role: 'system',
        content: `You are WanderAI, a friendly and knowledgeable travel assistant for a tour booking platform called Wander AI.
        
        Your role:
        - Help users with travel destinations, tips, and recommendations
        - Answer questions about tours, packages, and travel planning
        - Be enthusiastic, helpful, and engaging
        - Use emojis occasionally to make conversations friendly
        - Keep responses concise (2-3 sentences max)
        - If asked about booking, suggest they browse available packages
        
        You are NOT:
        - A booking system (direct users to the tours page)
        - A payment processor
        - Allowed to give personal or financial advice`
      }
    ];

    // ✅ Add conversation history (last 5 messages)
    if (history && history.length > 0) {
      const recentHistory = history.slice(-5);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      }
    }

    // ✅ Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // ✅ Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 300,
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content || "I'm not sure how to respond to that. Can you ask me something else? 🤔";

    console.log('✅ AI Response:', response);

    res.status(200).json({ 
      response: response
    });

  } catch (error) {
    console.error('❌ Groq API Error:', error);
    res.status(500).json({ 
      error: 'Failed to get AI response. Please try again.',
      details: error.message 
    });
  }
}