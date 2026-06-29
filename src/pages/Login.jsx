import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import { sendWelcomeEmail } from '../services/emailService'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { darkMode } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('✅ Account created! Check your email for confirmation.')
        
        // Create profile for new user
        if (data.user) {
          await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: data.user.email?.split('@')[0] || 'Traveler',
                user_type: 'tourist'
              }
            ])
          
          // 🚀 SEND WELCOME EMAIL - MOVED INSIDE HERE
          try {
            await sendWelcomeEmail({
              email: data.user.email,
              full_name: data.user.email?.split('@')[0] || 'Traveler'
            })
            console.log('✅ Welcome email sent!')
          } catch (emailError) {
            console.log('⚠️ Welcome email skipped:', emailError.message)
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setMessage('✅ Login successful! Redirecting...')
        
        // Check if profile exists for existing user
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()
          
          // If no profile exists, create one
          if (!profile) {
            await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  full_name: data.user.email?.split('@')[0] || 'Traveler',
                  user_type: 'tourist'
                }
              ])
          }
        }
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`)
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
      {/* Decorative background elements */}
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
        maxWidth: '420px',
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
              onFocus={(e) => {
                e.target.style.borderColor = '#8B5CF6'
                e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = darkMode 
                  ? 'rgba(255,255,255,0.08)' 
                  : '#e5e7eb'
                e.target.style.boxShadow = 'none'
              }}
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
              onFocus={(e) => {
                e.target.style.borderColor = '#8B5CF6'
                e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = darkMode 
                  ? 'rgba(255,255,255,0.08)' 
                  : '#e5e7eb'
                e.target.style.boxShadow = 'none'
              }}
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
              opacity: loading ? 0.7 : 1,
              transform: loading ? 'none' : 'scale(1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.01)'
                e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = 'none'
            }}
          >
            {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: message.includes('✅') 
              ? (darkMode ? 'rgba(34, 197, 94, 0.12)' : '#f0fdf4')
              : (darkMode ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'),
            color: message.includes('✅') ? '#22c55e' : '#ef4444',
            borderRadius: '12px',
            fontSize: '14px',
            textAlign: 'center',
            border: message.includes('✅')
              ? (darkMode ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid #bbf7d0')
              : (darkMode ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid #fecaca')
          }}>
            {message}
          </div>
        )}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            width: '100%',
            marginTop: '1.25rem',
            padding: '0.5rem',
            background: 'transparent',
            color: darkMode ? '#a78bfa' : '#8B5CF6',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            borderRadius: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = darkMode ? 'rgba(167, 139, 250, 0.08)' : 'rgba(139, 92, 246, 0.06)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
          }}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  )
}

export default Login