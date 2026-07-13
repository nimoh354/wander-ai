import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function NewAdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ADMIN_EMAIL = 'wanderaiadmin@gmail.com'
  const ADMIN_PASSWORD = 'Admin123!'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check hardcoded admin credentials first
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Try Supabase auth first
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (!error && data?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            setError('❌ Unable to verify admin profile')
            setLoading(false)
            return
          }

          if (profile?.user_type === 'admin') {
            localStorage.setItem('adminUser', JSON.stringify(data.user))
            onLogin(data.user)
            setLoading(false)
            return
          }

          await supabase.auth.signOut()
          setError('❌ Admin access required')
          setLoading(false)
          return
        }

        setError('❌ Invalid admin credentials')
        setLoading(false)
        return
      }

      // Regular login for other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        setError('❌ ' + error.message)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      if (profile?.user_type !== 'admin') {
        await supabase.auth.signOut()
        setError('❌ Admin access required')
        setLoading(false)
        return
      }

      localStorage.setItem('adminUser', JSON.stringify(data.user))
      onLogin(data.user)

    } catch (err) {
      setError('❌ ' + err.message)
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
          Enter your admin credentials
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="wanderaiadmin@gmail.com"
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
              textAlign: 'center'
            }}>
              {error}
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
            {loading ? 'Logging in...' : '🔐 Login to Admin'}
          </button>
        </form>

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
            🔐 Admin: wanderaiadmin@gmail.com
          </p>
        </div>
      </div>
    </div>
  )
}

// ✅ THIS IS THE IMPORTANT PART - DEFAULT EXPORT
export default NewAdminLogin