// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'

function Navbar({ user, onLogout }) {
  const { darkMode, toggleDarkMode } = useTheme()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [userName, setUserName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setAvatarUrl(data.avatar_url || '')
        setUserName(data.full_name || user?.email?.split('@')[0] || 'Traveler')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  // ✅ FIXED: All navigation stays inside Dashboard using URL parameters
  const handleNavigate = (page) => {
    setShowDropdown(false)
    
    // All pages are inside dashboard with URL parameters
    if (page === 'profile') {
      window.location.href = '/dashboard?profile=true'
    } else if (page === 'savedLists') {
      window.location.href = '/dashboard?savedLists=true'
    } else if (page === 'tourPackages') {
      window.location.href = '/dashboard?tourPackages=true'
    } else if (page === 'bookings') {
      window.location.href = '/dashboard?bookings=true'
    } else if (page === 'stats') {
      window.location.href = '/dashboard?stats=true'
    } else if (page === 'reviews') {
      window.location.href = '/dashboard?reviews=true'
    } else if (page === 'settings') {
      window.location.href = '/dashboard'
    }
  }

  const handleLogoutClick = () => {
    setShowDropdown(false)
    onLogout()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <nav className="navbar" style={{
      padding: '0.75rem 2rem',
      borderBottom: darkMode ? '1px solid #2d2d44' : '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      background: darkMode ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      flexWrap: 'wrap',
      gap: '0.5rem'
    }}>
      {/* Logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '28px' }}>🌍</span>
        <span style={{
          fontSize: '24px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          WanderAI
        </span>
        <span style={{
          fontSize: '10px',
          background: '#8B5CF6',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontWeight: '600'
        }}>
          BETA
        </span>
      </div>

      {/* Center Navigation Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        {/* AI Assistant Link */}
        <span
          onClick={() => window.location.href = '/assistant'}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.35)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.25)'
          }}
        >
          🤖 Assistant
        </span>

        {/* Admin Link */}
        <span
          onClick={() => window.location.href = '/admin'}
          style={{
            fontSize: '12px',
            color: darkMode ? '#6b7280' : '#9ca3af',
            cursor: 'pointer',
            opacity: 0.6,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '1'
            e.target.style.color = darkMode ? '#e4e4e7' : '#1a1a2e'
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '0.6'
            e.target.style.color = darkMode ? '#6b7280' : '#9ca3af'
          }}
        >
          ⚙️ Admin
        </span>
      </div>

      {/* Right Side - User Profile with Dropdown */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            padding: '0.4rem',
            background: darkMode ? '#2d2d44' : '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Instagram-Style Profile Dropdown */}
        <div className="profile-dropdown" style={{ position: 'relative' }}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem 0.25rem 0.25rem',
              borderRadius: '20px',
              transition: 'all 0.2s ease',
              background: showDropdown 
                ? (darkMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6')
                : (darkMode ? 'rgba(255,255,255,0.05)' : 'transparent'),
              border: `1px solid ${showDropdown ? (darkMode ? 'rgba(255,255,255,0.15)' : '#e5e7eb') : 'transparent'}`
            }}
            onMouseEnter={(e) => {
              if (!showDropdown) {
                e.target.style.background = darkMode ? 'rgba(255,255,255,0.08)' : '#f3f4f6'
                e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'
              }
            }}
            onMouseLeave={(e) => {
              if (!showDropdown) {
                e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'transparent'
                e.target.style.borderColor = 'transparent'
              }
            }}
          >
            {/* Profile Photo */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${darkMode ? '#8B5CF6' : '#8B5CF6'}`,
              flexShrink: 0,
              background: darkMode ? '#2d2d44' : '#f0f0f0'
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
                  fontSize: '16px',
                  color: darkMode ? '#7a8ba8' : '#6b7280'
                }}>
                  👤
                </div>
              )}
            </div>

            {/* Username */}
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: darkMode ? '#e4e4e7' : '#1a1a2e',
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {userName}
            </span>

            {/* Dropdown Arrow */}
            <span style={{
              fontSize: '12px',
              color: darkMode ? '#7a8ba8' : '#9ca3af',
              transition: 'transform 0.2s ease',
              transform: showDropdown ? 'rotate(180deg)' : 'rotate(0)'
            }}>
              ▼
            </span>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              minWidth: '220px',
              background: darkMode ? '#1a1a2e' : 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e5e7eb'}`,
              overflow: 'hidden',
              animation: 'dropdownSlideIn 0.2s ease',
              zIndex: 200
            }}>
              {/* User Info */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: `2px solid ${darkMode ? '#8B5CF6' : '#8B5CF6'}`,
                    flexShrink: 0,
                    background: darkMode ? '#2d2d44' : '#f0f0f0'
                  }}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: darkMode ? '#7a8ba8' : '#6b7280'
                      }}>
                        👤
                      </div>
                    )}
                  </div>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: darkMode ? '#e4e4e7' : '#1a1a2e',
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      {userName}
                    </p>
                    <p style={{
                      color: darkMode ? '#7a8ba8' : '#6b7280',
                      margin: 0,
                      fontSize: '12px'
                    }}>
                      {user?.email || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div>
                {/* Profile */}
                <div
                  onClick={() => handleNavigate('profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: darkMode ? '#e4e4e7' : '#1a1a2e'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>👤</span>
                  <span>My Profile</span>
                </div>

                {/* Saved Lists */}
                <div
                  onClick={() => handleNavigate('savedLists')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: darkMode ? '#e4e4e7' : '#1a1a2e'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📋</span>
                  <span>Saved Lists</span>
                </div>

                {/* Tour Packages */}
                <div
                  onClick={() => handleNavigate('tourPackages')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: darkMode ? '#e4e4e7' : '#1a1a2e'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🏝️</span>
                  <span>Tour Packages</span>
                </div>

                {/* Bookings */}
                <div
                  onClick={() => handleNavigate('bookings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: darkMode ? '#e4e4e7' : '#1a1a2e'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📋</span>
                  <span>My Bookings</span>
                </div>

                {/* Stats */}
                <div
                  onClick={() => handleNavigate('stats')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: darkMode ? '#e4e4e7' : '#1a1a2e'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>📊</span>
                  <span>Your Stats</span>
                </div>

                {/* Reviews */}
                <div
                  onClick={() => handleNavigate('reviews')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: darkMode ? '#e4e4e7' : '#1a1a2e'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>⭐</span>
                  <span>My Reviews</span>
                </div>

                {/* Divider */}
                <div style={{
                  height: '1px',
                  background: darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0',
                  margin: '0.25rem 0'
                }} />

                {/* Settings */}
                <div
                  onClick={() => handleNavigate('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: darkMode ? '#e4e4e7' : '#1a1a2e'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>⚙️</span>
                  <span>Settings</span>
                </div>

                {/* Logout */}
                <div
                  onClick={handleLogoutClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: '#ef4444'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fef2f2'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>🚪</span>
                  <span>Logout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dropdownSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar