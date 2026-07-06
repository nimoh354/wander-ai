import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import StripePayment from './StripePayment'

function UserBookings({ user }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [user?.id]) // ✅ Re-fetch when user changes

  const fetchBookings = async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID available')
      setLoading(false)
      return
    }

    setLoading(true)
    console.log('🔍 Fetching bookings for user:', user.id)

    // ✅ Get all bookings for this user
    const { data, error } = await supabase
      .from('tour_bookings')
      .select(`
        *,
        tour_packages (
          id,
          name,
          price,
          description
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('📊 Bookings found:', data?.length || 0)
    console.log('📊 Booking data:', data)
    console.log('❌ Error:', error)

    if (!error) {
      setBookings(data || [])
    } else {
      console.error('❌ Fetch error:', error)
    }
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#F59E0B'
      case 'confirmed': return '#22C55E'
      case 'paid': return '#8B5CF6'
      case 'cancelled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading your bookings...</p>
  }

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        fontFamily: "'Playfair Display', serif",
        color: '#1a1a2e',
        marginBottom: '1.5rem'
      }}>
        📋 My Bookings ({bookings.length})
      </h2>

      {bookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280',
          background: 'white',
          borderRadius: '16px',
          border: '1px dashed rgba(26, 43, 60, 0.1)'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>📋</span>
          <p>You haven't made any bookings yet.</p>
          <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>
            Go to a tour package and click "Book Now"!
          </p>
        </div>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} style={{
            background: 'white',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid rgba(26, 43, 60, 0.06)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '1rem',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  🏝️ {booking.tour_packages?.name || 'Unknown Package'}
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '13px',
                  color: '#6b7280',
                  flexWrap: 'wrap'
                }}>
                  <span>📅 {new Date(booking.booking_date).toLocaleDateString()}</span>
                  <span>👥 {booking.guests} guests</span>
                  <span>💰 ${booking.total_price || booking.tour_packages?.price || 0}</span>
                  <span>📌 {booking.status || 'pending'}</span>
                </div>
                {booking.special_requests && (
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                    📝 {booking.special_requests}
                  </p>
                )}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem'
              }}>
                <span style={{
                  padding: '0.2rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: getStatusColor(booking.status) + '20',
                  color: getStatusColor(booking.status)
                }}>
                  {booking.status || 'pending'}
                </span>
                {booking.status === 'pending' && (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    style={{
                      padding: '0.4rem 1rem',
                      background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}
                  >
                    💳 Pay Now
                  </button>
                )}
                {booking.status === 'paid' && (
                  <span style={{
                    padding: '0.2rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#8B5CF6'
                  }}>
                    ✅ Paid
                  </span>
                )}
              </div>
            </div>

            {selectedBooking && selectedBooking.id === booking.id && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '2px solid #8B5CF6'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <h4 style={{ margin: 0 }}>💳 Complete Payment</h4>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <StripePayment
                  bookingId={booking.id}
                  amount={booking.total_price || booking.tour_packages?.price || 0}
                  onSuccess={() => {
                    setSelectedBooking(null)
                    fetchBookings()
                  }}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default UserBookings