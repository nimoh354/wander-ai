// src/pages/Login.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { sendVerificationEmail } from '../services/emailService'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [debug, setDebug] = useState([])
  const { darkMode } = useTheme()

  const addDebug = (label, data) => {
    console.log(`🔍 ${label}:`, data)
    setDebug(prev => [...prev, { time: new Date().toLocaleTimeString(), label, data: JSON.stringify(data, null, 2) }])
  }

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        addDebug('Checking Supabase connection', { url: import.meta.env.VITE_SUPABASE_URL })
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          addDebug('⚠️ Supabase connection error', error)
        } else {
          addDebug('Supabase connected', { session: data.session ? 'exists' : 'none' })
        }
      } catch (err) {
        addDebug('Supabase connection failed', err.message)
      }
    }
    checkSupabase()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    addDebug('Form submitted', { isSignUp, email })

    try {
      if (isSignUp) {
        addDebug('Attempting signup', { email })

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: email.split('@')[0] || 'Traveler',
              user_type: 'tourist'
            }
          }
        })

        addDebug('Signup response', { data, error })

        if (error) {
          addDebug('Signup error', error)
          throw error
        }

        if (data.user) {
          addDebug('User created', { id: data.user.id, email: data.user.email })
          
          // ✅ Send verification email via EmailJS
          try {
            const result = await sendVerificationEmail(
              email,
              email.split('@')[0] || 'Traveler',
              `${window.location.origin}/login?email=${encodeURIComponent(email)}`
            )
            if (result.success) {
              addDebug('Verification email sent')
            } else {
              addDebug('Email error:', result.error)
            }
          } catch (emailErr) {
            addDebug('Email error:', emailErr.message)
          }

          setMessage('Account created! Please check your email to verify your account.')
          setMessageType('success')

          // ✅ Profile is created automatically by database trigger
          // No manual upsert needed!

          setTimeout(() => {
            setIsSignUp(false)
            setPassword('')
          }, 4000)
        }
      } else {
        addDebug('Attempting login', { email })

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        })

        addDebug('Login response', { data, error })

        if (error) {
          addDebug('Login error', error)
          
          if (error.message.includes('Email not confirmed')) {
            setMessage('Email not verified. Please check your inbox for the verification link.')
            setMessageType('error')
            setLoading(false)
            return
          }
          
          throw error
        }

        if (data.user) {
          addDebug('User logged in', { id: data.user.id })
          setMessage('Login successful! Redirecting...')
          setMessageType('success')

          // ✅ Profile already exists from trigger, no need to check/create

          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1500)
        }
      }
    } catch (error) {
      addDebug('Caught error', { message: error.message })

      if (error.message?.includes('rate limit')) {
        setMessage('Too many attempts. Please wait 5-10 minutes.')
      } else if (error.message?.includes('already registered')) {
        setMessage('This email is already registered. Please login.')
      } else if (error.message?.includes('Invalid login')) {
        setMessage('Invalid email or password. Please try again.')
      } else if (error.message?.includes('Email not confirmed')) {
        setMessage('Please verify your email before logging in. Check your inbox!')
      } else {
        setMessage(`${error.message || 'Something went wrong. Please try again.'}`)
      }
      setMessageType('error')
    } finally {
      setLoading(false)
      addDebug('Process complete', { loading: false })
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address first.')
      setMessageType('error')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim()
      })

      if (error) throw error

      await sendVerificationEmail(
        email,
        email.split('@')[0] || 'Traveler',
        `${window.location.origin}/login?email=${encodeURIComponent(email)}`
      )

      setMessage('Verification email resent! Please check your inbox.')
      setMessageType('success')
    } catch (error) {
      setMessage(`${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: darkMode
        ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
        : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
        borderRadius: '50%',
        opacity: darkMode ? 0.08 : 0.12,
        filter: 'blur(80px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: '350px',
        height: '350px',
        background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
        borderRadius: '50%',
        opacity: darkMode ? 0.08 : 0.12,
        filter: 'blur(80px)'
      }} />

      <div style={{
        background: darkMode
          ? 'rgba(26, 26, 46, 0.85)'
          : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        padding: '2.5rem',
        borderRadius: '24px',
        boxShadow: darkMode
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(139, 92, 246, 0.12)',
        maxWidth: '500px',
        width: '100%',
        border: darkMode
          ? '1px solid rgba(255,255,255,0.05)'
          : '1px solid rgba(255,255,255,0.5)',
        position: 'relative',
        zIndex: 1,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '56px',
            display: 'block',
            marginBottom: '0.5rem',
            animation: 'float 3s ease-in-out infinite'
          }}>
            🌍
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
            letterSpacing: '-0.5px'
          }}>
            WanderAI
          </h1>
          <p style={{
            color: darkMode ? '#a1a1aa' : '#6b7280',
            fontSize: '15px',
            fontWeight: '400'
          }}>
            {isSignUp ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: darkMode ? '#e4e4e7' : '#374151',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: darkMode
                  ? '2px solid rgba(255,255,255,0.08)'
                  : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                background: darkMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: darkMode ? '#e4e4e7' : '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: darkMode
                  ? '2px solid rgba(255,255,255,0.08)'
                  : '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                background: darkMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1rem',
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
            {message.includes('verify') && (
              <button
                onClick={resendVerification}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.2rem 0.75rem',
                  background: 'transparent',
                  border: '1px solid #8B5CF6',
                  borderRadius: '4px',
                  color: '#8B5CF6',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Resend Email
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setMessage('')
            setMessageType('')
            setDebug([])
          }}
          style={{
            width: '100%',
            marginTop: '1.25rem',
            padding: '0.5rem',
            background: 'transparent',
            color: darkMode ? '#a78bfa' : '#8B5CF6',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>

        {debug.length > 0 && (
          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem',
            background: darkMode ? '#0f0f1a' : '#f8fafc',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}`,
            maxHeight: '200px',
            overflow: 'auto',
            fontSize: '11px',
            fontFamily: 'monospace'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem'
            }}>
              <strong style={{ color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>Debug Log</strong>
              <button
                onClick={() => setDebug([])}
                style={{
                  padding: '0.15rem 0.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Clear
              </button>
            </div>
            {debug.map((item, index) => (
              <div key={index} style={{
                padding: '0.2rem 0',
                borderBottom: index < debug.length - 1 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0'}` : 'none',
                color: darkMode ? '#a1a1aa' : '#4b5563'
              }}>
                <span style={{ color: '#6b7280', fontSize: '10px' }}>[{item.time}]</span>
                <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>{item.label}</span>
                <div style={{
                  padding: '0.15rem 0.3rem',
                  marginTop: '0.15rem',
                  background: darkMode ? 'rgba(255,255,255,0.03)' : '#f1f5f9',
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: darkMode ? '#94a3b8' : '#64748b',
                  wordBreak: 'break-all',
                  maxHeight: '60px',
                  overflow: 'auto'
                }}>
                  {item.data}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login