import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Inventory({ user }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'equipment',
    price: '',
    quantity: 0,
    unit: 'piece',
    min_quantity: 0,
    location: '',
    status: 'available'
  })

  useEffect(() => {
    fetchItems()
  }, [user])

  const fetchItems = async () => {
    if (!user || !user.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const itemData = {
      ...formData,
      user_id: user.id,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.quantity) || 0,
      min_quantity: parseInt(formData.min_quantity) || 0
    }

    let error
    if (editingItem) {
      const { error: updateError } = await supabase
        .from('inventory')
        .update(itemData)
        .eq('id', editingItem.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('inventory')
        .insert([itemData])
      error = insertError
    }

    if (!error) {
      fetchItems()
      setShowForm(false)
      setEditingItem(null)
      resetForm()
    } else {
      alert('❌ Error saving item: ' + error.message)
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchItems()
    } else {
      alert('❌ Error deleting item: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'equipment',
      price: '',
      quantity: 0,
      unit: 'piece',
      min_quantity: 0,
      location: '',
      status: 'available'
    })
  }

  const editItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || 'equipment',
      price: item.price || '',
      quantity: item.quantity || 0,
      unit: item.unit || 'piece',
      min_quantity: item.min_quantity || 0,
      location: item.location || '',
      status: item.status || 'available'
    })
    setShowForm(true)
  }

  if (loading && items.length === 0) {
    return <p style={{ color: '#6b7280' }}>Loading inventory...</p>
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          fontFamily: "'Playfair Display', serif",
          color: '#1a1a2e'
        }}>
          📦 Inventory
        </h2>
        <button
          onClick={() => {
            setEditingItem(null)
            resetForm()
            setShowForm(!showForm)
          }}
          style={{
            padding: '0.5rem 1.5rem',
            background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
          border: '1px solid rgba(26, 43, 60, 0.06)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>
            {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  <option value="equipment">Equipment</option>
                  <option value="vehicle">Vehicle</option>
                  <option value="supply">Supply</option>
                  <option value="gear">Gear</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '8px' }}
                placeholder="Item description..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 2rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
            </button>
          </form>
        </div>
      )}

      {/* Inventory List */}
      {items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280',
          background: 'white',
          borderRadius: '16px',
          border: '1px dashed rgba(26, 43, 60, 0.1)'
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>📦</span>
          <p>No inventory items yet. Add your first item above!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {items.map((item) => (
            <div key={item.id} style={{
              background: 'white',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
              e.target.style.transform = 'translateY(0)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {item.name}
                  </h4>
                  <span style={{
                    fontSize: '11px',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    background: item.status === 'available' ? '#f0fdf4' : '#fef2f2',
                    color: item.status === 'available' ? '#22c55e' : '#ef4444'
                  }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => editItem(item)}
                    style={{
                      padding: '0.25rem 0.5rem',
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
                    onClick={() => handleDelete(item.id)}
                    style={{
                      padding: '0.25rem 0.5rem',
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
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '0.25rem' }}>
                {item.description || 'No description'}
              </p>
              <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '13px',
                color: '#6b7280',
                marginTop: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <span>📂 {item.category}</span>
                <span>💰 ${item.price || 0}</span>
                <span>📦 {item.quantity} {item.unit}</span>
                {item.location && <span>📍 {item.location}</span>}
              </div>
              {item.quantity <= item.min_quantity && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  background: '#fef2f2',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#ef4444'
                }}>
                  ⚠️ Low stock! Need {item.min_quantity - item.quantity} more
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Inventory