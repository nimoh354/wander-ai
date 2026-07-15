// src/components/SlidePanel.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SlidePanel({ open, onClose, title, children }) {
  // Handle close with safety check
  const handleClose = () => {
    console.log('SlidePanel: Closing panel')
    if (typeof onClose === 'function') {
      onClose()
    } else {
      console.warn('SlidePanel: onClose is not a function', onClose)
    }
  }

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log('SlidePanel: Backdrop clicked')
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.35)'
          }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(980px, 100%)',
              height: '100vh',
              background: 'var(--panel-bg, white)',
              padding: '1.25rem 1.5rem',
              boxShadow: '-12px 0 30px rgba(0,0,0,0.12)',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1rem',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Back to Dashboard"
                  style={{
                    background: 'transparent',
                    color: 'inherit',
                    border: '2px solid transparent',
                    padding: '0.35rem 0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  ← Back
                </button>
                <h2 style={{ margin: 0 }}>{title}</h2>
              </div>
              <button 
                type="button" 
                onClick={handleClose} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  fontSize: '18px', 
                  cursor: 'pointer',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '8px'
                }} 
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div>
              {children}
            </div>

            {/* Footer */}
            <div style={{ 
              marginTop: '1.5rem', 
              display: 'flex', 
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}