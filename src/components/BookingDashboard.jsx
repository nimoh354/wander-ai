import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function BookingDashboard({ user }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  })

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    
    // Fetch all bookings with package details
    const { data, error } = await supabase
      .from('tour_bookings')
      .select(`
        *,
        tour_packages (
          id,
          name,
          price,
          user_id
        ),
        profiles!tour_bookings_user_id_fkey (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (!error) {
      setBookings(data || [])
      
      // Calculate stats
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(b => b.status === 'pending').length || 0,
        confirmed: data?.filter(b => b.status === 'confirmed').length || 0,
        completed: data?.filter(b => b.status === 'completed').length || 0,
        cancelled: data?.filter(b => b.status === 'cancelled').length || 0
      }
      setStats(stats)
    }
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId, status) => {
    if (!confirm(`Update booking status to ${status}?`)) return

    const { error } = await supabase
      .from('tour_bookings')
      .update({ status: status })
      .eq('id', bookingId)

    if (!error) {
      fetchBookings()
    } else {
      alert('❌ Error updating booking: ' + error.message)
    }
  }

  const deleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking?')) return

    const { error } = await supabase
      .from('tour_bookings')
      .delete()
      .eq('id', bookingId)

    if (!error) {
      fetchBookings()
    } else {
      alert('❌ Error deleting booking: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#F59E0B'
      case 'confirmed': return '#22C55E'
      case 'completed': return '#8B5CF6'
      case 'cancelled': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getStatusBadge = (status) => {
    return {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      completed: '🎉 Completed',
      cancelled: '❌ Cancelled'
    }[status] || status
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#6b7280' }}>Loading bookings...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          fontFamily: "'Playfair Display', serif",
          color: '#1a1a2e'
        }}>
          📋 Booking Dashboard
        </h2>
        <button
          onClick={fetchBookings}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(26, 43, 60, 0.06)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6' }}>{stats.total}</p>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>📊 Total</p>
        </div>
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(26, 43, 60, 0.06)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#F59E0B' }}>{stats.pending}</p>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>⏳ Pending</p>
        </div>
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(26, 43, 60, 0.06)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#22C55E' }}>{stats.confirmed}</p>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>✅ Confirmed</p>
        </div>
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(26, 43, 60, 0.06)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#EF4444' }}>{stats.cancelled}</p>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>❌ Cancelled</p>
        </div>
      </div>

      {/* Bookings List */}
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
          <p>No bookings yet.</p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {bookings.map((booking) => (
            <div key={booking.id} style={{
              background: 'white',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
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
                    <span>👤 {booking.profiles?.full_name || booking.profiles?.email || 'Unknown'}</span>
                    <span>📅 {new Date(booking.booking_date).toLocaleDateString()}</span>
                    <span>👥 {booking.guests} guests</span>
                    <span>💰 ${booking.total_price || booking.tour_packages?.price || 0}</span>
                  </div>
                  {booking.special_requests && (
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                      📝 {booking.special_requests}
                    </p>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <span style={{
                    padding: '0.2rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: getStatusColor(booking.status) + '20',
                    color: getStatusColor(booking.status)
                  }}>
                    {getStatusBadge(booking.status)}
                  </span>
                  <select
                    value={booking.status}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: 'white'
                    }}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="completed">🎉 Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                  <button
                    onClick={() => deleteBooking(booking.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#fef2f2',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#ef4444'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingDashboard