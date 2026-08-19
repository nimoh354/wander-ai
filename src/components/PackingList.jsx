// src/components/PackingList.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function PackingList({ trip, onBack, user }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [showGenerator, setShowGenerator] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  // ✅ Load saved list
  useEffect(() => {
    if (trip?.id && user?.id) {
      loadList()
    }
  }, [trip?.id, user?.id])

  const loadList = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('packing_lists')
        .select('*')
        .eq('trip_id', trip.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (!error && data) {
        setItems(data.items || [])
        setShowGenerator(false)
      }
    } catch (err) {
      console.error('Error loading:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Generate list
  const generateList = () => {
    const destination = trip?.destination?.toLowerCase() || ''
    const duration = trip?.duration_days || 5
    
    const baseItems = [
      { name: 'Passport / ID', checked: false, category: 'Documents' },
      { name: 'Travel tickets', checked: false, category: 'Documents' },
      { name: 'Wallet / Cash / Cards', checked: false, category: 'Documents' },
      { name: 'Phone & Charger', checked: false, category: 'Electronics' },
      { name: 'Power Bank', checked: false, category: 'Electronics' },
      { name: 'Travel adapter', checked: false, category: 'Electronics' },
      { name: 'Toiletries', checked: false, category: 'Personal' },
      { name: 'Medications', checked: false, category: 'Personal' },
      { name: 'First aid kit', checked: false, category: 'Personal' },
      { name: 'Sunscreen', checked: false, category: 'Personal' },
    ]

    const clothes = []
    const days = Math.min(duration, 7)
    for (let i = 0; i < Math.ceil(days / 2); i++) {
      clothes.push({ name: `Outfit ${i + 1}`, checked: false, category: 'Clothing' })
    }

    let destItems = []
    if (destination.includes('beach') || destination.includes('bali') || destination.includes('maldives')) {
      destItems = [
        { name: 'Swimsuit', checked: false, category: 'Beach' },
        { name: 'Beach towel', checked: false, category: 'Beach' },
        { name: 'Flip flops', checked: false, category: 'Beach' },
        { name: 'Sunglasses', checked: false, category: 'Beach' },
      ]
    }
    
    if (destination.includes('safari') || destination.includes('kenya')) {
      destItems = [
        { name: 'Binoculars', checked: false, category: 'Safari' },
        { name: 'Camera', checked: false, category: 'Electronics' },
        { name: 'Neutral clothing', checked: false, category: 'Clothing' },
        { name: 'Insect repellent', checked: false, category: 'Personal' }
      ]
    }

    const allItems = [...baseItems, ...clothes, ...destItems]
    
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
    )

    setItems(uniqueItems)
    setShowGenerator(false)
    setSaved(false)
  }

  // ✅ FIXED: Toggle item checked state
  const toggleItem = (index) => {
    console.log('🔄 Toggling item at index:', index)
    console.log('📦 Current item:', items[index])
    
    setItems(prevItems => {
      const newItems = [...prevItems]
      newItems[index] = {
        ...newItems[index],
        checked: !newItems[index].checked
      }
      console.log('✅ New checked state:', newItems[index].checked)
      setSaved(false)
      return newItems
    })
  }

  // ✅ Save list
  const saveList = async () => {
    if (items.length === 0) {
      alert('Your packing list is empty!')
      return
    }

    if (!user?.id) {
      alert('Please log in to save')
      return
    }

    setSaving(true)

    try {
      const { data: existing } = await supabase
        .from('packing_lists')
        .select('id')
        .eq('trip_id', trip.id)
        .eq('user_id', user.id)
        .maybeSingle()

      let result
      if (existing) {
        result = await supabase
          .from('packing_lists')
          .update({ items: items, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        result = await supabase
          .from('packing_lists')
          .insert({
            trip_id: trip.id,
            user_id: user.id,
            items: items,
            created_at: new Date().toISOString()
          })
      }

      if (result.error) {
        alert('Failed to save: ' + result.error.message)
        return
      }

      setSaved(true)
      alert('Packing list saved! ✅')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error:', err)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const addItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setItems([...items, { name: newItem.trim(), checked: false, category: 'Custom' }])
    setNewItem('')
    setSaved(false)
  }

  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
    setSaved(false)
  }

  const resetItems = () => {
    if (items.length > 0 && !confirm('Reset your packing list?')) {
      return
    }
    setItems([])
    setShowGenerator(true)
    setSaved(false)
  }

  const totalItems = items.length
  const checkedItems = items.filter(item => item.checked).length
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {})

  const categories = Object.keys(groupedItems)

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        color: '#6b7280'
      }}>
        <p>Loading your packing list...</p>
      </div>
    )
  }

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            color: '#1a1a2e',
            border: '2px solid #1a1a2e',
            padding: '0.5rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#1a1a2e'
            e.target.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
            e.target.style.color = '#1a1a2e'
          }}
        >
          ← Back to Dashboard
        </button>
      )}

      {trip && (
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(139, 92, 246, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>📍 Trip to</p>
              <h4 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>
                {trip.destination || 'Unknown'}
              </h4>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '12px', color: '#6b7280' }}>
              {trip.duration_days && <span>📅 {trip.duration_days}d</span>}
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid rgba(26, 43, 60, 0.06)',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: "'Playfair Display', serif",
              color: '#1a1a2e',
              margin: 0
            }}>
              🧳 Packing List
            </h3>
            {!showGenerator && items.length > 0 && (
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '0.25rem' }}>
                {checkedItems} of {totalItems} items packed
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!showGenerator && items.length > 0 && (
              <button
                onClick={saveList}
                disabled={saving}
                style={{
                  padding: '0.6rem 1.2rem',
                  background: saved ? '#22c55e' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '13px',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save List'}
              </button>
            )}
            {showGenerator ? (
              <button
                onClick={generateList}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                ✨ Generate List
              </button>
            ) : (
              <>
                <button
                  onClick={resetItems}
                  style={{
                    padding: '0.5rem 1.2rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '13px'
                  }}
                >
                  🗑️ Reset
                </button>
                {items.length > 0 && (
                  <span style={{
                    padding: '0.5rem 1rem',
                    background: '#f0fdf4',
                    color: '#22c55e',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {progress}% Packed
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {!showGenerator && items.length > 0 && (
          <div style={{
            width: '100%',
            height: '6px',
            background: '#f3f4f6',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #E88D5C, #F4C542)',
              transition: 'width 0.5s ease',
              borderRadius: '4px'
            }} />
          </div>
        )}

        {!showGenerator && items.length > 0 ? (
          <div>
            {categories.map((category) => (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem',
                  borderBottom: '1px solid #f0f0f0',
                  paddingBottom: '0.5rem'
                }}>
                  {category}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '0.5rem'
                }}>
                  {groupedItems[category].map((item, idx) => {
                    const globalIndex = items.indexOf(item)
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: '10px',
                          background: item.checked ? '#f0fdf4' : 'transparent',
                          border: item.checked ? '1px solid #bbf7d0' : '1px solid transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!item.checked) {
                            e.target.style.background = '#f9fafb'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!item.checked) {
                            e.target.style.background = 'transparent'
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => {
                            console.log('✅ Checkbox clicked for:', item.name, 'index:', globalIndex)
                            toggleItem(globalIndex)
                          }}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            accentColor: '#E88D5C',
                            flexShrink: 0
                          }}
                        />
                        <span style={{
                          flex: 1,
                          fontSize: '15px',
                          textDecoration: item.checked ? 'line-through' : 'none',
                          color: item.checked ? '#6b7280' : '#1a1a2e'
                        }}>
                          {item.name}
                        </span>
                        <button
                          onClick={() => deleteItem(globalIndex)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: '16px',
                            padding: '0 4px',
                            opacity: 0.6
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '1'}
                          onMouseLeave={(e) => e.target.style.opacity = '0.6'}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : showGenerator ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: '#6b7280'
          }}>
            <span style={{ fontSize: '56px', display: 'block', marginBottom: '1rem' }}>🧳</span>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a2e' }}>
              Generate your packing list
            </p>
            <p style={{ fontSize: '14px', marginTop: '0.5rem' }}>
              Based on your destination and duration
            </p>
            <button
              onClick={generateList}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              ✨ Generate List
            </button>
          </div>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>
            No items yet. Click "Generate List" to start!
          </p>
        )}

        <button
          onClick={onBack}
          style={{
            display: 'block',
            width: '100%',
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '16px',
            marginTop: '1rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(232, 141, 92, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.02)'
            e.target.style.boxShadow = '0 8px 24px rgba(232, 141, 92, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 4px 16px rgba(232, 141, 92, 0.3)'
          }}
        >
          ← Back to Dashboard
        </button>

        {!showGenerator && (
          <form onSubmit={addItem} style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '1.5rem'
          }}>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add custom item..."
              style={{
                flex: 1,
                padding: '0.6rem 1rem',
                border: '2px solid #f0f0f0',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                minWidth: '150px',
                fontFamily: "'Inter', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#E88D5C'
                e.target.style.boxShadow = '0 0 0 4px rgba(232, 141, 92, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#f0f0f0'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.6rem 1.5rem',
                background: '#E88D5C',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#D97A4A'
                e.target.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#E88D5C'
                e.target.style.transform = 'scale(1)'
              }}
            >
              + Add Item
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default PackingList