import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and bookingId' 
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { bookingId },
      description: `Booking ${bookingId}`
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Payment error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    });
  }
});

// Health check endpoint (optional)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;