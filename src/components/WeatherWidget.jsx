import React, { useState, useEffect } from 'react'

function WeatherWidget({ destination }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock weather data for demo (no API key needed!)
  const getMockWeather = (city) => {
    const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '🌤️ Mostly Sunny', '🌧️ Light Rain', '⛈️ Thunderstorm', '❄️ Snow']
    const temps = [15, 18, 22, 25, 28, 30, 32]
    const cities = {
      'paris': { temp: 22, condition: '☀️ Sunny', humidity: 65, wind: 12 },
      'london': { temp: 18, condition: '⛅ Partly Cloudy', humidity: 72, wind: 15 },
      'tokyo': { temp: 28, condition: '☀️ Sunny', humidity: 60, wind: 8 },
      'bali': { temp: 32, condition: '☀️ Sunny', humidity: 75, wind: 5 },
      'rome': { temp: 26, condition: '☀️ Sunny', humidity: 55, wind: 10 },
      'dubai': { temp: 35, condition: '☀️ Sunny', humidity: 45, wind: 6 },
      'cape town': { temp: 20, condition: '⛅ Partly Cloudy', humidity: 68, wind: 18 },
      'new york': { temp: 24, condition: '🌤️ Mostly Sunny', humidity: 60, wind: 14 },
      'sydney': { temp: 22, condition: '☀️ Sunny', humidity: 58, wind: 12 },
      'bangkok': { temp: 33, condition: '🌤️ Mostly Sunny', humidity: 70, wind: 8 },
      'singapore': { temp: 31, condition: '⛅ Partly Cloudy', humidity: 78, wind: 6 },
      'barcelona': { temp: 25, condition: '☀️ Sunny', humidity: 62, wind: 10 }
    }

    const cityKey = city?.toLowerCase() || ''
    for (const [key, value] of Object.entries(cities)) {
      if (cityKey.includes(key) || key.includes(cityKey)) {
        return value
      }
    }

    // Random fallback
    return {
      temp: temps[Math.floor(Math.random() * temps.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: Math.floor(Math.random() * 40) + 40,
      wind: Math.floor(Math.random() * 20) + 5
    }
  }

  useEffect(() => {
    if (!destination) return

    setLoading(true)
    setError('')

    try {
      const data = getMockWeather(destination)
      setWeather(data)
      setLoading(false)
    } catch (err) {
      setError('Could not fetch weather data')
      setLoading(false)
    }
  }, [destination])

  if (loading) {
    return (
      <div style={{
        padding: '0.5rem 0.75rem',
        background: '#f9fafb',
        borderRadius: '10px',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '13px'
      }}>
        🌤️ Loading weather...
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div style={{
        padding: '0.5rem 0.75rem',
        background: '#fef2f2',
        borderRadius: '10px',
        textAlign: 'center',
        color: '#ef4444',
        fontSize: '13px'
      }}>
        ⚠️ Weather unavailable
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 0.75rem',
      background: 'linear-gradient(135deg, #f0f4ff, #e8edf5)',
      borderRadius: '10px',
      border: '1px solid rgba(139, 92, 246, 0.08)',
      flexWrap: 'wrap'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '24px' }}>{weather.condition.split(' ')[0]}</span>
        <div>
          <p style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a1a2e',
            margin: 0
          }}>
            {weather.temp}°C
          </p>
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            margin: 0
          }}>
            {weather.condition}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        fontSize: '12px',
        color: '#6b7280',
        flexWrap: 'wrap'
      }}>
        <span>💧 {weather.humidity}%</span>
        <span>🌬️ {weather.wind} km/h</span>
      </div>
    </div>
  )
}

export default WeatherWidget