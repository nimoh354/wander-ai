import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function OperatorRegistration({ user, onRegistered }) {
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

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

      setMessage('✅ Operator profile created successfully!')
      if (onRegistered) onRegistered()
      
      // Reset form
      setBusinessName('')
      setDescription('')
      setPhone('')
      setWebsite('')
    } catch (error) {
      setMessage(`❌ ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '16px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '22px',
        fontWeight: '700',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🏢 Become a Tour Operator
      </h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Register your business and start receiving bookings from travelers!
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '0.25rem'
          }}>
            Business Name *
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="e.g., Safari Adventures Ltd"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '0.25rem'
          }}>
            Business Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            placeholder="Tell travelers about your services..."
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '0.25rem'
          }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="+254 700 123 456"
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '0.25rem'
          }}>
            Website (optional)
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
            placeholder="https://yourbusiness.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Registering...' : '🏢 Register as Operator'}
        </button>
      </form>

      {message && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: message.includes('✅') ? '#f0fdf4' : '#fef2f2',
          color: message.includes('✅') ? '#22c55e' : '#ef4444',
          borderRadius: '8px',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default OperatorRegistration