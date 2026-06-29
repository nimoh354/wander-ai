import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [tripStats, setTripStats] = useState({ total: 0, countries: [] })

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      
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
      
      setLoading(false)
    }
    
    fetchProfile()
  }, [user])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    setMessage('')
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      setAvatarUrl(publicUrl)
      setMessage('✅ Avatar uploaded successfully!')
    } catch (error) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          bio: bio,
          interests: interests,
          avatar_url: avatarUrl,
          updated_at: new Date()
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      setMessage('✅ Profile saved successfully!')
    } catch (error) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4ff'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div className="profile-container" style={{
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
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '2rem'
          }}>
            👤 Your Profile
          </h1>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            {/* Avatar Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '4px solid #8B5CF6',
                marginBottom: '1rem'
              }}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '48px' }}>👤</span>
                )}
              </div>
              
              <label style={{
                padding: '0.5rem 1.5rem',
                background: '#8B5CF6',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#7C3AED'}
              onMouseLeave={(e) => e.target.style.background = '#8B5CF6'}
              >
                {uploading ? 'Uploading...' : '📸 Change Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Profile Form */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
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
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="Your full name"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
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
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'inherit'
                }}
                placeholder="Tell other travelers about yourself..."
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
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
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
                placeholder="e.g., Food, Adventure, Culture, Beach"
              />
            </div>

            {/* Stats Section */}
            <div className="profile-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6' }}>
                  {tripStats.total}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Trips Planned</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6' }}>
                  {tripStats.countries.length}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Countries</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6' }}>
                  {user?.email?.split('@')[0] || 'N/A'}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Username</p>
              </div>
            </div>

            {message && (
              <div style={{
                padding: '0.75rem',
                background: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
                color: message.includes('✅') ? '#22c55e' : '#ef4444',
                borderRadius: '8px',
                marginBottom: '1rem',
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
                cursor: 'pointer',
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
              {saving ? 'Saving...' : '💾 Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile