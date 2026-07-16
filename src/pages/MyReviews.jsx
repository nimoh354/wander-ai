// src/pages/MyReviews.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar'

function MyReviews({ user, onLogout }) {
  const { darkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState([])
  const [reviews, setReviews] = useState({})
  const [editingReview, setEditingReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    setLoading(true)

    try {
      // Fetch user's trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (tripsError) throw tripsError

      // Fetch user's reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('trip_reviews')
        .select('*')
        .eq('user_id', user.id)

      if (reviewsError) throw reviewsError

      // Create a map of trip_id -> review
      const reviewMap = {}
      reviewsData?.forEach(review => {
        reviewMap[review.trip_id] = review
      })

      setTrips(tripsData || [])
      setReviews(reviewMap)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (tripId) => {
    if (rating === 0) {
      setMessage('Please select a rating')
      setMessageType('error')
      return
    }

    try {
      const existingReview = reviews[tripId]

      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('trip_reviews')
          .update({
            rating: rating,
            comment: comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id)

        if (error) throw error
        setMessage('✅ Review updated successfully!')
      } else {
        // Create new review
        const { error } = await supabase
          .from('trip_reviews')
          .insert({
            user_id: user.id,
            trip_id: tripId,
            rating: rating,
            comment: comment
          })

        if (error) throw error
        setMessage('✅ Review added successfully!')
      }

      setMessageType('success')
      setShowReviewForm(null)
      setEditingReview(null)
      setRating(0)
      setComment('')
      fetchData()

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ ${error.message}`)
      setMessageType('error')
    }
  }

  const handleDeleteReview = async (tripId) => {
    const review = reviews[tripId]
    if (!review) return

    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const { error } = await supabase
        .from('trip_reviews')
        .delete()
        .eq('id', review.id)

      if (error) throw error

      setMessage('✅ Review deleted successfully!')
      setMessageType('success')
      fetchData()
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ ${error.message}`)
      setMessageType('error')
    }
  }

  const openReviewForm = (trip) => {
    const existingReview = reviews[trip.id]
    setShowReviewForm(trip.id)
    setEditingReview(existingReview || null)
    setRating(existingReview?.rating || 0)
    setComment(existingReview?.comment || '')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#0f0f1a' : '#f5f3ff'
      }}>
        <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{
        minHeight: '100vh',
        background: darkMode ? '#0f0f1a' : '#f5f3ff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                fontFamily: "'Playfair Display', serif",
                color: darkMode ? '#e4e4e7' : '#1a1a2e'
              }}>
                ⭐ My Reviews
              </h1>
              <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                Review the trips you've taken
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '0.5rem 1.5rem',
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

          {message && (
            <div style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: messageType === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${messageType === 'success' ? '#86efac' : '#fca5a5'}`,
              color: messageType === 'success' ? '#166534' : '#991b1b'
            }}>
              {message}
            </div>
          )}

          {/* Trip List */}
          {trips.length === 0 ? (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '2px dashed rgba(26, 43, 60, 0.1)'
            }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>✈️</span>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                No trips yet
              </h3>
              <p style={{ color: '#6b7280' }}>
                Plan a trip first and then come back to review it!
              </p>
            </div>
          ) : (
            trips.map((trip) => {
              const existingReview = reviews[trip.id]
              const isReviewing = showReviewForm === trip.id

              return (
                <div
                  key={trip.id}
                  style={{
                    background: darkMode ? '#1a1a2e' : 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: darkMode ? '#e4e4e7' : '#1a1a2e'
                      }}>
                        {trip.destination}
                      </h3>
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '14px',
                        color: '#6b7280',
                        flexWrap: 'wrap'
                      }}>
                        <span>📅 {trip.duration_days} days</span>
                        {trip.budget && <span>💰 ${trip.budget}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {existingReview ? (
                        <>
                          <span style={{
                            fontSize: '14px',
                            color: '#F4C542',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {'⭐'.repeat(existingReview.rating)}
                          </span>
                          <button
                            onClick={() => openReviewForm(trip)}
                            style={{
                              padding: '0.3rem 0.75rem',
                              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(trip.id)}
                            style={{
                              padding: '0.3rem 0.75rem',
                              background: '#fef2f2',
                              color: '#ef4444',
                              border: '1px solid #fca5a5',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => openReviewForm(trip)}
                          style={{
                            padding: '0.4rem 1rem',
                            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        >
                          ⭐ Write Review
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Form */}
                  {isReviewing && (
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
                    }}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>
                          Rating
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '28px',
                                cursor: 'pointer',
                                color: star <= rating ? '#F4C542' : '#d1d5db',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>
                          Comment
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows="3"
                          placeholder="Share your experience..."
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
                            background: darkMode ? '#0f0f1a' : 'white',
                            color: darkMode ? '#e4e4e7' : '#1a1a2e',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSubmitReview(trip.id)}
                          style={{
                            padding: '0.5rem 1.5rem',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          {existingReview ? '💾 Update Review' : '⭐ Submit Review'}
                        </button>
                        <button
                          onClick={() => {
                            setShowReviewForm(null)
                            setRating(0)
                            setComment('')
                          }}
                          style={{
                            padding: '0.5rem 1.5rem',
                            background: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default MyReviews