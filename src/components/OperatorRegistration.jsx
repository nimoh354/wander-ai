// src/components/OperatorRegistration.jsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'

function OperatorRegistration({ user, onRegistered }) {
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const { darkMode } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      // First, update the user's profile to set user_type = 'operator'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: 'operator' })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Then create the operator profile
      const { error: operatorError } = await supabase
        .from('operators')
        .insert([
          {
            id: user.id,
            business_name: businessName,
            description: description,
            phone: phone,
            website: website,
            is_verified: false
          }
        ])

      if (operatorError) throw operatorError

      setMessage('✅ Operator profile created successfully! Redirecting to your operator dashboard...')
      setMessageType('success')
      
      // Reset form
      setBusinessName('')
      setDescription('')
      setPhone('')
      setWebsite('')
      
      // Wait 2 seconds then call onRegistered
      setTimeout(() => {
        if (onRegistered) onRegistered()
      }, 2000)
    } catch (error) {
      setMessage(`❌ ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: darkMode ? '#1a1a2e' : 'white',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: darkMode 
        ? '0 8px 32px rgba(0,0,0,0.4)' 
        : '0 8px 32px rgba(0,0,0,0.08)',
      maxWidth: '550px',
      margin: '0 auto',
      border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(26,43,60,0.06)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          margin: '0 auto 1rem',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
        }}>
          🏢
        </div>
        <h2 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: darkMode ? '#e4e4e7' : '#1a1a2e',
          margin: 0,
          fontFamily: "'Playfair Display', serif"
        }}>
          Become a Tour Operator
        </h2>
        <p style={{
          color: darkMode ? '#a1a1aa' : '#6b7280',
          marginTop: '0.5rem',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          Register your business and start receiving bookings from travelers!
        </p>
      </div>

      {/* Features List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: darkMode ? '#0f0f1a' : '#f9fafb',
        borderRadius: '12px'
      }}>
        {[
          { icon: '📦', label: 'List Tours' },
          { icon: '📋', label: 'Manage Bookings' },
          { icon: '💰', label: 'Earn Revenue' },
          { icon: '⭐', label: 'Get Reviews' }
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '13px',
            color: darkMode ? '#a1a1aa' : '#6b7280'
          }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Business Name */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#e4e4e7' : '#374151',
            marginBottom: '0.5rem'
          }}>
            Business Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            overflow: 'hidden'
          }}>
            <span style={{
              padding: '0 0.75rem',
              color: darkMode ? '#a1a1aa' : '#6b7280',
              fontSize: '18px'
            }}>
              🏪
            </span>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '0.75rem 0.75rem 0.75rem 0',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                outline: 'none'
              }}
              placeholder="e.g., Safari Adventures Ltd"
              onFocus={(e) => {
                e.target.parentElement.style.borderColor = '#8B5CF6'
                e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.parentElement.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
                e.target.parentElement.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#e4e4e7' : '#374151',
            marginBottom: '0.5rem'
          }}>
            Business Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
              color: darkMode ? '#e4e4e7' : '#1a1a2e',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            placeholder="Tell travelers about your services..."
            onFocus={(e) => {
              e.target.style.borderColor = '#8B5CF6'
              e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#e4e4e7' : '#374151',
            marginBottom: '0.5rem'
          }}>
            Phone Number
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            overflow: 'hidden'
          }}>
            <span style={{
              padding: '0 0.75rem',
              color: darkMode ? '#a1a1aa' : '#6b7280',
              fontSize: '18px'
            }}>
              📞
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 0.75rem 0.75rem 0',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                outline: 'none'
              }}
              placeholder="+254 700 123 456"
              onFocus={(e) => {
                e.target.parentElement.style.borderColor = '#8B5CF6'
                e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.parentElement.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
                e.target.parentElement.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Website */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: darkMode ? '#e4e4e7' : '#374151',
            marginBottom: '0.5rem'
          }}>
            Website <span style={{ color: '#6b7280', fontWeight: '400' }}>(optional)</span>
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
            border: `2px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
            borderRadius: '12px',
            transition: 'all 0.2s ease',
            overflow: 'hidden'
          }}>
            <span style={{
              padding: '0 0.75rem',
              color: darkMode ? '#a1a1aa' : '#6b7280',
              fontSize: '18px'
            }}>
              🌐
            </span>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 0.75rem 0.75rem 0',
                border: 'none',
                background: 'transparent',
                fontSize: '15px',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                outline: 'none'
              }}
              placeholder="https://yourbusiness.com"
              onFocus={(e) => {
                e.target.parentElement.style.borderColor = '#8B5CF6'
                e.target.parentElement.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.parentElement.style.borderColor = darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
                e.target.parentElement.style.boxShadow = 'none'
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem',
            background: loading 
              ? '#6b7280' 
              : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            boxShadow: loading 
              ? 'none' 
              : '0 4px 16px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'scale(1.02)'
              e.target.style.boxShadow = '0 6px 24px rgba(139, 92, 246, 0.4)'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)'
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{
                display: 'inline-block',
                width: '18px',
                height: '18px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              Registering...
            </span>
          ) : (
            '🚀 Register as Operator'
          )}
        </button>
      </form>

      {/* Message */}
      {message && (
        <div style={{
          marginTop: '1.25rem',
          padding: '0.75rem 1rem',
          background: messageType === 'success'
            ? (darkMode ? 'rgba(34, 197, 94, 0.12)' : '#f0fdf4')
            : (darkMode ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'),
          color: messageType === 'success' ? '#22c55e' : '#ef4444',
          borderRadius: '12px',
          fontSize: '14px',
          textAlign: 'center',
          border: messageType === 'success'
            ? (darkMode ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid #bbf7d0')
            : (darkMode ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #fecaca')
        }}>
          {message}
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}`,
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '12px',
          color: darkMode ? '#6b7280' : '#9ca3af'
        }}>
          By registering, you agree to our terms of service. Your business will be reviewed before going live.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default OperatorRegistration