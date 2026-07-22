// api/ai-chat.js
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🤖 AI Request:', message);

    const messages = [
      {
        role: 'system',
        content: `You are WanderAI, a friendly and knowledgeable travel assistant. Help users with travel destinations, tips, and recommendations. Keep responses concise and friendly.`
      }
    ];

    if (history && history.length > 0) {
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

    // ✅ USE A WORKING MODEL
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