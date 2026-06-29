import React, { useState } from 'react'

function TripCalendar({ trips }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  // Get trips for a specific date
  const getTripsForDate = (date) => {
    const dateStr = date.toDateString()
    return trips.filter(trip => {
      if (!trip.departure_date) return false
      const tripDate = new Date(trip.departure_date)
      return tripDate.toDateString() === dateStr
    })
  }

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  // Change month
  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + offset)
    setCurrentMonth(newMonth)
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid rgba(139, 92, 246, 0.08)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
          📅 {monthNames[month]} {year}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => changeMonth(-1)}
            style={{
              padding: '0.25rem 0.75rem',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ←
          </button>
          <button
            onClick={() => changeMonth(1)}
            style={{
              padding: '0.25rem 0.75rem',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        marginBottom: '8px'
      }}>
        {dayNames.map(day => (
          <div key={day} style={{
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '12px',
            color: '#6b7280',
            padding: '4px'
          }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px'
      }}>
        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} style={{ padding: '8px' }} />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const tripsOnDate = getTripsForDate(date)
          const hasTrips = tripsOnDate.length > 0
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <div
              key={day}
              onClick={() => setSelectedDate(date)}
              style={{
                padding: '8px 4px',
                textAlign: 'center',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isToday ? '#f5f3ff' : 'transparent',
                border: isToday ? '2px solid #8B5CF6' : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f5f3ff'
              }}
              onMouseLeave={(e) => {
                if (!isToday) {
                  e.target.style.background = 'transparent'
                }
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: hasTrips ? '700' : '400',
                color: hasTrips ? '#8B5CF6' : '#1a1a2e'
              }}>
                {day}
              </div>
              {hasTrips && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '2px',
                  marginTop: '2px'
                }}>
                  {tripsOnDate.map((_, idx) => (
                    <span key={idx} style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      background: '#8B5CF6',
                      borderRadius: '50%'
                    }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Date Trips */}
      {selectedDate && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '12px'
        }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '16px' }}>
            📍 {formatDate(selectedDate)}
          </h4>
          {getTripsForDate(selectedDate).length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              No trips on this date
            </p>
          ) : (
            getTripsForDate(selectedDate).map(trip => (
              <div key={trip.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ fontWeight: '500' }}>{trip.destination}</span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  {trip.duration_days} days
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default TripCalendar