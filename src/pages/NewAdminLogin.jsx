// src/pages/NewAdminLogin.jsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function NewAdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('login')
  const [debugInfo, setDebugInfo] = useState('')

  // ✅ CORRECT EMAIL
  const ADMIN_EMAIL = 'wanderaiadmin@gmail.com'
  const ADMIN_PASSWORD = 'Admin123!'

  const createAndLoginAdmin = async () => {
    try {
      setDebugInfo('🔍 Checking if admin exists...')
      
      // Step 1: Try to sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      })

      if (!signInError && signInData?.user) {
        setDebugInfo('✅ Admin exists, logging in...')
        return { success: true, user: signInData.user }
      }

      setDebugInfo('🆕 Admin not found, creating...')

      // Step 2: Sign up (create the user)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            full_name: 'Admin',
            user_type: 'admin'
          }
        }
      })

      if (signUpError) {
        setDebugInfo('❌ Signup error: ' + signUpError.message)
        return { 
          success: false, 
          error: signUpError.message || 'Failed to create admin account'
        }
      }

      if (!signUpData?.user) {
        setDebugInfo('❌ No user returned from signup')
        return { success: false, error: 'Failed to create admin user' }
      }

      setDebugInfo('✅ Admin created: ' + signUpData.user.id)

      // Step 3: Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: signUpData.user.id,
          email: ADMIN_EMAIL,
          full_name: 'Admin',
          user_type: 'admin',
          created_at: new Date().toISOString()
        })

      if (profileError) {
        setDebugInfo('⚠️ Profile error: ' + profileError.message)
      } else {
        setDebugInfo('✅ Profile created')
      }

      // Step 4: Login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      })

      if (loginError) {
        setDebugInfo('❌ Login error: ' + loginError.message)
        return { 
          success: false, 
          error: 'Account created but login failed. Please try logging in manually.'
        }
      }

      setDebugInfo('✅ Login successful!')
      return { success: true, user: loginData.user }

    } catch (error) {
      setDebugInfo('❌ Error: ' + error.message)
      return { success: false, error: error.message || 'An unexpected error occurred' }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo('')
    setStep('login')

    try {
      // ✅ Check the correct email
      if (email !== ADMIN_EMAIL) {
        setError(`❌ Invalid admin email. Use: ${ADMIN_EMAIL}`)
        setLoading(false)
        return
      }

      if (password !== ADMIN_PASSWORD) {
        setError('❌ Invalid admin password. Use: Admin123!')
        setLoading(false)
        return
      }

      setStep('creating')
      const result = await createAndLoginAdmin()

      if (!result.success) {
        setError('❌ ' + result.error)
        setStep('login')
        setLoading(false)
        return
      }

      setStep('success')
      localStorage.setItem('adminUser', JSON.stringify(result.user))
      
      if (onLogin) {
        onLogin(result.user)
      }
      
      setTimeout(() => {
        window.location.href = '/admin/dashboard'
      }, 1000)

    } catch (err) {
      console.error('❌ Submit error:', err)
      setError('❌ ' + (err.message || 'An unexpected error occurred'))
      setStep('login')
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
      background: '#f5f3ff',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '24px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '0.5rem', textAlign: 'center' }}>
          📊 Admin Login
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem', textAlign: 'center' }}>
          {step === 'creating' ? 'Creating admin account...' : 'Enter your admin credentials'}
        </p>

        {step === 'creating' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #E88D5C',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }} />
            <p style={{ color: '#6b7280' }}>Setting up admin account...</p>
            {debugInfo && (
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '0.5rem' }}>
                {debugInfo}
              </p>
            )}
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <span style={{ fontSize: '48px' }}>✅</span>
            <h3 style={{ marginTop: '1rem', color: '#22c55e' }}>Admin Login Successful!</h3>
            <p style={{ color: '#6b7280' }}>Redirecting to dashboard...</p>
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.75rem',
                background: '#fef2f2',
                color: '#ef4444',
                borderRadius: '12px',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            {debugInfo && step === 'login' && (
              <div style={{
                padding: '0.5rem',
                background: '#f3f4f6',
                color: '#6b7280',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center',
                fontSize: '12px'
              }}>
                {debugInfo}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Processing...' : '🔐 Login to Admin'}
            </button>
          </form>
        )}

        <button
          onClick={() => window.location.href = '/'}
          style={{
            width: '100%',
            marginTop: '1rem',
            padding: '0.5rem',
            background: 'transparent',
            color: '#6b7280',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline'
          }}
        >
          ← Back to Home
        </button>

        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f5f3ff',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0 }}>
            🔐 Admin: {ADMIN_EMAIL}
          </p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '11px', color: '#9ca3af' }}>
            Password: Admin123!
          </p>
        </div>
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

export default NewAdminLogin