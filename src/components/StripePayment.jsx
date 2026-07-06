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
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
  const [paymentStatus, setPaymentStatus] = useState('')
  const [timeoutReached, setTimeoutReached] = useState(false)

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('🔐 Creating payment intent for booking:', bookingId)
        console.log('💰 Amount (in cents):', Math.round(amount * 100))
        
        const response = await fetch('http://localhost:3001/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: Math.round(amount * 100),
            bookingId: bookingId 
          })
        })

        console.log('📡 Response status:', response.status)
        const data = await response.json()
        console.log('📦 Response data:', data)
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent')
        }

        setClientSecret(data.clientSecret)
        console.log('✅ Payment intent created, clientSecret set')
      } catch (err) {
        console.error('❌ Error creating payment intent:', err)
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
      console.warn('⚠️ Missing bookingId or amount:', { bookingId, amount })
    }
  }, [bookingId, amount])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🔄 Form submitted')
    console.log('🔐 Stripe ready?', !!stripe)
    console.log('📋 Elements ready?', !!elements)
    console.log('🔑 Client secret?', !!clientSecret)
    
    if (!stripe || !elements || !clientSecret) {
      const msg = 'Payment system not ready'
      console.error('❌', msg)
      setError(msg)
      return
    }

    setLoading(true)
    setError('')
    setPaymentStatus('Validating card...')
    setTimeoutReached(false)

    // Set a timeout to detect if payment gets stuck
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Payment confirmation taking too long...')
      setTimeoutReached(true)
      setPaymentStatus('Payment is taking longer than expected...')
    }, 15000) // 15 seconds

    try {
      const cardElement = elements.getElement(CardElement)
      console.log('💳 Card element exists?', !!cardElement)
      
      setPaymentStatus('Confirming payment with Stripe...')
      console.log('⏳ Calling stripe.confirmCardPayment...')
      
      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      clearTimeout(timeoutId)
      console.log('✅ Stripe confirmCardPayment returned:', result)

      if (result.error) {
        console.error('❌ Stripe error:', result.error)
        console.error('❌ Error code:', result.error.code)
        console.error('❌ Error message:', result.error.message)
        setError(result.error.message)
        onError?.(result.error.message)
        setLoading(false)
        return
      }

      const paymentIntent = result.paymentIntent
      console.log('✅ Payment successful:', paymentIntent)
      console.log('📊 Payment status:', paymentIntent.status)

      if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('Payment successful! Updating booking...')
        
        // Update booking in Supabase
        console.log('📝 Updating booking in Supabase...')
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
          throw new Error('Failed to update booking status: ' + updateError.message)
        }

        console.log('✅ Booking updated successfully!')
        setPaymentStatus('Booking confirmed!')
        onSuccess?.({ bookingId, paymentIntentId: paymentIntent.id })
      } else {
        console.warn('⚠️ Payment not succeeded, status:', paymentIntent.status)
        setError(`Payment status: ${paymentIntent.status}`)
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('❌ Payment error:', err)
      console.error('❌ Error stack:', err.stack)
      setError(err.message || 'Unknown payment error')
      onError?.(err.message)
    } finally {
      setLoading(false)
      console.log('🏁 Payment flow completed')
    }
  }

  // Handle timeout retry
  const handleRetry = () => {
    console.log('🔄 Retrying payment...')
    setError('')
    setPaymentStatus('')
    setTimeoutReached(false)
    // Re-submit the form
    handleSubmit(new Event('submit'))
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

      {/* Payment guide */}
      <div style={{
        padding: '0.5rem',
        background: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#166534',
        marginBottom: '0.5rem'
      }}>
        💳 <strong>Test Card:</strong> 4242 4242 4242 4242<br />
        📅 <strong>Expiry:</strong> Any future date (e.g., 12/26)<br />
        🔐 <strong>CVC:</strong> Any 3 digits (e.g., 123)
      </div>

      {paymentStatus && !error && !loading && (
        <div style={{
          padding: '0.5rem',
          marginBottom: '0.5rem',
          background: '#eff6ff',
          border: '1px solid #93c5fd',
          borderRadius: '6px',
          color: '#1e40af',
          fontSize: '13px'
        }}>
          {paymentStatus}
        </div>
      )}

      {loading && (
        <div style={{
          padding: '0.5rem',
          marginBottom: '0.5rem',
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '6px',
          color: '#92400e',
          fontSize: '13px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          ⏳ {paymentStatus || 'Processing payment...'}
          {timeoutReached && (
            <div style={{ marginTop: '0.5rem', fontSize: '12px' }}>
              ⚠️ This is taking longer than expected. 
              <button
                type="button"
                onClick={handleRetry}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.2rem 0.75rem',
                  background: '#92400e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

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
          <button
            type="button"
            onClick={() => setError('')}
            style={{
              marginLeft: '0.5rem',
              padding: '0.1rem 0.5rem',
              background: '#991b1b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: loading ? '#94a3b8' : 'linear-gradient(135deg, #E88D5C, #D97A4A)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: (!stripe || loading || !clientSecret) ? 'not-allowed' : 'pointer',
          opacity: (!stripe || loading || !clientSecret) ? 0.6 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {loading ? '⏳ Processing...' : `💳 Pay $${amount.toFixed(2)}`}
      </button>

      {loading && (
        <button
          type="button"
          onClick={() => {
            setLoading(false)
            setError('Payment cancelled by user')
            setPaymentStatus('')
          }}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginTop: '0.5rem',
            background: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Cancel Payment
        </button>
      )}
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