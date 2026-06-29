import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { sendBulkEmail } from '../services/emailService'

function AdminDashboard({ user, onLogout }) {
  const [stats, setStats] = useState({
    users: 0,
    trips: 0,
    messages: 0,
    operators: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentTrips, setRecentTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewsletter, setShowNewsletter] = useState(false)
  const [newsletterSubject, setNewsletterSubject] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [allUsers, setAllUsers] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      // Get total trips
      const { count: tripsCount } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
      
      // Get total messages
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
      
      // Get total operators
      const { count: operatorsCount } = await supabase
        .from('operators')
        .select('*', { count: 'exact', head: true })
      
      // Get recent users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Get recent trips
      const { data: tripsData } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      // Get all users (for newsletter)
      const { data: allUsersData } = await supabase
        .from('profiles')
        .select('email, full_name')
      
      setStats({
        users: usersCount || 0,
        trips: tripsCount || 0,
        messages: messagesCount || 0,
        operators: operatorsCount || 0
      })
      setRecentUsers(usersData || [])
      setRecentTrips(tripsData || [])
      setAllUsers(allUsersData || [])
      setLoading(false)
    }
    
    fetchStats()
  }, [])

  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterMessage.trim()) {
      alert('Please enter both subject and message.')
      return
    }

    if (allUsers.length === 0) {
      alert('No users to send to.')
      return
    }

    if (!confirm(`Send newsletter to ${allUsers.length} users?`)) return

    setSending(true)
    let sentCount = 0
    let failCount = 0

    try {
      // Send to each user individually (free tier limit = 200/month)
      for (const user of allUsers) {
        try {
          await sendBulkEmail(
            user.email,
            newsletterSubject,
            newsletterMessage.replace(/\n/g, '<br>'),
            user.full_name || 'Traveler'
          )
          sentCount++
          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (err) {
          failCount++
          console.error(`Failed to send to ${user.email}:`, err)
        }
      }

      alert(`✅ Newsletter sent!\n\nSent: ${sentCount}\nFailed: ${failCount}`)
      setShowNewsletter(false)
      setNewsletterSubject('')
      setNewsletterMessage('')
    } catch (error) {
      alert('❌ Error sending newsletter: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f4ff'
      }}>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <div className="admin-container" style={{
        minHeight: '100vh',
        background: '#f0f4ff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1a1a2e'
              }}>
                📊 Admin Dashboard
              </h1>
              <p style={{ color: '#6b7280' }}>
                Overview of your WanderAI platform
              </p>
            </div>
            
            {/* Newsletter Button */}
            <button
              onClick={() => setShowNewsletter(!showNewsletter)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
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
                e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)'
                e.target.style.boxShadow = 'none'
              }}
            >
              📧 {showNewsletter ? 'Close' : 'Send Newsletter'}
            </button>
          </div>

          {/* Newsletter Form */}
          {showNewsletter && (
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              marginTop: '1.5rem',
              marginBottom: '2rem',
              border: '1px solid rgba(139, 92, 246, 0.08)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📧 Send Newsletter
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Send an email to all {stats.users} users
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={newsletterSubject}
                  onChange={(e) => setNewsletterSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., New Features Update!"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  Message
                </label>
                <textarea
                  value={newsletterMessage}
                  onChange={(e) => setNewsletterMessage(e.target.value)}
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Write your newsletter message here..."
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleSendNewsletter}
                  disabled={sending}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    opacity: sending ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!sending) {
                      e.target.style.transform = 'scale(1.02)'
                      e.target.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  {sending ? 'Sending...' : '📧 Send to All Users'}
                </button>
                <button
                  onClick={() => setShowNewsletter(false)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #ddd',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
              </div>

              <p style={{
                marginTop: '1rem',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                ⚠️ {allUsers.length} users will receive this email. 
                Free tier: 200 emails/month.
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="admin-stats" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(139, 92, 246, 0.06)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Users</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#8B5CF6' }}>{stats.users}</p>
            </div>
            
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(139, 92, 246, 0.06)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Trips</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#EC4899' }}>{stats.trips}</p>
            </div>
            
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(139, 92, 246, 0.06)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Total Messages</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e' }}>{stats.messages}</p>
            </div>
            
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(139, 92, 246, 0.06)'
            }}>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Tour Operators</p>
              <p style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>{stats.operators}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="admin-recent" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Recent Users */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(139, 92, 246, 0.06)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                👤 Recent Users
              </h3>
              {recentUsers.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No users yet</p>
              ) : (
                recentUsers.map((u, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: i < recentUsers.length - 1 ? '1px solid #f0f0f0' : 'none',
                    flexWrap: 'wrap',
                    gap: '0.25rem'
                  }}>
                    <span>{u.full_name || u.email}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Recent Trips */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(139, 92, 246, 0.06)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🗺️ Recent Trips
              </h3>
              {recentTrips.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No trips yet</p>
              ) : (
                recentTrips.map((t, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: i < recentTrips.length - 1 ? '1px solid #f0f0f0' : 'none',
                    flexWrap: 'wrap',
                    gap: '0.25rem'
                  }}>
                    <span>{t.destination}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard