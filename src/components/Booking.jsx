import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Booking({ user, packageId, onBookingSuccess }) {
  const [booking, setBooking] = useState({
    booking_date: '',
    guests: 1,
    special_requests: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [availableDates, setAvailableDates] = useState([])
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [bookingData, setBookingData] = useState(null)

  useEffect(() => {
    if (packageId) {
      fetchAvailableDates()
    }
  }, [packageId])

  const fetchAvailableDates = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('date, slots, booked')
        .eq('package_id', packageId)
        .filter('slots', 'gt', 0)

      if (error) {
        console.error('❌ Availability error:', error)
        return
      }
      
      // Format dates for comparison
      const formattedDates = data?.map(item => ({
        ...item,
        date: new Date(item.date).toISOString().split('T')[0]
      })) || []
      
      setAvailableDates(formattedDates)
      console.log('📅 Available dates:', formattedDates)
    } catch (err) {
      console.error('❌ Fetch error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        setMessage('❌ Please log in to book')
        setLoading(false)
        return
      }

      const userId = currentUser?.id || user?.id

      console.log('👤 Current user ID:', userId)
      console.log('📦 Package ID:', packageId)
      console.log('📅 Selected date:', booking.booking_date)
      console.log('👥 Guests:', booking.guests)

      if (!userId) {
        setMessage('❌ Please log in to book')
        setLoading(false)
        return
      }

      if (!packageId) {
        setMessage('❌ Package not found')
        setLoading(false)
        return
      }

      // ✅ Check if the selected date is valid
      const availabilityCheck = availableDates.find(
        a => a.date === booking.booking_date
      )

      console.log('🔍 Date check:', { 
        selectedDate: booking.booking_date, 
        availableDates: availableDates.map(a => a.date),
        match: availabilityCheck 
      })

      if (!availabilityCheck) {
        setMessage('❌ Please select a date from the available options')
        setLoading(false)
        return
      }

      if (availabilityCheck.slots <= availabilityCheck.booked) {
        setMessage('❌ No slots available for this date')
        setLoading(false)
        return
      }

      // ✅ Insert booking
      const { data, error } = await supabase
        .from('tour_bookings')
        .insert({
          package_id: packageId,
          user_id: userId,
          booking_date: booking.booking_date,
          guests: booking.guests,
          special_requests: booking.special_requests || null,
          status: 'pending',
          total_price: 0
        })
        .select()

      if (error) {
        console.error('❌ Supabase insert error:', error)
        setMessage('❌ Error creating booking: ' + error.message)
        setLoading(false)
        return
      }

      console.log('✅ Booking created:', data)

      // Update availability
      const { error: updateError } = await supabase
        .from('availability')
        .update({ booked: availabilityCheck.booked + booking.guests })
        .eq('date', booking.booking_date)
        .eq('package_id', packageId)

      if (updateError) {
        console.error('❌ Update availability error:', updateError)
      }

      setBookingData(data?.[0])
      setBookingConfirmed(true)
      setMessage('✅ Booking confirmed!')

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bookingCreated'))
        localStorage.setItem('lastBookingCreated', JSON.stringify({ id: data?.[0]?.id, timestamp: Date.now() }))
      }

      if (onBookingSuccess) {
        onBookingSuccess(data?.[0])
      }

    } catch (error) {
      console.error('❌ Booking error:', error)
      setMessage('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (bookingConfirmed) {
    return (
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        border: '1px solid #22c55e',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '0.5rem' }}>✅</span>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e', marginBottom: '0.5rem' }}>
          Booking Confirmed!
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
          Your booking has been confirmed successfully.
        </p>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          📅 {new Date(bookingData?.booking_date).toLocaleDateString()} • 👥 {bookingData?.guests} guests
        </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            marginTop: '1rem',
            padding: '0.6rem 1.5rem',
            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.75rem' }}>
        📅 Book This Package
      </h4>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.25rem' }}>
            Select Date *
          </label>
          <input
            type="date"
            value={booking.booking_date}
            onChange={(e) => setBooking({ ...booking, booking_date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer'
            }}
          />
          {availableDates.length > 0 ? (
            <div style={{ marginTop: '0.25rem', fontSize: '11px', color: '#6b7280' }}>
              📅 Available dates: {availableDates.map(d => new Date(d.date).toLocaleDateString()).join(', ')}
            </div>
          ) : (
            <div style={{ marginTop: '0.25rem', fontSize: '11px', color: '#ef4444' }}>
              ⚠️ No dates available for this package
            </div>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.25rem' }}>
            Number of Guests *
          </label>
          <input
            type="number"
            value={booking.guests}
            onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) || 1 })}
            min="1"
            max="20"
            required
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.25rem' }}>
            Special Requests
          </label>
          <textarea
            value={booking.special_requests}
            onChange={(e) => setBooking({ ...booking, special_requests: e.target.value })}
            rows="2"
            style={{
              width: '100%',
              padding: '0.6rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            placeholder="Any special requests?"
          />
        </div>

        {message && (
          <div style={{
            padding: '0.5rem',
            marginBottom: '0.75rem',
            borderRadius: '8px',
            background: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
            color: message.includes('✅') ? '#22c55e' : '#ef4444',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.6rem',
            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'scale(1.01)'
              e.target.style.boxShadow = '0 4px 12px rgba(232, 141, 92, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          {loading ? 'Booking...' : '📅 Book Now'}
        </button>
      </form>
    </div>
  )
}

export default Booking