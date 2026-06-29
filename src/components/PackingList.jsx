import React, { useState } from 'react'

function PackingList({ trip }) {
  const [items, setItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [showGenerator, setShowGenerator] = useState(true)

  // Auto-generate packing list based on trip
  const generatePackingList = () => {
    const destination = trip?.destination?.toLowerCase() || ''
    const duration = trip?.duration_days || 5
    const preferences = trip?.preferences || []
    
    // Base items (always included)
    const baseItems = [
      { name: 'Passport / ID', checked: false },
      { name: 'Travel tickets', checked: false },
      { name: 'Wallet / Cash / Cards', checked: false },
      { name: 'Phone & Charger', checked: false },
      { name: 'Power Bank', checked: false },
      { name: 'Travel adapter', checked: false },
      { name: 'Toiletries', checked: false },
      { name: 'Medications', checked: false },
      { name: 'First aid kit', checked: false },
      { name: 'Sunscreen', checked: false },
    ]

    // Clothing (based on duration)
    const clothes = []
    const days = Math.min(duration, 14)
    for (let i = 0; i < days; i++) {
      clothes.push({ name: `Outfit ${i + 1}`, checked: false })
    }

    // Destination-specific items
    const destinationItems = []
    
    if (destination.includes('beach') || destination.includes('bali') || destination.includes('maldives')) {
      destinationItems.push({ name: 'Swimsuit', checked: false })
      destinationItems.push({ name: 'Beach towel', checked: false })
      destinationItems.push({ name: 'Flip flops', checked: false })
      destinationItems.push({ name: 'Sunglasses', checked: false })
    }
    
    if (destination.includes('paris') || destination.includes('rome') || destination.includes('city')) {
      destinationItems.push({ name: 'Comfortable walking shoes', checked: false })
      destinationItems.push({ name: 'City map / guide', checked: false })
      destinationItems.push({ name: 'Umbrella', checked: false })
    }
    
    if (destination.includes('tokyo') || destination.includes('japan')) {
      destinationItems.push({ name: 'Pocket WiFi / SIM card', checked: false })
      destinationItems.push({ name: 'Transportation pass', checked: false })
      destinationItems.push({ name: 'Adapters', checked: false })
    }

    // Preference-based items
    const preferenceItems = []
    if (preferences.includes('adventure') || preferences.includes('hiking')) {
      preferenceItems.push({ name: 'Hiking shoes', checked: false })
      preferenceItems.push({ name: 'Backpack', checked: false })
      preferenceItems.push({ name: 'Water bottle', checked: false })
    }
    
    if (preferences.includes('food') || preferences.includes('cuisine')) {
      preferenceItems.push({ name: 'Reusable utensils', checked: false })
      preferenceItems.push({ name: 'Food container', checked: false })
    }

    const allItems = [
      ...baseItems,
      ...clothes.slice(0, Math.ceil(days / 2)),
      ...destinationItems,
      ...preferenceItems
    ]

    // Add some random items for variety
    const extraItems = [
      'Snacks', 'Travel pillow', 'Eye mask', 'Earplugs', 
      'Journal', 'Pen', 'Reusable bag', 'Waterproof pouch'
    ]
    const randomExtra = extraItems.slice(0, Math.floor(Math.random() * 3) + 1)
    const extraItemsObj = randomExtra.map(item => ({ name: item, checked: false }))

    const finalItems = [...allItems, ...extraItemsObj]
    
    // Remove duplicates (case-insensitive)
    const uniqueItems = finalItems.filter((item, index, self) => 
      index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
    )

    setItems(uniqueItems)
    setShowGenerator(false)
  }

  // Toggle item checked state
  const toggleItem = (index) => {
    const newItems = [...items]
    newItems[index].checked = !newItems[index].checked
    setItems(newItems)
  }

  // Add custom item
  const addItem = (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setItems([...items, { name: newItem.trim(), checked: false }])
    setNewItem('')
  }

  // Delete item
  const deleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
  }

  // Reset items
  const resetItems = () => {
    setItems([])
    setShowGenerator(true)
  }

  // Get progress
  const totalItems = items.length
  const checkedItems = items.filter(item => item.checked).length
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid rgba(139, 92, 246, 0.08)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
          🧳 Packing List
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {showGenerator ? (
            <button
              onClick={generatePackingList}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ✨ Generate List
            </button>
          ) : (
            <>
              <button
                onClick={resetItems}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#1a1a2e',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
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
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}

      {/* Items List */}
      {!showGenerator && items.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                borderRadius: '8px',
                background: item.checked ? '#f0fdf4' : 'transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(index)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: '#8B5CF6'
                }}
              />
              <span style={{
                flex: 1,
                fontSize: '14px',
                textDecoration: item.checked ? 'line-through' : 'none',
                color: item.checked ? '#6b7280' : '#1a1a2e'
              }}>
                {item.name}
              </span>
              <button
                onClick={() => deleteItem(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : showGenerator ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6b7280'
        }}>
          <p style={{ fontSize: '48px', marginBottom: '0.5rem' }}>🧳</p>
          <p>Click "Generate List" to get a smart packing list for your trip!</p>
          <p style={{ fontSize: '13px' }}>
            Based on your destination, duration, and preferences
          </p>
        </div>
      ) : (
        <p style={{ color: '#6b7280', textAlign: 'center' }}>
          No items yet. Click "Generate List" to start!
        </p>
      )}

      {/* Add Custom Item */}
      {!showGenerator && (
        <form onSubmit={addItem} style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add custom item..."
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.5rem 1.5rem',
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + Add Item
          </button>
        </form>
      )}
    </div>
  )
}

export default PackingList