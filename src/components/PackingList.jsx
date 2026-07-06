import React, { useState } from 'react'

function PackingList({ trip, onBack }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [showGenerator, setShowGenerator] = useState(true)

  // Auto-generate packing list based on trip
  const generatePackingList = () => {
    const destination = trip?.destination?.toLowerCase() || ''
    const duration = trip?.duration_days || 5
    const preferences = trip?.preferences || []
    
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
    const days = Math.min(duration, 14)
    for (let i = 0; i < days; i++) {
      clothes.push({ name: `Outfit ${i + 1}`, checked: false, category: 'Clothing' })
    }

    const destinationItems = []
    
    if (destination.includes('beach') || destination.includes('bali') || destination.includes('maldives')) {
      destinationItems.push({ name: 'Swimsuit', checked: false, category: 'Beach' })
      destinationItems.push({ name: 'Beach towel', checked: false, category: 'Beach' })
      destinationItems.push({ name: 'Flip flops', checked: false, category: 'Beach' })
      destinationItems.push({ name: 'Sunglasses', checked: false, category: 'Beach' })
    }
    
    if (destination.includes('paris') || destination.includes('rome') || destination.includes('city')) {
      destinationItems.push({ name: 'Comfortable walking shoes', checked: false, category: 'Clothing' })
      destinationItems.push({ name: 'City map / guide', checked: false, category: 'Documents' })
      destinationItems.push({ name: 'Umbrella', checked: false, category: 'Personal' })
    }
    
    if (destination.includes('tokyo') || destination.includes('japan')) {
      destinationItems.push({ name: 'Pocket WiFi / SIM card', checked: false, category: 'Electronics' })
      destinationItems.push({ name: 'Transportation pass', checked: false, category: 'Documents' })
    }

    const preferenceItems = []
    if (preferences.includes('adventure') || preferences.includes('hiking')) {
      preferenceItems.push({ name: 'Hiking shoes', checked: false, category: 'Clothing' })
      preferenceItems.push({ name: 'Backpack', checked: false, category: 'Personal' })
      preferenceItems.push({ name: 'Water bottle', checked: false, category: 'Personal' })
    }
    
    if (preferences.includes('food') || preferences.includes('cuisine')) {
      preferenceItems.push({ name: 'Reusable utensils', checked: false, category: 'Personal' })
      preferenceItems.push({ name: 'Food container', checked: false, category: 'Personal' })
    }

    const allItems = [
      ...baseItems,
      ...clothes.slice(0, Math.ceil(days / 2)),
      ...destinationItems,
      ...preferenceItems
    ]

    const extraItems = [
      { name: 'Snacks', category: 'Personal' },
      { name: 'Travel pillow', category: 'Personal' },
      { name: 'Eye mask', category: 'Personal' },
      { name: 'Earplugs', category: 'Personal' },
      { name: 'Journal', category: 'Personal' },
      { name: 'Reusable bag', category: 'Personal' },
      { name: 'Waterproof pouch', category: 'Personal' }
    ]
    const randomExtra = extraItems.slice(0, Math.floor(Math.random() * 3) + 1)
    const extraItemsObj = randomExtra.map(item => ({ ...item, checked: false }))

    const finalItems = [...allItems, ...extraItemsObj]
    
    const uniqueItems = finalItems.filter((item, index, self) => 
      index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
    )

    setItems(uniqueItems)
    setShowGenerator(false)
  }

  const toggleItem = (index) => {
    const newItems = [...items]
    newItems[index].checked = !newItems[index].checked
    setItems(newItems)
  }

  const addItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setItems([...items, { name: newItem.trim(), checked: false, category: 'Custom' }])
    setNewItem('')
  }

  const deleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  const resetItems = () => {
    setItems([])
    setShowGenerator(true)
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

  return (
    <div>
      {/* Back Button at the top (always visible) */}
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
            fontWeight: '600',
            transition: 'all 0.2s ease'
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

      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid rgba(26, 43, 60, 0.06)',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        {/* Header */}
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
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '0.25rem'
              }}>
                {checkedItems} of {totalItems} items packed
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {showGenerator ? (
              <button
                onClick={generatePackingList}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.02)'
                  e.target.style.boxShadow = '0 4px 16px rgba(232, 141, 92, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)'
                  e.target.style.boxShadow = 'none'
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
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent'
                  }}
                >
                  🔄 Reset
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

        {/* Progress Bar */}
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

        {/* Items List */}
        {!showGenerator && items.length > 0 ? (
          <div>
            {/* ✅ BACK TO DASHBOARD BUTTON INSIDE RESULTS */}
            <button
              onClick={onBack}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                color: '#1a1a2e',
                border: '2px solid #1a1a2e',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                marginBottom: '1.5rem',
                transition: 'all 0.2s ease'
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
                          onChange={() => toggleItem(globalIndex)}
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
                            opacity: 0.6,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.opacity = '1'
                            e.target.style.transform = 'scale(1.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.opacity = '0.6'
                            e.target.style.transform = 'scale(1)'
                          }}
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
              Based on your destination, duration, and preferences
            </p>
            <button
              onClick={generatePackingList}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)'
                e.target.style.boxShadow = '0 4px 16px rgba(232, 141, 92, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = 'none'
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

{/* Back to Dashboard Button - Bottom */}
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
    transition: 'all 0.2s ease',
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

        {/* Add Custom Item */}
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