import React, { useState, useEffect } from 'react'

function TripCountdown({ trip }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isPast, setIsPast] = useState(false)

  useEffect(() => {
    if (!trip?.departure_date) return

    const calculateTimeLeft = () => {
      const departure = new Date(trip.departure_date)
      const now = new Date()
      const diff = departure - now

      if (diff <= 0) {
        setIsPast(true)
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      return { days, hours, minutes, seconds }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [trip?.departure_date])

  if (!trip?.departure_date) {
    return (
      <div style={{
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <p style={{ fontSize: '14px' }}>📅 No departure date set</p>
        <p style={{ fontSize: '12px' }}>Add a departure date to see the countdown!</p>
      </div>
    )
  }

  if (isPast) {
    return (
      <div style={{
        padding: '1rem',
        background: '#f0fdf4',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #bbf7d0'
      }}>
        <span style={{ fontSize: '32px', display: 'block' }}>🎉</span>
        <p style={{ fontWeight: '600', color: '#22c55e' }}>Trip Complete!</p>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Your trip to {trip.destination} has ended.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
      padding: '1.5rem',
      borderRadius: '16px',
      textAlign: 'center',
      border: '1px solid rgba(139, 92, 246, 0.15)',
      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.08)'
    }}>
      <p style={{
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '0.5rem'
      }}>
        🚀 {trip.destination} is coming in...
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <div>
          <p style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#8B5CF6',
            margin: 0
          }}>
            {String(timeLeft.days).padStart(2, '0')}
          </p>
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            margin: 0,
            textTransform: 'uppercase'
          }}>
            Days
          </p>
        </div>
        <div>
          <p style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#8B5CF6',
            margin: 0
          }}>
            {String(timeLeft.hours).padStart(2, '0')}
          </p>
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            margin: 0,
            textTransform: 'uppercase'
          }}>
            Hours
          </p>
        </div>
        <div>
          <p style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#8B5CF6',
            margin: 0
          }}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </p>
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            margin: 0,
            textTransform: 'uppercase'
          }}>
            Min
          </p>
        </div>
        <div>
          <p style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#8B5CF6',
            margin: 0
          }}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </p>
          <p style={{
            fontSize: '11px',
            color: '#6b7280',
            margin: 0,
            textTransform: 'uppercase'
          }}>
            Sec
          </p>
        </div>
      </div>
    </div>
  )
}

export default TripCountdown