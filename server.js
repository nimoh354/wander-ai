// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ✅ Get the absolute path to your project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Load .env from the exact location
const envPath = join(__dirname, '.env');
console.log(`📁 Looking for .env at: ${envPath}`);

// ✅ Load .env
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ .env loaded successfully!');
}

// ✅ Check if Stripe key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set');
  console.error('📝 Please add STRIPE_SECRET_KEY to your .env file');
  console.error(`📁 .env path: ${envPath}`);
} else {
  console.log('✅ STRIPE_SECRET_KEY found!');
}

// ✅ Check if Groq API key exists
if (!process.env.GROQ_API_KEY) {
  console.warn('⚠️ GROQ_API_KEY is not set');
  console.warn('📝 Please add GROQ_API_KEY to your .env file for AI features');
} else {
  console.log('✅ GROQ_API_KEY found!');
}

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Import handlers
import stripeHandler from './api/create-payment-intent.js';
import aiChatHandler from './api/ai-chat.js';

// ✅ Stripe Payment endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    await stripeHandler(req, res);
  } catch (error) {
    console.error('❌ Error in payment handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ AI Chat endpoint
app.post('/api/ai-chat', async (req, res) => {
  try {
    await aiChatHandler(req, res);
  } catch (error) {
    console.error('❌ Error in AI chat handler:', error);
    res.status(500).json({ error: 'AI service unavailable' });
  }
});

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    groq_configured: !!process.env.GROQ_API_KEY,
    env_file: envPath
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});