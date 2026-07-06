import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AvailabilityCalendar({ packageId }) {
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState(1)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchAvailability()
  }, [packageId])

  const fetchAvailability = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('package_id', packageId)
      .order('date', { ascending: true })

    if (!error) {
      setAvailability(data || [])
    }
    setLoading(false)
  }

  const addAvailability = async (e) => {
    e.preventDefault()
    if (!selectedDate || slots < 1) return

    const { error } = await supabase
      .from('availability')
      .insert([{
        package_id: packageId,
        date: selectedDate,
        slots: parseInt(slots)
      }])

    if (!error) {
      fetchAvailability()
      setSelectedDate('')
      setSlots(1)
    } else {
      alert('❌ Error adding availability: ' + error.message)
    }
  }

  const updateAvailability = async (id, updates) => {
    const { error } = await supabase
      .from('availability')
      .update(updates)
      .eq('id', id)

    if (!error) {
      fetchAvailability()
    } else {
      alert('❌ Error updating availability: ' + error.message)
    }
  }

  const deleteAvailability = async (id) => {
    if (!confirm('Delete this availability?')) return

    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchAvailability()
    } else {
      alert('❌ Error deleting availability: ' + error.message)
    }
  }

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading availability...</p>
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1rem',
        background: '#f9fafb',
        padding: '1rem',
        borderRadius: '12px'
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.25rem' }}>
            📅 Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.25rem' }}>
            👥 Slots
          </label>
          <input
            type="number"
            value={slots}
            onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
            min="1"
            max="50"
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              width: '80px'
            }}
          />
        </div>
        <button
          onClick={addAvailability}
          style={{
            alignSelf: 'flex-end',
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          + Add Date
        </button>
      </div>

      {availability.length === 0 ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '1rem' }}>
          No availability set for this package.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          {availability.map((item) => (
            <div key={item.id} style={{
              background: 'white',
              padding: '0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>
                  {new Date(item.date).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                  {item.slots - item.booked} / {item.slots} slots available
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={() => {
                    const newSlots = prompt('Update slots:', item.slots)
                    if (newSlots) {
                      updateAvailability(item.id, { slots: parseInt(newSlots) })
                    }
                  }}
                  style={{
                    padding: '0.2rem 0.5rem',
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteAvailability(item.id)}
                  style={{
                    padding: '0.2rem 0.5rem',
                    background: '#fef2f2',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#ef4444'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AvailabilityCalendar