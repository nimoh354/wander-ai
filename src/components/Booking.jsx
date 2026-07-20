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
  const [existingBookings, setExistingBookings] = useState([])

  useEffect(() => {
    if (packageId) {
      fetchAvailableDates()
      fetchExistingBookings()
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
      
      const formattedDates = data?.map(item => ({
        ...item,
        date: new Date(item.date).toISOString().split('T')[0]
      })) || []
      
      setAvailableDates(formattedDates)
    } catch (err) {
      console.error('❌ Fetch error:', err)
    }
  }

  // ✅ Fetch existing bookings to check for conflicts
  const fetchExistingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_bookings')
        .select('booking_date, guests, status, user_id')
        .eq('package_id', packageId)
        .in('status', ['pending', 'confirmed']) // Check pending AND confirmed bookings

      if (error) {
        console.error('❌ Error fetching bookings:', error)
        return
      }

      setExistingBookings(data || [])
    } catch (err) {
      console.error('❌ Fetch error:', err)
    }
  }

  // ✅ Check if date is fully booked
  const isDateFullyBooked = (date) => {
    // Check availability slots
    const availability = availableDates.find(a => a.date === date)
    if (!availability) return true // No availability for this date
    
    // Check if slots are full
    if (availability.slots <= availability.booked) return true

    // Check existing bookings for this date
    const bookingsOnDate = existingBookings.filter(b => b.booking_date === date)
    const totalBooked = bookingsOnDate.reduce((sum, b) => sum + b.guests, 0)
    
    // Check if adding new guests would exceed capacity
    const availableSlots = availability.slots - availability.booked - totalBooked
    if (availableSlots <= 0) return true

    return false
  }

  // ✅ Get remaining slots for a date
  const getRemainingSlots = (date) => {
    const availability = availableDates.find(a => a.date === date)
    if (!availability) return 0

    const bookingsOnDate = existingBookings.filter(b => b.booking_date === date)
    const totalBooked = bookingsOnDate.reduce((sum, b) => sum + b.guests, 0)
    
    return availability.slots - availability.booked - totalBooked
  }

  // ✅ Check if user already has booking for this date
  const userHasBookingOnDate = async (userId, date) => {
    const { data, error } = await supabase
      .from('tour_bookings')
      .select('id, status')
      .eq('user_id', userId)
      .eq('package_id', packageId)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle()

    if (error) {
      console.error('❌ Error checking user booking:', error)
      return false
    }

    return !!data
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Get current user
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        setMessage('❌ Please log in to book')
        setLoading(false)
        return
      }

      const userId = currentUser.id

      console.log('👤 User ID:', userId)
      console.log('📦 Package ID:', packageId)
      console.log('📅 Selected date:', booking.booking_date)
      console.log('👥 Guests:', booking.guests)

      // ✅ Validate inputs
      if (!packageId) {
        setMessage('❌ Package not found')
        setLoading(false)
        return
      }

      if (!booking.booking_date) {
        setMessage('❌ Please select a booking date')
        setLoading(false)
        return
      }

      // ✅ Check if date is valid
      const availabilityCheck = availableDates.find(
        a => a.date === booking.booking_date
      )

      if (!availabilityCheck) {
        setMessage('❌ Please select a date from the available options')
        setLoading(false)
        return
      }

      // ✅ Check if date is fully booked
      const remainingSlots = getRemainingSlots(booking.booking_date)
      
      if (remainingSlots <= 0) {
        setMessage('❌ This date is fully booked. Please select another date.')
        setLoading(false)
        return
      }

      if (booking.guests > remainingSlots) {
        setMessage(`❌ Only ${remainingSlots} slot(s) available for this date. Please reduce number of guests.`)
        setLoading(false)
        return
      }

      // ✅ Check if user already has a booking for this date
      const hasExistingBooking = await userHasBookingOnDate(userId, booking.booking_date)
      
      if (hasExistingBooking) {
        setMessage('❌ You already have a booking for this date. Please select another date.')
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

      // ✅ Handle database errors
      if (error) {
        console.error('❌ Supabase insert error:', error)
        
        // Check for duplicate booking error (unique constraint)
        if (error.code === '23505') {
          setMessage('❌ You already have a booking for this date. Please select another date.')
        } else {
          setMessage('❌ Error creating booking: ' + error.message)
        }
        setLoading(false)
        return
      }

      console.log('✅ Booking created:', data)

      // ✅ Update availability
      const { error: updateError } = await supabase
        .from('availability')
        .update({ booked: availabilityCheck.booked + booking.guests })
        .eq('date', booking.booking_date)
        .eq('package_id', packageId)

      if (updateError) {
        console.error('❌ Update availability error:', updateError)
        // Don't fail the booking if availability update fails
      }

      setBookingData(data?.[0])
      setBookingConfirmed(true)
      setMessage('✅ Booking confirmed!')

      // ✅ Trigger events
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('bookingCreated'))
        localStorage.setItem('lastBookingCreated', JSON.stringify({ 
          id: data?.[0]?.id, 
          timestamp: Date.now() 
        }))
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

  // ✅ Reset booking state
  const resetBooking = () => {
    setBooking({
      booking_date: '',
      guests: 1,
      special_requests: ''
    })
    setBookingConfirmed(false)
    setBookingData(null)
    setMessage('')
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
          📅 {bookingData?.booking_date ? new Date(bookingData.booking_date).toLocaleDateString() : 'Date TBD'} 
          • 👥 {bookingData?.guests || 1} guests
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
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
            ← My Dashboard
          </button>
          <button
            onClick={resetBooking}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'transparent',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Book Another Tour
          </button>
        </div>
      </div>
    )
  }

  // ✅ Get available dates with remaining slots for display
  const availableDatesWithSlots = availableDates
    .filter(date => !isDateFullyBooked(date.date))
    .map(date => ({
      ...date,
      remainingSlots: getRemainingSlots(date.date)
    }))

  // ✅ Get full dates (fully booked)
  const fullyBookedDates = availableDates
    .filter(date => isDateFullyBooked(date.date))
    .map(date => date.date)

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
          
          {/* Show available dates */}
          {availableDatesWithSlots.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '0.25rem' }}>
                ✅ Available dates:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {availableDatesWithSlots.map(d => (
                  <span 
                    key={d.date}
                    style={{
                      fontSize: '10px',
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {new Date(d.date).toLocaleDateString()} 
                    <span style={{ fontWeight: 'bold' }}> ({d.remainingSlots})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Show fully booked dates */}
          {fullyBookedDates.length > 0 && (
            <div style={{ marginTop: '0.25rem' }}>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '0.25rem' }}>
                🔴 Fully booked:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {fullyBookedDates.map(date => (
                  <span 
                    key={date}
                    style={{
                      fontSize: '10px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {new Date(date).toLocaleDateString()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {availableDates.length === 0 && (
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
            placeholder="Any special requests? (dietary needs, accessibility, etc.)"
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
          disabled={loading || availableDates.length === 0}
          style={{
            width: '100%',
            padding: '0.6rem',
            background: availableDates.length === 0 
              ? '#d1d5db' 
              : 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: availableDates.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!loading && availableDates.length > 0) {
              e.target.style.transform = 'scale(1.01)'
              e.target.style.boxShadow = '0 4px 12px rgba(232, 141, 92, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          {loading ? 'Booking...' : availableDates.length === 0 ? 'No Dates Available' : '📅 Book Now'}
        </button>
      </form>
    </div>
  )
}

export default Booking