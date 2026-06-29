import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function TripShare({ trip, onClose }) {
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const generateShareLink = async () => {
    setLoading(true)
    
    try {
      // Create a public share record
      const { data, error } = await supabase
        .from('shared_trips')
        .insert([
          {
            trip_id: trip.id,
            share_token: Math.random().toString(36).substring(2, 15),
            views: 0
          }
        ])
        .select()
        .single()
      
      if (error) throw error
      
      // Construct the shareable URL
      const url = `${window.location.origin}/shared/${data.share_token}`
      setShareLink(url)
    } catch (error) {
      alert('❌ Error generating share link: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = shareLink
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const shareOnSocial = (platform) => {
    const text = `Check out my trip to ${trip.destination}! 🌍 Plan yours with WanderAI ✈️`
    const url = shareLink
    
    const platforms = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=My trip to ${trip.destination}&body=${encodeURIComponent(text + '\n\n' + url)}`
    }
    
    window.open(platforms[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#999'
          }}
        >
          ✕
        </button>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#1a1a2e'
        }}>
          🔗 Share Your Trip
        </h2>
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          fontSize: '14px'
        }}>
          Share your {trip.destination} itinerary with friends and family!
        </p>

        {!shareLink ? (
          <button
            onClick={generateShareLink}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Generating...' : '🔗 Generate Share Link'}
          </button>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <input
                type="text"
                value={shareLink}
                readOnly
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#f9fafb'
                }}
              />
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: copied ? '#22c55e' : '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Share this link with anyone to show your itinerary!
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem'
            }}>
              <button
                onClick={() => shareOnSocial('twitter')}
                style={{
                  padding: '0.5rem',
                  background: '#1DA1F2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                🐦 Twitter
              </button>
              <button
                onClick={() => shareOnSocial('facebook')}
                style={{
                  padding: '0.5rem',
                  background: '#1877F2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                📘 FB
              </button>
              <button
                onClick={() => shareOnSocial('whatsapp')}
                style={{
                  padding: '0.5rem',
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                💬 WA
              </button>
              <button
                onClick={() => shareOnSocial('email')}
                style={{
                  padding: '0.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '12px'
                }}
              >
                ✉️ Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TripShare