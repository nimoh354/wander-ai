// src/components/Booking.jsx
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
  const [maxGuests, setMaxGuests] = useState(10)
  const [packageName, setPackageName] = useState('')
  const [totalRemainingSlots, setTotalRemainingSlots] = useState(0)

  useEffect(() => {
    if (packageId) {
      fetchPackageDetails()
      fetchAvailableDates()
    }
  }, [packageId])

  // ✅ Fetch package details
  const fetchPackageDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('tour_packages')
        .select('id, name, max_guests')
        .eq('id', packageId)
        .single()

      if (error) throw error

      setPackageName(data.name)
      setMaxGuests(data.max_guests || 10)
    } catch (error) {
      console.error('❌ Error fetching package:', error)
    }
  }

  // ✅ Fetch available dates and calculate remaining slots
  const fetchAvailableDates = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      console.log('📅 Fetching dates for package:', packageId)

      const { data, error } = await supabase
        .from('availability')
        .select('date, slots, booked')
        .eq('package_id', packageId)
        .eq('status', 'available')
        .gte('date', today)
        .order('date', { ascending: true })

      if (error) {
        console.error('❌ Error fetching dates:', error)
        return
      }

      // ✅ Calculate remaining slots for each date
      const formattedDates = data?.map(item => {
        const remaining = (item.slots || 0) - (item.booked || 0)
        return {
          ...item,
          date: new Date(item.date).toISOString().split('T')[0],
          remainingSlots: remaining > 0 ? remaining : 0,
          isFullyBooked: remaining <= 0
        }
      }) || []
      
      console.log('📅 Formatted dates:', formattedDates)
      
      setAvailableDates(formattedDates)

      // ✅ Calculate total remaining slots, CAPPED at max_guests
      const total = formattedDates.reduce((sum, d) => sum + d.remainingSlots, 0)
      const cappedTotal = Math.min(total, maxGuests)  // ✅ Cap at package capacity
      
      console.log('📊 Total slots:', total)
      console.log('📊 Capped at max_guests:', cappedTotal)
      
      setTotalRemainingSlots(cappedTotal)

    } catch (error) {
      console.error('❌ Error fetching dates:', error)
    }
  }

  // ✅ Get available dates with slots
  const getAvailableDatesWithSlots = () => {
    const today = new Date().toISOString().split('T')[0]
    return availableDates
      .filter(item => item.date >= today)
      .filter(item => item.remainingSlots > 0)
  }

  // ✅ Get fully booked dates
  const getFullyBookedDates = () => {
    const today = new Date().toISOString().split('T')[0]
    return availableDates
      .filter(item => item.date >= today)
      .filter(item => item.remainingSlots <= 0)
      .map(item => item.date)
  }

  // ✅ Get remaining slots for a specific date
  const getDateRemainingSlots = (date) => {
    const availability = availableDates.find(a => a.date === date)
    if (!availability) return 0
    return availability.remainingSlots > 0 ? availability.remainingSlots : 0
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
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        setMessage('❌ Please log in to book')
        setLoading(false)
        return
      }

      const userId = currentUser.id

      // ✅ Validate date
      if (!booking.booking_date) {
        setMessage('❌ Please select a booking date')
        setLoading(false)
        return
      }

      // ✅ Check if date is in the past
      const today = new Date().toISOString().split('T')[0]
      if (booking.booking_date < today) {
        setMessage('❌ Cannot book past dates. Please select a future date.')
        setLoading(false)
        return
      }

      // ✅ Check if date exists in available dates
      const dateData = availableDates.find(a => a.date === booking.booking_date)
      if (!dateData) {
        setMessage('❌ This date is not available for booking.')
        setLoading(false)
        return
      }

      // ✅ Check date availability
      const dateSlots = dateData.remainingSlots
      
      console.log('🔍 Date:', booking.booking_date)
      console.log('🔍 Available slots for this date:', dateSlots)
      
      if (dateSlots <= 0) {
        setMessage('❌ This date is fully booked. Please select another date.')
        setLoading(false)
        return
      }

      if (booking.guests > dateSlots) {
        setMessage(`❌ Only ${dateSlots} slot(s) available for this date.`)
        setLoading(false)
        return
      }

      // ✅ Check if user already booked this date
      const hasExistingBooking = await userHasBookingOnDate(userId, booking.booking_date)
      if (hasExistingBooking) {
        setMessage('❌ You already have a booking for this date.')
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

      // ✅ Update availability table - increment booked count
      const newBookedCount = dateData.booked + booking.guests
      const { error: updateError } = await supabase
        .from('availability')
        .update({ 
          booked: newBookedCount,
          is_fully_booked: newBookedCount >= dateData.slots
        })
        .eq('package_id', packageId)
        .eq('date', booking.booking_date)

      if (updateError) {
        console.error('❌ Update availability error:', updateError)
      }

      // ✅ Update tour_packages current_bookings
      const { error: updatePackageError } = await supabase
        .from('tour_packages')
        .update({ 
          current_bookings: supabase.raw('current_bookings + ?', [booking.guests])
        })
        .eq('id', packageId)

      if (updatePackageError) {
        console.error('❌ Update package error:', updatePackageError)
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

  const availableDatesWithSlots = getAvailableDatesWithSlots()
  const fullyBookedDates = getFullyBookedDates()

  return (
    <div>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.75rem' }}>
        📅 Book This Package
      </h4>

      {totalRemainingSlots <= 0 && availableDates.length > 0 ? (
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
            All dates for this package are fully booked.
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
      ) : availableDates.length === 0 ? (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '0.5rem' }}>📅</div>
          <h3 style={{ color: '#92400e', fontWeight: '700', marginBottom: '0.5rem', fontSize: '18px' }}>
            No Dates Available
          </h3>
          <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '0.5rem' }}>
            This package has no available dates for booking.
          </p>
          <button
            onClick={() => window.location.href = '/tours'}
            style={{
              background: '#f59e0b',
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
          {/* ✅ Capacity Indicator - Shows CAPPED slots */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginBottom: '0.25rem' }}>
              <span>Available Slots</span>
              <span>{totalRemainingSlots} of {maxGuests} slots remaining</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min((totalRemainingSlots / maxGuests) * 100, 100)}%`,
                height: '100%',
                background: totalRemainingSlots <= 2 ? '#ef4444' : totalRemainingSlots <= 4 ? '#f59e0b' : '#22c55e',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
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
              {availableDatesWithSlots.length > 0 && (
                <div style={{ marginTop: '0.25rem', fontSize: '12px', color: '#6b7280' }}>
                  ✅ Available: {availableDatesWithSlots.map(d => 
                    `${new Date(d.date).toLocaleDateString()} (${d.remainingSlots} slots)`
                  ).join(', ')}
                </div>
              )}
              {fullyBookedDates.length > 0 && (
                <div style={{ marginTop: '0.25rem', fontSize: '12px', color: '#ef4444' }}>
                  🔴 Fully booked: {fullyBookedDates.map(d => 
                    new Date(d).toLocaleDateString()
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
                max={totalRemainingSlots > 0 ? totalRemainingSlots : 1}
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
              disabled={loading || availableDatesWithSlots.length === 0 || totalRemainingSlots <= 0}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: (loading || availableDatesWithSlots.length === 0 || totalRemainingSlots <= 0)
                  ? '#d1d5db' 
                  : 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (loading || availableDatesWithSlots.length === 0 || totalRemainingSlots <= 0) 
                  ? 'not-allowed' 
                  : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? 'Booking...' 
                : totalRemainingSlots <= 0 ? '🚫 Package Full' 
                : availableDatesWithSlots.length === 0 ? '📅 No Dates Available' 
                : '📅 Book Now'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default Booking