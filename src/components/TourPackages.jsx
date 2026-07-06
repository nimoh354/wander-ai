// src/components/TourPackages.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AvailabilityCalendar from './AvailabilityCalendar'
import Booking from './Booking'
import { calculateEndDate, formatDate, generateDateRange } from '../utils/dateHelpers'

function TourPackages({ user }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: 1,
    max_guests: 10,
    includes: '',
    excludes: '',
    status: 'active',
    // Date fields
    start_date: '',
    end_date: '',
    available_from: '',
    available_to: '',
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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) {
      setPackages(data || [])
    } else {
      console.error('❌ Fetch error:', error)
    }
    setLoading(false)
  }

  // Generate availability dates for a package
  const generateAvailability = async (packageId, startDate, endDate, slots = 10) => {
    if (!startDate || !endDate) return
    
    const dates = generateDateRange(startDate, endDate)
    
    const availabilityData = dates.map(date => ({
      package_id: packageId,
      date: date,
      slots: slots,
      booked: 0,
      status: 'available'
    }))
    
    const { error } = await supabase
      .from('availability')
      .insert(availabilityData)
    
    if (error) {
      console.error('❌ Error generating availability:', error)
      return false
    }
    
    console.log(`✅ Generated ${availabilityData.length} availability dates`)
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const userId = currentUser?.id || user?.id

    if (!userId) {
      alert('❌ User not authenticated. Please log in again.')
      setLoading(false)
      return
    }

    // Validate dates
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      if (end < start) {
        alert('❌ End date must be after start date')
        setLoading(false)
        return
      }
    }

    const packageData = {
      name: formData.name,
      description: formData.description || '',
      price: parseFloat(formData.price) || 0,
      duration_days: parseInt(formData.duration_days) || 1,
      max_guests: parseInt(formData.max_guests) || 10,
      includes: formData.includes ? formData.includes.split(',').map(item => item.trim()) : [],
      excludes: formData.excludes ? formData.excludes.split(',').map(item => item.trim()) : [],
      status: formData.status || 'active',
      user_id: userId,
      // Date fields
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      available_from: formData.available_from || null,
      available_to: formData.available_to || null,
      season: formData.season || null
    }

    console.log('📦 Creating package:', packageData)

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
      // Generate availability dates for new packages
      if (!editingPackage && formData.start_date && formData.end_date && newPackageId) {
        await generateAvailability(
          newPackageId,
          formData.start_date,
          formData.end_date,
          formData.max_guests
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
      max_guests: 10,
      includes: '',
      excludes: '',
      status: 'active',
      start_date: '',
      end_date: '',
      available_from: '',
      available_to: '',
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
      max_guests: pkg.max_guests || 10,
      includes: pkg.includes ? pkg.includes.join(', ') : '',
      excludes: pkg.excludes ? pkg.excludes.join(', ') : '',
      status: pkg.status || 'active',
      start_date: pkg.start_date || '',
      end_date: pkg.end_date || '',
      available_from: pkg.available_from || '',
      available_to: pkg.available_to || '',
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
          🏝️ Tour Packages ({packages.length})
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
          {showForm ? '✕ Cancel' : '+ Add Package'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(26, 43, 60, 0.06)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>
            {editingPackage ? '✏️ Edit Package' : '➕ Add New Package'}
          </h3>
          <form onSubmit={handleSubmit}>
            {/* Basic Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Package Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Price ($) *
                </label>
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 1
                    setFormData({ 
                      ...formData, 
                      duration_days: days,
                      end_date: calculateEndDate(formData.start_date, days)
                    })
                  }}
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Max Guests
                </label>
                <input
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 10 })}
                  min="1"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
            </div>

            {/* Date Section */}
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#f8fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                📅 Package Schedule & Availability
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '0.25rem', color: '#475569' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => {
                      const startDate = e.target.value
                      setFormData({ 
                        ...formData, 
                        start_date: startDate,
                        end_date: calculateEndDate(startDate, formData.duration_days)
                      })
                    }}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '0.25rem', color: '#475569' }}>
                    End Date
                  </label>
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '0.25rem', color: '#475569' }}>
                    Season
                  </label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="">Select season...</option>
                    <option value="Spring">🌸 Spring</option>
                    <option value="Summer">☀️ Summer</option>
                    <option value="Fall">🍂 Fall</option>
                    <option value="Winter">❄️ Winter</option>
                    <option value="Year-round">🔄 Year-round</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '0.25rem', color: '#475569' }}>
                    Available From
                  </label>
                  <input
                    type="date"
                    value={formData.available_from}
                    onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '0.25rem', color: '#475569' }}>
                    Available To
                  </label>
                  <input
                    type="date"
                    value={formData.available_to}
                    onChange={(e) => setFormData({ ...formData, available_to: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
              </div>
              
              {/* Info message */}
              {formData.start_date && formData.end_date && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  fontSize: '12px', 
                  color: '#64748b',
                  padding: '0.5rem',
                  background: '#e2e8f0',
                  borderRadius: '4px'
                }}>
                  📊 This will create availability for {generateDateRange(formData.start_date, formData.end_date).length} days
                </div>
              )}
            </div>

            {/* Description */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                placeholder="Describe the tour..."
              />
            </div>

            {/* Includes/Excludes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Includes (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.includes}
                  onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  placeholder="Meals, Transport, Guide"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Excludes (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.excludes}
                  onChange={(e) => setFormData({ ...formData, excludes: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  placeholder="Flights, Insurance, Tips"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 2rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? 'Saving...' : (editingPackage ? 'Update Package' : 'Add Package')}
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
          borderRadius: '16px',
          border: '1px dashed rgba(26, 43, 60, 0.1)'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>🏝️</span>
          <p>No tour packages yet. Create your first package above!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {packages.map((pkg) => (
            <div key={pkg.id} style={{
              background: 'white',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {pkg.name}
                  </h4>
                  <span style={{
                    fontSize: '11px',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: pkg.status === 'active' ? '#f0fdf4' : '#fef2f2',
                    color: pkg.status === 'active' ? '#22c55e' : '#ef4444'
                  }}>
                    {pkg.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => editPackage(pkg)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
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
                      fontSize: '12px',
                      color: '#ef4444'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '0.25rem' }}>
                {pkg.description || 'No description'}
              </p>
              
              <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span>💰 ${pkg.price}</span>
                <span>📅 {pkg.duration_days} days</span>
                <span>👥 {pkg.max_guests} guests</span>
              </div>

              {/* Date Display */}
              {(pkg.start_date || pkg.available_from || pkg.season) && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '12px', 
                  color: '#475569',
                  padding: '0.5rem',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}>
                  {pkg.season && <div>🌤️ Season: {pkg.season}</div>}
                  {pkg.start_date && (
                    <div>📅 Starts: {formatDate(pkg.start_date)}</div>
                  )}
                  {pkg.end_date && (
                    <div>📅 Ends: {formatDate(pkg.end_date)}</div>
                  )}
                  {pkg.available_from && pkg.available_to && (
                    <div>🔄 Available: {formatDate(pkg.available_from)} - {formatDate(pkg.available_to)}</div>
                  )}
                </div>
              )}

              {/* Includes/Excludes */}
              {pkg.includes && pkg.includes.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#6b7280' }}>
                  ✅ Includes: {pkg.includes.join(', ')}
                </div>
              )}
              {pkg.excludes && pkg.excludes.length > 0 && (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  ❌ Excludes: {pkg.excludes.join(', ')}
                </div>
              )}

              {/* Availability & Booking */}
              <details style={{ marginTop: '0.75rem' }}>
                <summary style={{
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#E88D5C'
                }}>
                  📅 Availability & Booking
                </summary>
                <div style={{ marginTop: '0.75rem' }}>
                  <AvailabilityCalendar packageId={pkg.id} />
                  <Booking user={user} packageId={pkg.id} />
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TourPackages