// server.js
import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY)

// Enable CORS for local development
app.use(cors({
  origin: ['http://localhost:5173', 'https://wander-ai-lovat.vercel.app'],
  methods: ['POST', 'GET', 'OPTIONS'],
  credentials: true
}))

app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Payment server is running' })
})

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, bookingId } = req.body

    if (!amount || !bookingId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount and bookingId' 
      })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { bookingId },
      description: `Booking ${bookingId}`
    })

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id 
    })
  } catch (error) {
    console.error('❌ Payment error:', error)
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`💳 Payment server running on http://localhost:${PORT}`)
})