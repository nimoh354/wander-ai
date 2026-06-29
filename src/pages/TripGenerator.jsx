import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { generateDefaultItinerary } from '../utils/tripGenerator'

function TripGenerator({ user, onTripSaved }) {
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(5)
  const [budget, setBudget] = useState('')
  const [preferences, setPreferences] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [booking, setBooking] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    travelers: 1,
    specialRequests: '',
    paymentMethod: 'card'
  })

  // Generate Itinerary
  const generateItinerary = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setItinerary(null)
    setShowBooking(false)

    try {
      const generatedItinerary = generateDefaultItinerary(
        destination,
        duration,
        budget,
        preferences
      );
      
      setTimeout(() => {
        setItinerary(generatedItinerary);
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      console.error('Error:', err)
      setLoading(false)
    }
  }

  // Save Trip
  const saveTrip = async () => {
    if (!itinerary) return
    
    setSaving(true)
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'Traveler',
        user_type: 'tourist'
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
      
      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }
      
      const tripData = {
        user_id: user.id,
        destination: destination,
        duration_days: duration,
        budget: budget ? parseFloat(budget) : null,
        preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
        itinerary: itinerary,
        status: 'planned'
      }
      
      const { data, error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
      
      if (tripError) {
        console.error('Trip error:', tripError)
        throw new Error(`Trip save failed: ${tripError.message}`)
      }
      
      alert('✅ Trip saved successfully!')
      if (onTripSaved) onTripSaved()
      setDestination('')
      setDuration(5)
      setBudget('')
      setPreferences('')
      setItinerary(null)
      setShowBooking(false)
    } catch (err) {
      console.error('Save error:', err)
      alert('❌ Error saving trip: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Book Trip
  const bookTrip = async () => {
    if (!itinerary) return
    
    setBooking(true)
    try {
      // First, save the trip if not saved
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'Traveler',
        user_type: 'tourist'
      }
      
      await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
      
      const tripData = {
        user_id: user.id,
        destination: destination,
        duration_days: duration,
        budget: budget ? parseFloat(budget) : null,
        preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
        itinerary: itinerary,
        status: 'booked',
        travelers: bookingDetails.travelers,
        special_requests: bookingDetails.specialRequests || null
      }
      
      const { data: tripResult, error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
      
      if (tripError) throw tripError
      
      // Create booking record
      const bookingData = {
        trip_id: tripResult[0].id,
        user_id: user.id,
        status: 'confirmed',
        total_price: parseFloat(budget) || 0,
        travelers: bookingDetails.travelers,
        special_requests: bookingDetails.specialRequests || null,
        payment_method: bookingDetails.paymentMethod
      }
      
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
      
      if (bookingError) throw bookingError
      
      alert('✅ Trip booked successfully! Check your bookings.')
      if (onTripSaved) onTripSaved()
      
      // Reset everything
      setDestination('')
      setDuration(5)
      setBudget('')
      setPreferences('')
      setItinerary(null)
      setShowBooking(false)
      setBookingDetails({
        travelers: 1,
        specialRequests: '',
        paymentMethod: 'card'
      })
    } catch (err) {
      console.error('Booking error:', err)
      alert('❌ Error booking trip: ' + err.message)
    } finally {
      setBooking(false)
    }
  }

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div>
      <Navbar user={user} onLogout={() => window.location.reload()} />
      <div className="trip-generator-container" style={{
        minHeight: '100vh',
        backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
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
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            ✨ Plan Your Dream Trip
          </h1>

          <p style={{ 
            color: '#ffffff', 
            marginBottom: '2rem', 
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            fontSize: '16px'
          }}>
            Tell us about your ideal trip, and our AI will create a personalized itinerary!
          </p>

          {/* Input Form */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <form onSubmit={generateItinerary}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  🌍 Where do you want to go?
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Paris, Tokyo, Bali..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  📅 How many days?
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  min="1"
                  max="30"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  💰 Budget (optional)
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., 1000, budget-friendly, luxury..."
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  🎯 Preferences (optional)
                </label>
                <input
                  type="text"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., food, adventure, culture, beach..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'scale(1.01)'
                    e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {loading ? '🧠 AI is thinking...' : '✨ Generate Itinerary'}
              </button>
            </form>

            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#fef2f2',
                color: '#ef4444',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* Itinerary Results */}
          {itinerary && (
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '24px' }}>
                    🗺️ {itinerary.destination || destination}
                  </h2>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    📅 {itinerary.duration || duration} days • 💰 {itinerary.estimatedCost || budget || 'Budget flexible'}
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  flexWrap: 'wrap' 
                }}>
                  <button
                    onClick={() => window.location.href = '/'}
                    style={{
                      padding: '0.5rem 1.5rem',
                      background: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f3f4f6'
                      e.target.style.transform = 'scale(1.02)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent'
                      e.target.style.transform = 'scale(1)'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setShowBooking(!showBooking)}
                    style={{
                      padding: '0.5rem 1.5rem',
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)'
                      e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    {showBooking ? '✕ Close Booking' : '📅 Book This Trip'}
                  </button>
                  <button
                    onClick={saveTrip}
                    disabled={saving}
                    style={{
                      padding: '0.5rem 1.5rem',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      opacity: saving ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!saving) {
                        e.target.style.transform = 'scale(1.02)'
                        e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    {saving ? 'Saving...' : '💾 Save Trip'}
                  </button>
                </div>
              </div>

              {/* Booking Form */}
              {showBooking && (
                <div style={{
                  background: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '2px solid #8B5CF6'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: '#1a1a2e'
                  }}>
                    📅 Book This Trip
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                    Confirm your booking details below.
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}>
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      name="travelers"
                      value={bookingDetails.travelers}
                      onChange={handleBookingInputChange}
                      min="1"
                      max="20"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}>
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={bookingDetails.specialRequests}
                      onChange={handleBookingInputChange}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Any special requests? (dietary needs, accessibility, etc.)"
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}>
                      Payment Method
                    </label>
                    <select
                      name="paymentMethod"
                      value={bookingDetails.paymentMethod}
                      onChange={handleBookingInputChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="card">💳 Credit/Debit Card</option>
                      <option value="paypal">💲 PayPal</option>
                      <option value="bank">🏦 Bank Transfer</option>
                      <option value="cash">💵 Cash</option>
                    </select>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={bookTrip}
                      disabled={booking}
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '16px',
                        opacity: booking ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!booking) {
                          e.target.style.transform = 'scale(1.02)'
                          e.target.style.boxShadow = '0 4px 20px rgba(34, 197, 94, 0.3)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)'
                        e.target.style.boxShadow = 'none'
                      }}
                    >
                      {booking ? 'Processing...' : '✅ Confirm Booking'}
                    </button>
                    <button
                      onClick={() => setShowBooking(false)}
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  <p style={{
                    marginTop: '1rem',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    ⚠️ This is a demo booking system. No real money will be charged.
                  </p>
                </div>
              )}

              {itinerary.days && itinerary.days.map((day, index) => (
                <div key={index} style={{
                  marginBottom: '1.5rem',
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '0.5rem' }}>
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

              {itinerary.tips && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '16px', marginBottom: '0.5rem' }}>💡 Travel Tips</h4>
                  {itinerary.tips.map((tip, i) => (
                    <p key={i} style={{ color: '#4b5563', fontSize: '14px' }}>
                      • {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TripGenerator