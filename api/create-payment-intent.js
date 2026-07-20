// api/create-payment-intent.js
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Use STRIPE_SECRET_KEY (no VITE_ for backend)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY);

console.log('🔑 Stripe configured:', !!stripe);

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
    const { amount, bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({
        error: 'Missing required fields: amount and bookingId'
      });
    }

    console.log(`💳 Creating payment intent: $${(amount/100).toFixed(2)}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { bookingId },
      description: `Booking ${bookingId}`
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('❌ Payment error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create payment intent'
    });
  }
}