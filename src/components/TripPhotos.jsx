// src/components/TripPhotos.jsx

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const STORAGE_BUCKET = 'trip-photos'

function TripPhotos({ trip, user }) {
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (trip?.id) {
      fetchPhotos()
    }
  }, [trip])

  // Force refresh after upload
  useEffect(() => {
    if (retryCount > 0 && retryCount < 5) {
      const timer = setTimeout(() => {
        fetchPhotos()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [retryCount])

  const getPublicUrl = (filePath) => {
    const { data } = supabase
      .storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)
    
    // Add cache-busting parameter
    return `${data.publicUrl}?t=${Date.now()}`
  }

  const fetchPhotos = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('📁 Fetching photos for trip:', trip.id)
      
      const { data, error: listError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(`${trip.id}/`)

      if (listError) {
        console.error('❌ List error:', listError)
        setError(`Failed to load photos: ${listError.message}`)
        setPhotos([])
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        console.log('📭 No photos found')
        setPhotos([])
        setLoading(false)
        return
      }

      console.log(`📸 Found ${data.length} photos`)

      const validFiles = data.filter(file => 
        file.name && file.name !== '.emptyFolderPlaceholder'
      )

      const photoList = validFiles.map(file => {
        const filePath = `${trip.id}/${file.name}`
        const publicUrl = getPublicUrl(filePath)
        
        return {
          id: file.id || file.name,
          name: file.name,
          url: publicUrl,
          path: filePath,
          created_at: file.created_at
        }
      })

      setPhotos(photoList)

    } catch (err) {
      console.error('❌ Error fetching photos:', err)
      setError(`Failed to load photos: ${err.message}`)
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size too large. Max 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${trip.id}/${fileName}`

      console.log('📤 Uploading to:', filePath)

      const { data, error: uploadError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file)

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        return
      }

      console.log('✅ Upload successful:', data)

      // Force refresh with retry
      setRetryCount(prev => prev + 1)

    } catch (err) {
      console.error('❌ Upload error:', err)
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photo) => {
    if (!confirm(`Delete this photo?`)) return

    try {
      const { error: deleteError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .remove([photo.path])

      if (deleteError) {
        console.error('❌ Delete error:', deleteError)
        setError(`Delete failed: ${deleteError.message}`)
        return
      }

      // Force refresh
      fetchPhotos()

    } catch (err) {
      console.error('❌ Delete error:', err)
      setError(`Delete failed: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
        ⏳ Loading photos...
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Upload Button */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="photo-upload"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            opacity: uploading ? 0.6 : 1
          }}
        >
          📸 Upload Photo
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        {uploading && <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>Uploading...</span>}
        <button
          onClick={() => fetchPhotos()}
          style={{
            marginLeft: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '0.5rem',
          marginBottom: '1rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '0.5rem' }}>🖼️</span>
          <p>No photos yet. Upload your first travel memory!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                aspectRatio: '1',
                background: '#f3f4f6'
              }}
            >
              <img
                src={photo.url}
                alt={photo.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                loading="eager"
                onError={(e) => {
                  console.warn('🖼️ Image load error:', photo.url)
                  // Try reloading with a timestamp
                  e.target.src = `${photo.url.split('?')[0]}?t=${Date.now()}`
                  // If still fails after 3 attempts, show fallback
                  if (e.target.src.includes('t=') && e.target.src.split('t=').pop() > Date.now() - 5000) {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em"%3E❌ Failed to load%3C/text%3E%3C/svg%3E'
                  }
                }}
              />
              <button
                onClick={() => handleDelete(photo)}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'rgba(239,68,68,0.85)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
                onMouseEnter={(e) => e.target.style.background = '#ef4444'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(239,68,68,0.85)'}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TripPhotos