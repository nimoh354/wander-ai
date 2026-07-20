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

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Import handler
import handler from './api/create-payment-intent.js';

app.post('/api/create-payment-intent', async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('❌ Error in handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stripe_configured: !!process.env.STRIPE_SECRET_KEY,
    env_file: envPath
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not configured'}`);
});