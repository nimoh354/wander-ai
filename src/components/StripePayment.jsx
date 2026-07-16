// src/components/StripePayment.jsx
import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '../lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a2e',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: true,
}

function CheckoutForm({ bookingId, amount, onSuccess, onError }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('🔐 Creating payment intent for booking:', bookingId)
        
        // ✅ Use local server for development, Vercel for production
        const apiUrl = import.meta.env.PROD 
          ? '/api/create-payment-intent'  // Vercel serverless function
          : 'http://localhost:3001/api/create-payment-intent'  // Local server

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: Math.round(amount * 100),
            bookingId: bookingId 
          })
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent')
        }

        setClientSecret(data.clientSecret)
        console.log('✅ Payment intent created')
      } catch (err) {
        console.error('❌ Error:', err)
        setError(err.message)
        onError?.(err.message)
      } finally {
        setIsInitializing(false)
      }
    }

    if (bookingId && amount) {
      createPaymentIntent()
    } else {
      setIsInitializing(false)
    }
  }, [bookingId, amount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready')
      return
    }

    setLoading(true)
    setError('')

    try {
      const cardElement = elements.getElement(CardElement)
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (stripeError) {
        console.error('❌ Stripe error:', stripeError)
        setError(stripeError.message)
        onError?.(stripeError.message)
        return
      }

      console.log('✅ Payment successful:', paymentIntent)

      if (paymentIntent.status === 'succeeded') {
        const { error: updateError } = await supabase
          .from('tour_bookings')
          .update({ 
            status: 'confirmed', 
            payment_status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', bookingId)

        if (updateError) {
          console.error('❌ Update error:', updateError)
          throw new Error('Failed to update booking status')
        }

        onSuccess?.({ bookingId, paymentIntentId: paymentIntent.id })
      }
    } catch (err) {
      console.error('❌ Payment error:', err)
      setError(err.message)
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (isInitializing) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
        ⏳ Preparing payment...
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        padding: '0.75rem',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        background: 'white',
        marginBottom: '0.5rem'
      }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {error && (
        <div style={{
          padding: '0.5rem',
          marginBottom: '0.5rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: (!stripe || loading || !clientSecret) ? 'not-allowed' : 'pointer',
          opacity: (!stripe || loading || !clientSecret) ? 0.6 : 1
        }}
      >
        {loading ? '⏳ Processing...' : `💳 Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  )
}

function StripePayment({ bookingId, amount, onSuccess, onError }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        bookingId={bookingId} 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError} 
      />
    </Elements>
  )
}

export default StripePayment