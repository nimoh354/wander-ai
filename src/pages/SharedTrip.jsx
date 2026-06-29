import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function SharedTrip() {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get the share token from the URL
    const path = window.location.pathname
    const token = path.split('/shared/')[1]
    
    if (!token) {
      setError('Invalid share link')
      setLoading(false)
      return
    }

    const fetchSharedTrip = async () => {
      try {
        // Get the shared trip record
        const { data: shareData, error: shareError } = await supabase
          .from('shared_trips')
          .select('trip_id')
          .eq('share_token', token)
          .single()
        
        if (shareError) throw new Error('Trip not found')
        
        // Get the trip details
        const { data: tripData, error: tripError } = await supabase
          .from('trips')
          .select('*')
          .eq('id', shareData.trip_id)
          .single()
        
        if (tripError) throw tripError
        
        setTrip(tripData)
        
        // Increment view count
        await supabase
          .from('shared_trips')
          .update({ views: supabase.rpc('increment', { x: 1 }) })
          .eq('share_token', token)
        
      } catch (error) {
        setError('This trip could not be found')
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSharedTrip()
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4ff'
      }}>
        <p>Loading trip...</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '1rem' }}>🔗</span>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
            Trip Not Found
          </h2>
          <p style={{ color: '#6b7280' }}>
            {error || 'This trip link is invalid or has expired.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      padding: '2rem',
      position: 'relative'
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '48px' }}>🌍</span>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a2e',
              marginTop: '0.5rem'
            }}>
              {trip.destination}
            </h1>
            <p style={{ color: '#6b7280' }}>
              📅 {trip.duration_days} days • 💰 {trip.budget ? `$${trip.budget}` : 'Budget flexible'}
            </p>
            <div style={{
              marginTop: '0.5rem',
              padding: '0.25rem 1rem',
              background: '#f0f0f0',
              borderRadius: '12px',
              display: 'inline-block',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              📌 Shared Trip
            </div>
          </div>

          {trip.itinerary && trip.itinerary.days && (
            <div>
              {trip.itinerary.days.map((day, index) => (
                <div key={index} style={{
                  marginBottom: '1.5rem',
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#1a1a2e'
                  }}>
                    Day {index + 1}: {day.title || `Day ${index + 1}`}
                  </h3>
                  {day.activities && day.activities.map((activity, i) => (
                    <p key={i} style={{ color: '#4b5563', marginBottom: '0.25rem' }}>
                      • {activity}
                    </p>
                  ))}
                  {day.meals && (
                    <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#6b7280' }}>
                      <p>🍳 Breakfast: {day.meals.breakfast}</p>
                      <p>🥗 Lunch: {day.meals.lunch}</p>
                      <p>🍽️ Dinner: {day.meals.dinner}</p>
                    </div>
                  )}
                  {day.accommodation && (
                    <p style={{ marginTop: '0.5rem', fontSize: '14px', color: '#6b7280' }}>
                      🏨 Accommodation: {day.accommodation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{
            textAlign: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid #f0f0f0'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              ✨ Plan your own trip at <strong>WanderAI</strong>
            </p>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 2rem',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Start Planning →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedTrip