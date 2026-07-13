import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SlidePanel({ open, onClose, title, children }) {
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
          onClick={() => {
            console.log('SlidePanel: backdrop clicked')
            if (typeof onClose === 'function') onClose()
            else console.warn('SlidePanel: onClose not provided')
          }}
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
              boxShadow: ' -12px 0 30px rgba(0,0,0,0.12)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => { console.log('SlidePanel: header back clicked'); if (typeof onClose === 'function') onClose() }}
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
              <button type="button" onClick={() => { console.log('SlidePanel: header close clicked'); if (typeof onClose === 'function') onClose() }} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer' }} aria-label="Close">✕</button>
            </div>
            <div>
              {children}
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => { console.log('SlidePanel: footer back clicked'); if (typeof onClose === 'function') onClose() }}
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
