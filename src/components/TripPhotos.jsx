import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function TripPhotos({ trip, user }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    fetchPhotos()
  }, [trip.id])

  const fetchPhotos = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('trip_photos')
      .select('*')
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: false })
    
    if (!error) {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${trip.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('trip-photos')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('trip-photos')
        .getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase
        .from('trip_photos')
        .insert([
          {
            trip_id: trip.id,
            user_id: user.id,
            photo_url: publicUrl,
            caption: caption || null
          }
        ])

      if (dbError) throw dbError

      setCaption('')
      setSelectedFile(null)
      // Reset file input
      document.getElementById('photo-upload').value = ''
      fetchPhotos()
      alert('✅ Photo uploaded successfully!')
    } catch (error) {
      alert('❌ Error uploading photo: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId) => {
    if (!confirm('Delete this photo?')) return

    const { error } = await supabase
      .from('trip_photos')
      .delete()
      .eq('id', photoId)

    if (!error) {
      fetchPhotos()
    } else {
      alert('❌ Error deleting photo: ' + error.message)
    }
  }

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading photos...</p>
  }

  return (
    <div>
      {/* Upload Section */}
      <div style={{
        background: '#f9fafb',
        padding: '1rem',
        borderRadius: '12px',
        marginBottom: '1rem'
      }}>
        <h4 style={{ marginBottom: '0.5rem' }}>📸 Add Photos</h4>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ fontSize: '14px', flex: 1, minWidth: '150px' }}
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          />
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              opacity: !selectedFile || uploading ? 0.5 : 1
            }}
          >
            {uploading ? 'Uploading...' : '📤 Upload'}
          </button>
        </div>
      </div>

      {/* Photo Gallery */}
      {photos.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center' }}>
          No photos yet. Add your first trip photo!
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '0.75rem'
        }}>
          {photos.map((photo) => (
            <div key={photo.id} style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              aspectRatio: '1/1'
            }}>
              <img
                src={photo.photo_url}
                alt={photo.caption || 'Trip photo'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {photo.caption && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '0.25rem 0.5rem',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  fontSize: '12px',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }}>
                  {photo.caption}
                </div>
              )}
              <button
                onClick={() => handleDelete(photo.id)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  padding: '4px 8px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
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