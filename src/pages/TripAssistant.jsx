// src/pages/TripAssistant.jsx
import React from 'react'
import AIChat from '../components/AIChat'

function TripAssistant() {
  return (
    <div style={{ 
      padding: '2rem 1.5rem', 
      maxWidth: '900px', 
      margin: '0 auto',
      minHeight: '100vh',
      background: '#0a1628' // Navy blue background
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '38px', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          🗺️ Travel Assistant
        </h1>
        <p style={{ 
          color: '#7a8ba8',
          fontSize: '17px',
          marginTop: '0.5rem'
        }}>
          Ask me anything about flights, hotels, activities, and more!
        </p>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '0.5rem'
        }}>
          {['✈️ Flights', '🏨 Hotels', '🎯 Activities', '🚗 Car Rental', '🌍 Any Destination'].map((tag, i) => (
            <span key={i} style={{
              padding: '0.2rem 0.75rem',
              background: '#0d1b33',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#8B5CF6',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <AIChat />
    </div>
  )
}

export default TripAssistant