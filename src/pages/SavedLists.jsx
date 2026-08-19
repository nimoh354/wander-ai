// src/pages/SavedLists.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

function SavedLists({ user, onLogout, onBack }) {  // ✅ Added onBack prop
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const { darkMode } = useTheme()

  useEffect(() => {
    if (user) {
      loadSavedLists()
    }
  }, [user])

  const loadSavedLists = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('packing_lists')
        .select(`
          *,
          trips (
            id,
            destination,
            duration_days,
            start_date
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error loading saved lists:', error)
        return
      }

      setLists(data || [])
      console.log(`✅ Loaded ${data?.length || 0} saved packing lists`)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteList = async (listId) => {
    if (!confirm('Are you sure you want to delete this packing list?')) return

    try {
      const { error } = await supabase
        .from('packing_lists')
        .delete()
        .eq('id', listId)

      if (error) {
        alert('Failed to delete list: ' + error.message)
        return
      }

      setLists(lists.filter(list => list.id !== listId))
      alert('✅ Packing list deleted!')
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Failed to delete list')
    }
  }

  const viewPackingList = (trip) => {
    window.location.href = `/packing/${trip.id}`
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        color: '#6b7280'
      }}>
        <p>Loading your saved lists...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Back Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            fontFamily: "'Playfair Display', serif",
            color: darkMode ? '#e4e4e7' : '#1a1a2e',
            margin: 0
          }}>
            📋 Saved Packing Lists
          </h1>
          <p style={{
            color: darkMode ? '#a1a1aa' : '#6b7280',
            marginTop: '0.25rem'
          }}>
            {lists.length} list{lists.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '0.6rem 1.5rem',
              background: 'transparent',
              color: darkMode ? '#e4e4e7' : '#1a1a2e',
              border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = darkMode ? '#2d2d44' : '#1a1a2e'
              e.target.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent'
              e.target.style.color = darkMode ? '#e4e4e7' : '#1a1a2e'
            }}
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <div style={{
          background: darkMode ? '#1a1a2e' : 'white',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '2px dashed rgba(26, 43, 60, 0.1)'
        }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '1rem' }}>🧳</span>
          <h3 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: darkMode ? '#e4e4e7' : '#1a1a2e',
            marginBottom: '0.5rem'
          }}>
            No saved packing lists yet
          </h3>
          <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto' }}>
            Create and save a packing list for your trips to see them here.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              ← Go to Dashboard
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1rem'
        }}>
          {lists.map((list) => {
            const trip = list.trips
            const itemsCount = list.items?.length || 0
            const checkedItems = list.items?.filter(item => item.checked)?.length || 0
            const progress = itemsCount > 0 ? Math.round((checkedItems / itemsCount) * 100) : 0

            return (
              <div
                key={list.id}
                style={{
                  background: darkMode ? '#1a1a2e' : 'white',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(26, 43, 60, 0.06)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: darkMode ? '#e4e4e7' : '#1a1a2e',
                        margin: 0
                      }}>
                        📍 {trip?.destination || 'Unknown Trip'}
                      </h3>
                      <span style={{
                        fontSize: '11px',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px',
                        background: progress === 100 ? '#f0fdf4' : '#f3f4f6',
                        color: progress === 100 ? '#22c55e' : '#6b7280'
                      }}>
                        {progress === 100 ? '✅ Complete!' : `${progress}% packed`}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '13px',
                      color: '#6b7280',
                      marginTop: '0.25rem',
                      flexWrap: 'wrap'
                    }}>
                      <span>📦 {itemsCount} items</span>
                      <span>✅ {checkedItems} packed</span>
                      {trip?.duration_days && (
                        <span>📅 {trip.duration_days} days</span>
                      )}
                      {list.updated_at && (
                        <span>🔄 Updated {new Date(list.updated_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => {
                        window.location.href = `/packing/${trip.id}`
                      }}
                      style={{
                        padding: '0.5rem 1.2rem',
                        background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)'
                      }}
                    >
                      👁️ View List
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      style={{
                        padding: '0.5rem 1.2rem',
                        background: 'transparent',
                        color: '#ef4444',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '13px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#ef4444'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#ef4444'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: '#f3f4f6',
                  borderRadius: '2px',
                  marginTop: '0.75rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: progress === 100 ? '#22c55e' : 'linear-gradient(90deg, #E88D5C, #F4C542)',
                    borderRadius: '2px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>

                {/* Preview items */}
                {list.items && list.items.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginTop: '0.5rem'
                  }}>
                    {list.items.slice(0, 5).map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '12px',
                          padding: '0.15rem 0.6rem',
                          borderRadius: '12px',
                          background: item.checked ? '#f0fdf4' : '#f3f4f6',
                          color: item.checked ? '#22c55e' : '#6b7280',
                          textDecoration: item.checked ? 'line-through' : 'none'
                        }}
                      >
                        {item.name}
                      </span>
                    ))}
                    {list.items.length > 5 && (
                      <span style={{
                        fontSize: '12px',
                        padding: '0.15rem 0.6rem',
                        borderRadius: '12px',
                        background: '#f3f4f6',
                        color: '#6b7280'
                      }}>
                        +{list.items.length - 5} more
                      </span>
                    )}
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

export default SavedLists