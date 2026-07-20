// src/components/StripePayment.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../lib/supabase';

// ✅ Load Stripe with publishable key (VITE_ is safe for frontend)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ✅ Card styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1a1a2e',
      fontFamily: 'system-ui, -apple-system, sans-serif',
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
};

function CheckoutForm({ bookingId, amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // ✅ Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('🔐 Creating payment intent for booking:', bookingId);
        console.log('💰 Amount:', amount);
        
        // Dynamic API URL (local vs production)
      const apiUrl = import.meta.env.PROD 
  ? '/api/create-payment-intent'
  : 'http://localhost:3000/api/create-payment-intent';

        console.log(`📡 Calling API: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            amount: Math.round(amount * 100), // Convert to cents
            bookingId: bookingId 
          })
        });

        // ✅ Parse response safely
        let data;
        const textResponse = await response.text();
        console.log('📄 Raw response:', textResponse);

        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('❌ Failed to parse JSON:', textResponse);
          throw new Error(`Server returned invalid response. Please try again.`);
        }
        
        // ✅ Check for errors
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
        console.log('✅ Payment intent created:', data.paymentIntentId);
        
      } catch (err) {
        console.error('❌ Error creating payment intent:', err);
        setError(err.message || 'Failed to initialize payment');
        onError?.(err.message);
      } finally {
        setIsInitializing(false);
      }
    };

    if (bookingId && amount) {
      createPaymentIntent();
    } else {
      console.warn('⚠️ Missing bookingId or amount:', { bookingId, amount });
      setError('Missing booking information');
      setIsInitializing(false);
    }
  }, [bookingId, amount, onError]);

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready. Please wait.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('💳 Confirming payment...');
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (stripeError) {
        console.error('❌ Stripe error:', stripeError);
        setError(stripeError.message || 'Payment failed');
        onError?.(stripeError.message);
        return;
      }

      console.log('✅ Payment successful:', paymentIntent);

      // ✅ Update booking status in Supabase
      if (paymentIntent.status === 'succeeded') {
        console.log('📝 Updating booking status for ID:', bookingId);

        const { error: updateError } = await supabase
          .from('tour_bookings')
          .update({ 
            status: 'confirmed', 
            payment_status: 'paid',
            paid_at: new Date().toISOString()
          })
          .eq('id', bookingId);

        if (updateError) {
          console.error('❌ Supabase update error:', updateError);
          // Don't throw - payment succeeded but DB update failed
          // User can still see payment success
          onError?.('Payment succeeded but booking update failed. Please contact support.');
        } else {
          console.log('✅ Booking status updated successfully!');
        }

        // ✅ Call success callback
        onSuccess?.({ 
          bookingId, 
          paymentIntentId: paymentIntent.id 
        });
      }
      
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Retry function
  const handleRetry = () => {
    setRetryCount(retryCount + 1);
    setError('');
    setIsInitializing(true);
    // Re-run the effect
    const createPaymentIntent = async () => {
      try {
        const apiUrl = import.meta.env.PROD 
          ? '/api/create-payment-intent'
          : 'http://localhost:3000/api/create-payment-intent';

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: Math.round(amount * 100),
            bookingId: bookingId 
          })
        });

        const textResponse = await response.text();
        const data = JSON.parse(textResponse);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
        console.log('✅ Payment intent created on retry:', data.paymentIntentId);
        
      } catch (err) {
        console.error('❌ Retry failed:', err);
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setIsInitializing(false);
      }
    };
    createPaymentIntent();
  };

  // ✅ Loading state
  if (isInitializing) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#6b7280',
        background: '#f9fafb',
        borderRadius: '12px'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e5e7eb',
          borderTopColor: '#E88D5C',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>Preparing payment...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // ✅ Success state (handled by parent)
  return (
    <form onSubmit={handleSubmit}>
      {/* Card Element */}
      <div style={{
        padding: '0.75rem',
        border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
        borderRadius: '8px',
        background: 'white',
        marginBottom: '0.5rem',
        transition: 'border-color 0.2s ease'
      }}>
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '0.75rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>❌ {error}</div>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              background: 'transparent',
              border: '1px solid #991b1b',
              color: '#991b1b',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              marginTop: '0.25rem'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Payment Button */}
      <button
        type="submit"
        disabled={!stripe || loading || !clientSecret}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: (!stripe || loading || !clientSecret) 
            ? '#d1d5db' 
            : 'linear-gradient(135deg, #E88D5C, #D97A4A)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: (!stripe || loading || !clientSecret) ? 'not-allowed' : 'pointer',
          opacity: (!stripe || loading || !clientSecret) ? 0.6 : 1,
          transition: 'all 0.3s ease',
          boxShadow: loading ? 'none' : '0 4px 12px rgba(232, 141, 92, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (!loading && stripe && clientSecret) {
            e.target.style.transform = 'scale(1.02)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        {loading ? (
          <span>⏳ Processing...</span>
        ) : (
          <span>💳 Pay ${amount?.toFixed(2)}</span>
        )}
      </button>
    </form>
  );
}

// ✅ Main Component
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
  );
}

export default StripePayment;