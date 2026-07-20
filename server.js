// server.js./api/create-payment-intent.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import createPaymentIntent from './api/create-payment-intent.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Mount the API route
app.post('/api/create-payment-intent', createPaymentIntent);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/create-payment-intent`);
});