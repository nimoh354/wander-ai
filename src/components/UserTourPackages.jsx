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

  const fetchPackages = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error: fetchError } = await supabase
        .from('tour_packages')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError('Failed to load packages')
        setPackages([])
        return
      }

      if (!data || data.length === 0) {
        setPackages([])
        setLoading(false)
        return
      }

      setPackages(data)

    } catch (err) {
      setError('Failed to load packages')
      setPackages([])
    } finally {
      setLoading(false)
    }
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
          <p>No tour packages available yet.</p>
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
          {packages.map((pkg) => (
            <div key={pkg.id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'
              e.target.style.transform = 'translateY(0)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '0.25rem' }}>
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
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>
                  {pkg.description || 'No description'}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '14px',
                  color: '#6b7280',
                  flexWrap: 'wrap',
                  marginBottom: '0.5rem'
                }}>
                  <span>💰 ${pkg.price}</span>
                  <span>📅 {pkg.duration_days} days</span>
                  <span>👥 {pkg.max_guests} guests</span>
                </div>
                {pkg.season && (
                  <span style={{
                    fontSize: '12px',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    background: '#fef3c7',
                    color: '#d97706'
                  }}>
                    🌤️ {pkg.season}
                  </span>
                )}
                {pkg.includes && pkg.includes.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                    ✅ Includes: {pkg.includes.join(', ')}
                  </div>
                )}
              </div>
              
              {/* Booking Form */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(26, 43, 60, 0.06)' }}>
                <Booking user={user} packageId={pkg.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserTourPackages