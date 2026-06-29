import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function TripReviews({ trip, user }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [userReview, setUserReview] = useState(null)

  useEffect(() => {
    fetchReviews()
  }, [trip.id])

  const fetchReviews = async () => {
    setLoading(true)
    
    // Fetch all reviews for this trip
    const { data, error } = await supabase
      .from('trip_reviews')
      .select('*')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setReviews(data)
      
      // Calculate average rating
      if (data.length > 0) {
        const total = data.reduce((sum, r) => sum + r.rating, 0)
        setAverageRating(total / data.length)
      }
      
      // Check if user already reviewed
      const userReview = data.find(r => r.user_id === user.id)
      setUserReview(userReview)
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    
    setSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('trip_reviews')
        .insert([
          {
            trip_id: trip.id,
            user_id: user.id,
            rating: rating,
            comment: comment || null
          }
        ])
      
      if (error) throw error
      
      setComment('')
      setRating(5)
      alert('✅ Review submitted successfully!')
      fetchReviews()
    } catch (error) {
      alert('❌ Error submitting review: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete your review?')) return
    
    const { error } = await supabase
      .from('trip_reviews')
      .delete()
      .eq('id', reviewId)
    
    if (!error) {
      fetchReviews()
    } else {
      alert('❌ Error deleting review: ' + error.message)
    }
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading reviews...</p>
  }

  return (
    <div>
      {/* Average Rating */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '36px', fontWeight: '700', color: '#8B5CF6' }}>
            {averageRating ? averageRating.toFixed(1) : '—'}
          </span>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>Average Rating</p>
        </div>
        <div>
          <p style={{ fontSize: '18px' }}>
            {averageRating ? renderStars(Math.round(averageRating)) : 'No reviews yet'}
          </p>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>
            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Review Form */}
      {!userReview ? (
        <div style={{
          background: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <h4 style={{ marginBottom: '0.5rem' }}>✍️ Write a Review</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '0.25rem'
              }}>
                Rating
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '28px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '28px',
                      opacity: star <= rating ? 1 : 0.3,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                marginBottom: '0.25rem'
              }}>
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
                placeholder="Share your experience..."
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.5rem 2rem',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: submitting ? 0.5 : 1
              }}
            >
              {submitting ? 'Submitting...' : '⭐ Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{
          padding: '0.75rem',
          background: '#f0fdf4',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          color: '#22c55e',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          ✅ You already reviewed this trip
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center' }}>
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((review) => {
            const isOwn = review.user_id === user.id
            return (
              <div key={review.id} style={{
                padding: '1rem',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div>
                    <p style={{ fontSize: '20px' }}>
                      {renderStars(review.rating)}
                    </p>
                    {review.comment && (
                      <p style={{ color: '#1a1a2e', marginTop: '0.25rem' }}>
                        {review.comment}
                      </p>
                    )}
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}>
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TripReviews