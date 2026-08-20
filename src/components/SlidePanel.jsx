// src/components/SlidePanel.jsx
import React, { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

function SlidePanel({ open, onClose, title, children }) {
  const { darkMode } = useTheme()
  const panelRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [open])

  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div
        ref={panelRef}
        style={{
          width: '100%',
          maxWidth: '600px',
          height: '100%',
          background: darkMode ? '#0d1b33' : 'white',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          padding: '2rem',
          overflowY: 'auto',
          animation: 'slideIn 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#e5e7eb'}`
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            fontFamily: "'Playfair Display', serif",
            color: darkMode ? '#e8edf5' : '#1a1a2e',
            margin: 0
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: darkMode ? '#7a8ba8' : '#6b7280',
              padding: '0.25rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = darkMode ? '#e8edf5' : '#1a1a2e'
              e.target.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.color = darkMode ? '#7a8ba8' : '#6b7280'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default SlidePanel