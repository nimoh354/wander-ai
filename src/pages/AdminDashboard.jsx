import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { useTheme } from '../context/ThemeContext'
import Inventory from '../components/Inventory'
import TourPackages from '../components/TourPackages'
import BookingDashboard from '../components/BookingDashboard'

function AdminDashboard({ user, onLogout }) {
  const { darkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState({
    users: 0,
    trips: 0,
    messages: 0,
    operators: 0,
    photos: 0,
    reviews: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentTrips, setRecentTrips] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [allUsers, setAllUsers] = useState([])
  const [allTrips, setAllTrips] = useState([])

  // ✅ Check if user exists, if not redirect to admin login
  useEffect(() => {
    if (!user || !user.id) {
      window.location.href = '/admin'
      return
    }

    const checkAdminAndFetch = async () => {
      setLoading(true)

      if (user.email === 'wanderaiadmin@gmail.com') {
        setIsAdmin(true)
      } else {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()

        if (profileError || profile?.user_type !== 'admin') {
          setIsAdmin(false)
          setLoading(false)
          return
        }
        setIsAdmin(true)
      }

      const [
        { count: usersCount },
        { count: tripsCount },
        { count: messagesCount },
        { count: operatorsCount },
        { count: photosCount },
        { count: reviewsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('trips').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('operators').select('*', { count: 'exact', head: true }),
        supabase.from('trip_photos').select('*', { count: 'exact', head: true }),
        supabase.from('trip_reviews').select('*', { count: 'exact', head: true })
      ])

      setStats({
        users: usersCount || 0,
        trips: tripsCount || 0,
        messages: messagesCount || 0,
        operators: operatorsCount || 0,
        photos: photosCount || 0,
        reviews: reviewsCount || 0
      })

      const { data: allUsersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setAllUsers(allUsersData || [])

      const { data: allTripsData } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })

      setAllTrips(allTripsData || [])

      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentUsers(recentUsersData || [])

      const { data: recentTripsData } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentTrips(recentTripsData || [])

      const { data: recentMessagesData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentMessages(recentMessagesData || [])

      setLoading(false)
    }

    checkAdminAndFetch()
  }, [user])

  if (!user || !user.id) {
    return null // Redirecting to /admin
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#0f0f1a' : '#f5f3ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>📊</span>
          <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#0f0f1a' : '#f5f3ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '64px', display: 'block', marginBottom: '1rem' }}>⛔</span>
          <h2 style={{ color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>Access Denied</h2>
          <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>You don't have admin privileges.</p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{
        minHeight: '100vh',
        background: darkMode ? '#0f0f1a' : '#f5f3ff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📊 Admin Dashboard
              </h1>
              <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                Welcome back, {user?.email || 'Admin'}!
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#8B5CF6' }}>{stats.users}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>👤 Users</p>
            </div>
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#EC4899' }}>{stats.trips}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>🗺️ Trips</p>
            </div>
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>{stats.messages}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>💬 Messages</p>
            </div>
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>{stats.operators}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>🏢 Operators</p>
            </div>
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#F4C542' }}>{stats.photos}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>📸 Photos</p>
            </div>
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#E88D5C' }}>{stats.reviews}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>⭐ Reviews</p>
            </div>
          </div>

          {/* TABS */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            borderBottom: '1px solid rgba(26, 43, 60, 0.06)',
            paddingBottom: '1rem'
          }}>
            {['overview', 'users', 'trips', 'messages', 'inventory', 'packages', 'bookings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: activeTab === tab
                    ? 'linear-gradient(135deg, #E88D5C, #D97A4A)'
                    : 'transparent',
                  color: activeTab === tab ? 'white' : (darkMode ? '#a1a1aa' : '#6b7280'),
                  border: activeTab === tab ? 'none' : '1px solid rgba(26, 43, 60, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'overview' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: darkMode ? '#1a1a2e' : 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(26, 43, 60, 0.06)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e', marginBottom: '1rem' }}>👤 Recent Users</h3>
                {recentUsers.length === 0 ? <p style={{ color: '#6b7280' }}>No users yet</p> : recentUsers.map((u, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < recentUsers.length - 1 ? '1px solid rgba(26, 43, 60, 0.06)' : 'none' }}>
                    <span style={{ color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>{u.full_name || u.email}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              <div style={{
                background: darkMode ? '#1a1a2e' : 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(26, 43, 60, 0.06)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e', marginBottom: '1rem' }}>🗺️ Recent Trips</h3>
                {recentTrips.length === 0 ? <p style={{ color: '#6b7280' }}>No trips yet</p> : recentTrips.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: i < recentTrips.length - 1 ? '1px solid rgba(26, 43, 60, 0.06)' : 'none' }}>
                    <span style={{ color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>{t.destination}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              overflow: 'auto'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e', marginBottom: '1rem' }}>All Users ({allUsers.length})</h3>
              {allUsers.length === 0 ? <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No users found</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(26, 43, 60, 0.06)', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Email</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Role</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(26, 43, 60, 0.04)' }}>
                        <td style={{ padding: '0.5rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>{u.full_name || '—'}</td>
                        <td style={{ padding: '0.5rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>{u.email}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <span style={{
                            padding: '0.2rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: u.user_type === 'admin' ? '#fef3c7' : '#e5e7eb',
                            color: u.user_type === 'admin' ? '#92400e' : '#6b7280'
                          }}>
                            {u.user_type || 'user'}
                          </span>
                        </td>
                        <td style={{ padding: '0.5rem' }}>
                          <button onClick={() => deleteUser(u.id)} style={{ padding: '0.25rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'trips' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              overflow: 'auto'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e', marginBottom: '1rem' }}>All Trips ({allTrips.length})</h3>
              {allTrips.length === 0 ? <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No trips found</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(26, 43, 60, 0.06)', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Destination</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Duration</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Budget</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTrips.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid rgba(26, 43, 60, 0.04)' }}>
                        <td style={{ padding: '0.5rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>{t.destination}</td>
                        <td style={{ padding: '0.5rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>{t.duration_days} days</td>
                        <td style={{ padding: '0.5rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>{t.budget ? `$${t.budget}` : '—'}</td>
                        <td style={{ padding: '0.5rem' }}>
                          <button onClick={() => deleteTrip(t.id)} style={{ padding: '0.25rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e', marginBottom: '1rem' }}>All Messages ({stats.messages})</h3>
              {recentMessages.length === 0 ? <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No messages yet</p> : recentMessages.map((m, i) => (
                <div key={i} style={{ padding: '0.75rem', borderBottom: i < recentMessages.length - 1 ? '1px solid rgba(26, 43, 60, 0.06)' : 'none' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>{m.message}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '11px', color: '#6b7280', marginTop: '0.25rem' }}>
                    <span>🆔 {m.user_id?.slice(0, 8)}...</span>
                    <span>📅 {new Date(m.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)'
            }}>
              <Inventory user={user} />
            </div>
          )}

          {activeTab === 'packages' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)'
            }}>
              <TourPackages user={user} />
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(26, 43, 60, 0.06)'
            }}>
              <BookingDashboard user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard