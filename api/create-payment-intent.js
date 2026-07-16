// api/create-payment-intent.js
import Stripe from 'stripe'

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // ✅ Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { amount, bookingId } = req.body

    // ✅ Validate inputs
    if (!amount || !bookingId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and bookingId' 
      })
    }

    // ✅ Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { bookingId },
      description: `Booking ${bookingId}`
    })

    // ✅ Return client secret
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('❌ Payment error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    })
  }
}