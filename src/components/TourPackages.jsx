// src/components/TourPackages.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function TourPackages({ user }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: 1,
    max_guests: 10,  // ✅ Changed from max_capacity
    includes: '',
    excludes: '',
    status: 'active',
    image_url: '',
    start_date: '',
    end_date: '',
    season: ''
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    setLoading(true)
    
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userId = currentUser?.id || user?.id
    
    if (!userId) {
      console.log('⚠️ No user ID found')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('tour_packages')
      .select(`
        *,
        availability (
          date,
          slots,
          booked,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) {
      const processedPackages = (data || []).map(pkg => {
        const today = new Date().toISOString().split('T')[0]
        const availabilityDates = pkg.availability || []
        const futureDates = availabilityDates.filter(a => a.date >= today)
        const hasFutureDates = futureDates.length > 0
        const hasAvailableSlots = futureDates.some(a => (a.slots - a.booked) > 0)
        
        let packageStatus = pkg.status || 'active'
        let statusBadge = ''
        let isExpired = false
        let isFullyBooked = false
        
        if (packageStatus === 'inactive') {
          statusBadge = '⛔ Inactive'
        } else if (!hasFutureDates) {
          isExpired = true
          statusBadge = '⛔ Expired'
        } else if (!hasAvailableSlots) {
          isFullyBooked = true
          statusBadge = '🔴 Full'
        } else {
          statusBadge = '✅ Available'
        }
        
        return {
          ...pkg,
          hasFutureDates,
          hasAvailableSlots,
          isExpired,
          isFullyBooked,
          statusBadge,
          futureDates: futureDates.map(d => ({
            date: d.date,
            slots: d.slots - d.booked
          }))
        }
      })
      
      setPackages(processedPackages)
    } else {
      console.error('❌ Fetch error:', error)
    }
    setLoading(false)
  }

  const uploadImage = async (file) => {
    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `tour-packages/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('trip-photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('trip-photos')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('❌ Upload error:', error)
      alert('Failed to upload image. Please try again.')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const getImageUrl = (pkg) => {
    if (pkg.image_url) return pkg.image_url
    
    const nameLower = pkg.name.toLowerCase()
    const fallbacks = {
      'safari': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop',
      'beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
      'mountain': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
      'diani': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
      'maasai': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop'
    }
    
    for (const [key, url] of Object.entries(fallbacks)) {
      if (nameLower.includes(key)) return url
    }
    
    return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop'
  }

  const generateAvailability = async (packageId, startDate, endDate, slots = 10) => {
    if (!startDate || !endDate) return
    
    const dates = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push({
        package_id: packageId,
        date: d.toISOString().split('T')[0],
        slots: slots,
        booked: 0,
        status: 'available'
      })
    }
    
    const { error } = await supabase
      .from('availability')
      .insert(dates)
    
    if (error) {
      console.error('❌ Error generating availability:', error)
      return false
    }
    
    console.log(`✅ Generated ${dates.length} availability dates`)
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userId = currentUser?.id || user?.id

    if (!userId) {
      alert('❌ Please log in as admin')
      setLoading(false)
      return
    }

    const packageData = {
      name: formData.name,
      description: formData.description || '',
      price: parseFloat(formData.price) || 0,
      duration_days: parseInt(formData.duration_days) || 1,
      max_guests: parseInt(formData.max_guests) || 10,  // ✅ Changed
      includes: formData.includes ? formData.includes.split(',').map(item => item.trim()) : [],
      excludes: formData.excludes ? formData.excludes.split(',').map(item => item.trim()) : [],
      status: formData.status || 'active',
      user_id: userId,
      image_url: formData.image_url || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      season: formData.season || null
    }

    let error
    let newPackageId = null

    if (editingPackage) {
      const { error: updateError } = await supabase
        .from('tour_packages')
        .update(packageData)
        .eq('id', editingPackage.id)
      error = updateError
      newPackageId = editingPackage.id
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('tour_packages')
        .insert([packageData])
        .select()
      error = insertError
      if (inserted && inserted.length > 0) {
        newPackageId = inserted[0].id
      }
    }

    if (!error) {
      if (!editingPackage && formData.start_date && formData.end_date && newPackageId) {
        await generateAvailability(
          newPackageId,
          formData.start_date,
          formData.end_date,
          parseInt(formData.max_guests) || 10  // ✅ Changed
        )
      }
      
      fetchPackages()
      setShowForm(false)
      setEditingPackage(null)
      resetForm()
      alert('✅ Package saved successfully!')
    } else {
      console.error('❌ Error:', error)
      alert('❌ Error saving package: ' + error.message)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return

    const { error } = await supabase
      .from('tour_packages')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchPackages()
      alert('✅ Package deleted successfully!')
    } else {
      alert('❌ Error deleting package: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_days: 1,
      max_guests: 10,  // ✅ Changed
      includes: '',
      excludes: '',
      status: 'active',
      image_url: '',
      start_date: '',
      end_date: '',
      season: ''
    })
  }

  const editPackage = (pkg) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price || '',
      duration_days: pkg.duration_days || 1,
      max_guests: pkg.max_guests || 10,  // ✅ Changed
      includes: pkg.includes ? pkg.includes.join(', ') : '',
      excludes: pkg.excludes ? pkg.excludes.join(', ') : '',
      status: pkg.status || 'active',
      image_url: pkg.image_url || '',
      start_date: pkg.start_date || '',
      end_date: pkg.end_date || '',
      season: pkg.season || ''
    })
    setShowForm(true)
  }

  if (loading && packages.length === 0) {
    return <p style={{ color: '#6b7280' }}>Loading packages...</p>
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
          📦 Tour Packages ({packages.length})
        </h2>
        <button
          onClick={() => {
            setEditingPackage(null)
            resetForm()
            setShowForm(!showForm)
          }}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? '✕ Cancel' : '+ Create Package'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>
            {editingPackage ? '✏️ Edit Package' : '➕ Create New Package'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Package Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Duration (days)</label>
                <input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Max Guests</label>
                <input
                  type="number"
                  value={formData.max_guests}  // ✅ Changed
                  onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}  // ✅ Changed
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => {
                    const start = e.target.value
                    const end = new Date(start)
                    end.setDate(end.getDate() + (parseInt(formData.duration_days) || 1))
                    setFormData({ 
                      ...formData, 
                      start_date: start,
                      end_date: end.toISOString().split('T')[0]
                    })
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  disabled
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    cursor: 'not-allowed'
                  }}
                />
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '0.25rem' }}>
                  ⚡ Auto-calculated from start date + duration
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Season</label>
                <select
                  value={formData.season}
                  onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="">Select season...</option>
                  <option value="Summer">☀️ Summer</option>
                  <option value="Spring">🌸 Spring</option>
                  <option value="Fall">🍂 Fall</option>
                  <option value="Winter">❄️ Winter</option>
                  <option value="Year-round">🔄 Year-round</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Package Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0]
                  if (file) {
                    const url = await uploadImage(file)
                    if (url) {
                      setFormData({ ...formData, image_url: url })
                    }
                  }
                }}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              {uploadingImage && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>⏳ Uploading...</p>}
              {formData.image_url && (
                <div style={{ marginTop: '0.5rem', position: 'relative' }}>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '0.25rem 0.75rem',
                      background: 'rgba(239, 68, 68, 0.9)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                placeholder="Describe the tour experience..."
              />
            </div>

            {/* Includes/Excludes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Includes</label>
                <input
                  type="text"
                  value={formData.includes}
                  onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                  placeholder="Meals, Transport, Guide"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.25rem' }}>Excludes</label>
                <input
                  type="text"
                  value={formData.excludes}
                  onChange={(e) => setFormData({ ...formData, excludes: e.target.value })}
                  placeholder="Flights, Insurance, Tips"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploadingImage}
              style={{
                marginTop: '1rem',
                padding: '0.6rem 2rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                opacity: (loading || uploadingImage) ? 0.6 : 1
              }}
            >
              {loading ? 'Saving...' : uploadingImage ? 'Uploading Image...' : (editingPackage ? 'Update Package' : 'Create Package')}
            </button>
          </form>
        </div>
      )}

      {/* Package Cards */}
      {packages.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280',
          background: 'white',
          borderRadius: '16px'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>📦</span>
          <p>No packages created yet. Create your first package above!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {packages.map((pkg) => (
            <div key={pkg.id} style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}>
              {/* Image Display */}
              <div style={{
                height: '140px',
                background: `url(${getImageUrl(pkg)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: pkg.isExpired ? 'rgba(239,68,68,0.9)' 
                    : pkg.isFullyBooked ? 'rgba(245,158,11,0.9)' 
                    : 'rgba(34,197,94,0.9)',
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {pkg.isExpired ? '⛔ Expired' 
                    : pkg.isFullyBooked ? '🔴 Full' 
                    : '✅ Available'}
                </span>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{pkg.name}</h4>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => editPackage(pkg)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#fef2f2',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0.25rem 0' }}>
                  {pkg.description || 'No description'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '13px', color: '#6b7280' }}>
                  <span>💰 ${pkg.price}</span>
                  <span>📅 {pkg.duration_days} days</span>
                  <span>👥 {pkg.max_guests} guests</span>  {/* ✅ Changed */}
                </div>
                {pkg.season && (
                  <span style={{
                    fontSize: '11px',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'inline-block',
                    marginTop: '0.25rem'
                  }}>
                    🌤️ {pkg.season}
                  </span>
                )}
                {pkg.futureDates && pkg.futureDates.length > 0 && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6b7280', 
                    marginTop: '0.25rem',
                    padding: '0.25rem 0.5rem',
                    background: '#f3f4f6',
                    borderRadius: '4px'
                  }}>
                    📅 {pkg.futureDates.length} future dates available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TourPackages