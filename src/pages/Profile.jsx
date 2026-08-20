// src/components/Profile.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

function Profile({ user, onLogout, onClose, onProfileUpdate }) {
  const { darkMode } = useTheme()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [tripStats, setTripStats] = useState({ total: 0, countries: [] })

  useEffect(() => {
    // ✅ Check if user exists before fetching
    if (user?.id) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    // ✅ Safety check
    if (!user?.id) {
      console.log('No user ID available')
      setLoading(false)
      return
    }

    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (!error && data) {
        setProfile(data)
        setFullName(data.full_name || '')
        setBio(data.bio || '')
        setInterests(data.interests || '')
        setAvatarUrl(data.avatar_url || '')
      }
      
      // Fetch trip stats
      const { data: trips } = await supabase
        .from('trips')
        .select('destination')
        .eq('user_id', user.id)
      
      if (trips) {
        const countries = trips.map(t => t.destination)
        const uniqueCountries = [...new Set(countries)]
        setTripStats({
          total: trips.length,
          countries: uniqueCountries
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // ✅ Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Image too large. Please choose an image under 5MB.')
      setMessageType('error')
      return
    }

    // ✅ Check file type
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Please upload an image file.')
      setMessageType('error')
      return
    }
    
    setUploading(true)
    setMessage('')
    setMessageType('')
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) {
        throw uploadError
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      setAvatarUrl(publicUrl)
      setMessage('✅ Avatar uploaded successfully!')
      setMessageType('success')
      
      // ✅ Auto-save after upload
      setTimeout(async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              avatar_url: publicUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
          
          if (error) throw error
          
          if (onProfileUpdate) onProfileUpdate()
        } catch (err) {
          console.error('Auto-save error:', err)
        }
      }, 500)
      
    } catch (error) {
      setMessage(`❌ ${error.message || 'Failed to upload avatar'}`)
      setMessageType('error')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    // ✅ Safety check
    if (!user?.id) {
      setMessage('❌ Please log in to save profile')
      setMessageType('error')
      return
    }

    setSaving(true)
    setMessage('')
    setMessageType('')

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          interests: interests,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      setMessage('✅ Profile saved successfully!')
      setMessageType('success')
      
      if (onProfileUpdate) onProfileUpdate()
      
      setTimeout(() => {
        if (onClose) onClose()
      }, 2000)
      
    } catch (error) {
      setMessage(`❌ ${error.message}`)
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (onClose) {
      onClose()
    } else {
      window.history.back()
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem'
      }}>
        <p style={{ color: '#6b7280' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '1rem'
    }}>
      <button
        onClick={handleBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          marginBottom: '1rem',
          background: 'transparent',
          border: 'none',
          color: darkMode ? '#a1a1aa' : '#6b7280',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.color = darkMode ? '#e4e4e7' : '#1a1a2e'
        }}
        onMouseLeave={(e) => {
          e.target.style.color = darkMode ? '#a1a1aa' : '#6b7280'
        }}
      >
        ← Back to Dashboard
      </button>

      <div style={{
        background: darkMode ? '#1a1a2e' : 'white',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
      }}>
        {/* Avatar Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            position: 'relative',
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            padding: '4px',
            background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            marginBottom: '0.75rem'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              background: darkMode ? '#0f0f1a' : '#f0f0f0',
              border: '3px solid white'
            }}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: darkMode ? '#2d2d44' : '#e5e7eb'
                }}>
                  <span style={{ fontSize: '56px' }}>👤</span>
                </div>
              )}
            </div>
            
            {/* Camera icon overlay */}
            <label
              htmlFor="avatar-upload"
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#8B5CF6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                border: '2px solid white'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)'
                e.target.style.background = '#7C3AED'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.background = '#8B5CF6'
              }}
            >
              <span style={{ fontSize: '18px' }}>📷</span>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
          </div>

          {uploading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              color: '#8B5CF6',
              fontSize: '14px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                borderTop: '2px solid #8B5CF6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              Uploading...
            </div>
          )}

          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: darkMode ? '#e4e4e7' : '#1a1a2e',
            margin: '0.5rem 0 0.25rem 0'
          }}>
            {fullName || user?.email?.split('@')[0] || 'Traveler'}
          </h3>
          <p style={{
            fontSize: '13px',
            color: darkMode ? '#7a8ba8' : '#6b7280'
          }}>
            {user?.email || ''}
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          padding: '1rem',
          background: darkMode ? '#0f0f1a' : '#f9fafb',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0'}`
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
              {tripStats.total}
            </p>
            <p style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>Trips</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
              {tripStats.countries.length}
            </p>
            <p style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>Countries</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
              ⭐
            </p>
            <p style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>Traveler</p>
          </div>
        </div>

        {/* Edit Fields */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#e4e4e7' : '#333',
            marginBottom: '0.25rem'
          }}>
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '16px',
              background: darkMode ? '#0f0f1a' : 'white',
              color: darkMode ? '#e4e4e7' : '#1a1a2e'
            }}
            placeholder="Your full name"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#e4e4e7' : '#333',
            marginBottom: '0.25rem'
          }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              background: darkMode ? '#0f0f1a' : 'white',
              color: darkMode ? '#e4e4e7' : '#1a1a2e'
            }}
            placeholder="Tell other travelers about yourself..."
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#e4e4e7' : '#333',
            marginBottom: '0.25rem'
          }}>
            Interests
          </label>
          <input
            type="text"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '16px',
              background: darkMode ? '#0f0f1a' : 'white',
              color: darkMode ? '#e4e4e7' : '#1a1a2e'
            }}
            placeholder="e.g., Food, Adventure, Culture, Beach"
          />
        </div>

        {message && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            background: messageType === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${messageType === 'success' ? '#86efac' : '#fca5a5'}`,
            color: messageType === 'success' ? '#166534' : '#991b1b',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.target.style.transform = 'scale(1.01)'
              e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Profile'}
        </button>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Profile