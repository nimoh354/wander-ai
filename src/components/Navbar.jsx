import React from 'react'
import { useTheme } from '../context/ThemeContext'

function Navbar({ user, onLogout }) {
  const { darkMode, toggleDarkMode } = useTheme()

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

      {/* Right Side */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
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

        <span style={{
          fontSize: '14px',
          color: darkMode ? '#a1a1aa' : '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '16px' }}>👤</span>
          {user?.email?.split('@')[0] || 'Traveler'}
        </span>
        <button
          onClick={onLogout}
          style={{
            padding: '0.4rem 1.2rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#dc2626'
            e.target.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#ef4444'
            e.target.style.transform = 'scale(1)'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar