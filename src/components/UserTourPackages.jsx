// src/components/UserTourPackages.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Booking from './Booking'

function UserTourPackages({ user }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPackages()
  }, [])

  // ✅ FIXED: Same status logic as admin
  const getPackageStatus = (pkg) => {
    const today = new Date().toISOString().split('T')[0]
    
    // ✅ Check if status is inactive
    if (pkg.status === 'inactive') {
      return {
        type: 'inactive',
        label: '⛔ Inactive',
        color: '#6b7280',
        message: 'Currently unavailable'
      }
    }
    
    // ✅ Check end_date for expiration (SAME AS ADMIN)
    const endDate = pkg.end_date
    const hasEndDate = endDate && endDate !== ''
    const isDateExpired = hasEndDate && endDate < today
    
    if (isDateExpired) {
      return {
        type: 'expired',
        label: '⛔ Expired',
        color: '#ef4444',
        message: 'No longer available'
      }
    }
    
    // ✅ Check start_date for "Coming Soon" (SAME AS ADMIN)
    const startDate = pkg.start_date
    const hasStartDate = startDate && startDate !== ''
    const isDateComingSoon = hasStartDate && startDate > today
    
    if (isDateComingSoon) {
      return {
        type: 'coming_soon',
        label: '📅 Coming Soon',
        color: '#f59e0b',
        message: `Available from ${new Date(startDate).toLocaleDateString()}`
      }
    }
    
    // ✅ Check availability
    const hasFuture = pkg.futureDates && pkg.futureDates.length > 0
    
    if (!hasFuture) {
      return {
        type: 'no_dates',
        label: '📅 No Dates',
        color: '#6b7280',
        message: 'No future dates available'
      }
    }
    
    // ✅ Check if fully booked
    const hasSlots = pkg.futureDates.some(d => d.slots > 0)
    if (!hasSlots) {
      return {
        type: 'full',
        label: '🔴 Full',
        color: '#f59e0b',
        message: 'All dates fully booked'
      }
    }
    
    return {
      type: 'available',
      label: '✅ Available',
      color: '#22c55e',
      message: `${pkg.futureDates.length} dates available`
    }
  }

  const fetchPackages = async () => {
    setLoading(true)
    setError('')
    
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error: fetchError } = await supabase
        .from('tour_packages')
        .select(`
          *,
          availability (
            date,
            slots,
            booked
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError)
        setError('Failed to load packages')
        setPackages([])
        setLoading(false)
        return
      }

      const processedPackages = (data || []).map(pkg => {
        // ✅ Calculate future dates
        const futureDates = (pkg.availability || [])
          .filter(a => a.date >= today)
          .map(d => ({
            date: d.date,
            slots: d.slots - d.booked
          }))
        
        return {
          ...pkg,
          futureDates,
          hasFutureDates: futureDates.length > 0,
          statusInfo: getPackageStatus({
            ...pkg,
            futureDates
          })
        }
      })

      setPackages(processedPackages)

    } catch (err) {
      console.error('❌ Error:', err)
      setError('Failed to load packages')
      setPackages([])
    } finally {
      setLoading(false)
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
      'maasai': 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=400&fit=crop',
      'default': 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop'
    }
    
    for (const [key, url] of Object.entries(fallbacks)) {
      if (nameLower.includes(key)) return url
    }
    
    return fallbacks.default
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        <span>⏳ Loading packages...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        background: '#fef2f2',
        border: '1px solid #fca5a5',
        borderRadius: '8px',
        color: '#991b1b',
        textAlign: 'center'
      }}>
        ❌ {error}
        <button
          onClick={fetchPackages}
          style={{
            marginLeft: '0.5rem',
            padding: '0.25rem 0.75rem',
            background: '#991b1b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        fontFamily: "'Playfair Display', serif",
        color: '#1a1a2e',
        marginBottom: '1.5rem'
      }}>
        🏝️ Tour Packages ({packages.length})
      </h2>

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
          <p>No tour packages available at the moment.</p>
          <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>
            Check back soon for exciting adventures!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {packages.map((pkg) => {
            const status = pkg.statusInfo
            const isExpired = status?.type === 'expired'
            const isInactive = status?.type === 'inactive'
            const isComingSoon = status?.type === 'coming_soon'
            const isNoDates = status?.type === 'no_dates'
            const isFull = status?.type === 'full'
            const isAvailable = status?.type === 'available'
            
            return (
              <div key={pkg.id} style={{
                background: 'white',
                borderRadius: '16px',
                border: `1px solid ${
                  isExpired || isInactive ? '#fca5a5' 
                  : isComingSoon ? '#fcd34d' 
                  : isNoDates ? '#e5e7eb'
                  : isFull ? '#fde68a'
                  : 'rgba(26, 43, 60, 0.06)'
                }`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                opacity: (isExpired || isInactive) ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}>
                {/* Image Section */}
                <div style={{
                  height: '200px',
                  background: `url(${getImageUrl(pkg)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {/* Status Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '20px',
                    background: status?.color || '#22c55e',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}>
                    {status?.label || 'Available'}
                  </span>
                  
                  {/* Status Message */}
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '11px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {status?.message || 'Available now'}
                  </span>

                  {pkg.season && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      fontSize: '11px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      🌤️ {pkg.season}
                    </span>
                  )}
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h4 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600',
                      textDecoration: (isExpired || isInactive) ? 'line-through' : 'none',
                      color: (isExpired || isInactive) ? '#9ca3af' : '#1a1a2e'
                    }}>
                      {pkg.name}
                    </h4>
                    <span style={{
                      fontSize: '10px',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '12px',
                      background: '#e5e7eb',
                      color: '#6b7280'
                    }}>
                      #{packages.indexOf(pkg) + 1}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: '14px', 
                    color: (isExpired || isInactive) ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    {pkg.description || 'No description'}
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '14px',
                    color: (isExpired || isInactive) ? '#9ca3af' : '#6b7280',
                    flexWrap: 'wrap',
                    marginBottom: '0.5rem'
                  }}>
                    <span>💰 ${pkg.price}</span>
                    <span>📅 {pkg.duration_days} days</span>
                    <span>👥 {pkg.max_capacity} guests</span>
                  </div>
                  {pkg.includes && pkg.includes.length > 0 && (
                    <div style={{ fontSize: '12px', color: (isExpired || isInactive) ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                      ✅ Includes: {pkg.includes.join(', ')}
                    </div>
                  )}
                  
                  {/* ✅ Show date info on user dashboard */}
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#6b7280', 
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: '#f3f4f6',
                    borderRadius: '4px'
                  }}>
                    {pkg.start_date && (
                      <span>📅 Start: {new Date(pkg.start_date).toLocaleDateString()}</span>
                    )}
                    {pkg.end_date && (
                      <span style={{ marginLeft: '0.5rem' }}>
                        ⏳ End: {new Date(pkg.end_date).toLocaleDateString()}
                      </span>
                    )}
                    {!pkg.start_date && !pkg.end_date && (
                      <span>📅 No dates set</span>
                    )}
                  </div>
                  
                  {/* Status Messages */}
                  {isInactive && (
                    <div style={{ 
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid #d1d5db'
                    }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        ⛔ This package is currently inactive
                      </span>
                    </div>
                  )}
                  
                  {isComingSoon && (
                    <div style={{ 
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      background: '#fef3c7',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid #f59e0b'
                    }}>
                      <span style={{ fontSize: '13px', color: '#92400e' }}>
                        📅 Available from {new Date(pkg.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {isExpired && (
                    <div style={{ 
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      background: '#fee2e2',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid #ef4444'
                    }}>
                      <span style={{ fontSize: '13px', color: '#991b1b' }}>
                        ⛔ This package has expired and is no longer available.
                      </span>
                    </div>
                  )}

                  {isNoDates && (
                    <div style={{ 
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid #d1d5db'
                    }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        📅 No future dates available
                      </span>
                    </div>
                  )}

                  {isFull && (
                    <div style={{ 
                      marginTop: '0.75rem',
                      padding: '0.5rem',
                      background: '#fef3c7',
                      borderRadius: '8px',
                      textAlign: 'center',
                      border: '1px solid #f59e0b'
                    }}>
                      <span style={{ fontSize: '13px', color: '#92400e' }}>
                        🔴 All available dates are fully booked
                      </span>
                    </div>
                  )}
                </div>
                
                {/* ✅ Booking Form - Only show if available */}
                {isAvailable && user && (
                  <div style={{ 
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    borderTop: '1px solid rgba(26, 43, 60, 0.06)',
                    paddingTop: '1rem'
                  }}>
                    <Booking user={user} packageId={pkg.id} />
                  </div>
                )}

                {/* Login message for available packages */}
                {isAvailable && !user && (
                  <div style={{ 
                    padding: '0 1.5rem 1.5rem 1.5rem',
                    paddingTop: '1rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                      🔒 Please <a href="/login" style={{ color: '#8B5CF6', textDecoration: 'none' }}>login</a> to book this package
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserTourPackages