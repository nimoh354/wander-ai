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
  const [packageDetails, setPackageDetails] = useState(null)
  const [packageExceeded, setPackageExceeded] = useState(false)
  const [remainingSlots, setRemainingSlots] = useState(0)
  const [maxCapacity, setMaxCapacity] = useState(10)

  useEffect(() => {
    if (packageId) {
      fetchPackageDetails()
      fetchAvailableDates()
    }
  }, [packageId])

  // ✅ Fetch package details with variable capacity
  const fetchPackageDetails = async () => {
    try {
      const { data: packageData, error: packageError } = await supabase
        .from('tour_packages')
        .select('id, name, max_capacity, current_bookings, is_full')
        .eq('id', packageId)
        .single()

      if (packageError) throw packageError

      setPackageDetails(packageData)
      setMaxCapacity(packageData.max_capacity || 10)
      setPackageExceeded(packageData.is_full || false)
      setRemainingSlots((packageData.max_capacity || 10) - (packageData.current_bookings || 0))

    } catch (error) {
      console.error('❌ Error fetching package:', error)
    }
  }

  // ✅ Fetch available dates
  const fetchAvailableDates = async () => {
    try {
      const { data, error } = await supabase
        .from('availability')
        .select('date, slots, booked')
        .eq('package_id', packageId)
        .eq('status', 'available')

      if (error) throw error

      const formattedDates = data?.map(item => ({
        ...item,
        date: new Date(item.date).toISOString().split('T')[0]
      })) || []
      
      setAvailableDates(formattedDates)
    } catch (error) {
      console.error('❌ Error fetching dates:', error)
    }
  }

  // ✅ Check if date has available slots
  const getDateRemainingSlots = (date) => {
    const availability = availableDates.find(a => a.date === date)
    if (!availability) return 0
    return availability.slots - availability.booked
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        setMessage('❌ Please log in to book')
        setLoading(false)
        return
      }

      const userId = currentUser.id

      // ✅ Check if package is full
      if (packageExceeded) {
        setMessage(`❌ This package is fully booked! (${maxCapacity}/${maxCapacity} guests). Please check out our other amazing packages.`)
        setLoading(false)
        return
      }

      // ✅ Validate date
      if (!booking.booking_date) {
        setMessage('❌ Please select a booking date')
        setLoading(false)
        return
      }

      // ✅ Check date availability
      const dateSlots = getDateRemainingSlots(booking.booking_date)
      
      if (dateSlots <= 0) {
        setMessage('❌ This date is fully booked. Please select another date.')
        setLoading(false)
        return
      }

      if (booking.guests > dateSlots) {
        setMessage(`❌ Only ${dateSlots} slot(s) available for this date. Please reduce number of guests.`)
        setLoading(false)
        return
      }

      // ✅ Check total package capacity
      if (booking.guests > remainingSlots) {
        setMessage(`❌ Only ${remainingSlots} slot(s) remaining for this package. Please reduce number of guests.`)
        setLoading(false)
        return
      }

      // ✅ Check if user already booked this date
      const { data: existingBooking, error: checkError } = await supabase
        .from('tour_bookings')
        .select('id')
        .eq('user_id', userId)
        .eq('package_id', packageId)
        .eq('booking_date', booking.booking_date)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle()

      if (existingBooking) {
        setMessage('❌ You already have a booking for this date. Please select another date.')
        setLoading(false)
        return
      }

      // ✅ Create booking
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
        if (error.code === '23505') {
          setMessage('❌ You already have a booking for this date.')
        } else {
          setMessage('❌ Error: ' + error.message)
        }
        setLoading(false)
        return
      }

      console.log('✅ Booking created:', data)

      // ✅ Update availability
      const { error: updateError } = await supabase
        .from('availability')
        .update({ booked: dateSlots + booking.guests })
        .eq('package_id', packageId)
        .eq('date', booking.booking_date)

      if (updateError) {
        console.error('❌ Update availability error:', updateError)
      }

      setBookingData(data?.[0])
      setBookingConfirmed(true)
      setMessage('✅ Booking confirmed!')

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

  return (
    <div>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.75rem' }}>
        📅 Book This Package
      </h4>

      {/* ✅ PACKAGE EXCEEDED BANNER */}
      {packageExceeded ? (
        <div style={{
          background: '#fee2e2',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>🚫</div>
          <h3 style={{ color: '#991b1b', fontWeight: '700', marginBottom: '0.5rem', fontSize: '18px' }}>
            Package Fully Booked!
          </h3>
          <p style={{ color: '#991b1b', fontSize: '14px', marginBottom: '0.5rem' }}>
            This package has reached its maximum capacity of <strong>{maxCapacity}</strong> guests.
          </p>
          <p style={{ color: '#991b1b', fontSize: '13px', marginBottom: '1rem' }}>
            But don't worry! We have other amazing packages waiting for you.
          </p>
          <button
            onClick={() => window.location.href = '/tours'}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.6rem 2rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🌍 Explore Other Packages
          </button>
        </div>
      ) : (
        <>
          {/* ✅ CAPACITY INDICATOR */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '0.25rem' }}>
              <span>Package Capacity</span>
              <span>{remainingSlots} of {maxCapacity} slots remaining</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((maxCapacity - remainingSlots) / maxCapacity) * 100}%`,
                height: '100%',
                background: remainingSlots <= 2 ? '#ef4444' : remainingSlots <= 4 ? '#f59e0b' : '#22c55e',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
            {remainingSlots <= 2 && remainingSlots > 0 && (
              <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '0.25rem' }}>
                ⚠️ Only {remainingSlots} slots left! Book now before it's full.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Date Selection */}
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
              {availableDates.length > 0 && (
                <div style={{ marginTop: '0.25rem', fontSize: '12px', color: '#6b7280' }}>
                  📅 Available: {availableDates.map(d => 
                    `${new Date(d.date).toLocaleDateString()} (${d.slots - d.booked})`
                  ).join(', ')}
                </div>
              )}
            </div>

            {/* Number of Guests */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.25rem' }}>
                Number of Guests *
              </label>
              <input
                type="number"
                value={booking.guests}
                onChange={(e) => setBooking({ ...booking, guests: parseInt(e.target.value) || 1 })}
                min="1"
                max={remainingSlots}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {booking.guests > remainingSlots && (
                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '0.25rem' }}>
                  ⚠️ Only {remainingSlots} slots available
                </p>
              )}
            </div>

            {/* Special Requests */}
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
              disabled={loading || availableDates.length === 0 || remainingSlots === 0}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: (loading || availableDates.length === 0 || remainingSlots === 0)
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (loading || availableDates.length === 0 || remainingSlots === 0) 
                  ? 'not-allowed' 
                  : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Booking...' 
                : remainingSlots === 0 ? '🚫 Package Full' 
                : availableDates.length === 0 ? '📅 No Dates' 
                : '📅 Book Now'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default Booking