// ============================================================
// 1. IMPORTS
// ============================================================
import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import MockChatbot from '../components/MockChatbot'
import TripGenerator from './TripGenerator'
import OperatorRegistration from '../components/OperatorRegistration'
import Profile from './Profile'
import TripShare from '../components/TripShare'
import GroupChat from '../components/GroupChat'
import TripMap from '../components/TripMap'
import TripPhotos from '../components/TripPhotos'
import TripCalendar from '../components/TripCalendar'
import PackingList from '../components/PackingList'
import TripCountdown from '../components/TripCountdown'
import { motion } from 'framer-motion'
import WeatherWidget from '../components/WeatherWidget'
import AdminDashboard from './AdminDashboard'
import UserBookings from '../components/UserBookings'
import UserTourPackages from '../components/UserTourPackages'
import BookingDashboard from '../components/BookingDashboard'
import SlidePanel from '../components/SlidePanel'

// ============================================================
// 2. MAIN COMPONENT
// ============================================================
function Dashboard() {
  // ============================================================
  // 2.1 STATE VARIABLES
  // ============================================================
  const [user, setUser] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTripGenerator, setShowTripGenerator] = useState(false)
  const [showOperatorRegistration, setShowOperatorRegistration] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [shareTrip, setShareTrip] = useState(null)
  const [selectedTripForChat, setSelectedTripForChat] = useState(null)
  const [showMap, setShowMap] = useState(false)
  const [selectedTripForPhotos, setSelectedTripForPhotos] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedTripForPacking, setSelectedTripForPacking] = useState(null)
  const [userType, setUserType] = useState('tourist')
  const { darkMode } = useTheme()
  const [showAdmin, setShowAdmin] = useState(false)
  const [showBookings, setShowBookings] = useState(false)
  const [showTourPackages, setShowTourPackages] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // ============================================================
  // 2.2 FETCH USER DATA
  // ============================================================
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single()

        console.log('Debug: fetched profile for user', user?.id, profile, profileError)

        const rawType = profile?.user_type
        const normalized = typeof rawType === 'string' ? rawType.trim().toLowerCase() : null

        if (normalized === 'operator') {
          try {
            const { data: operatorRow, error: opError } = await supabase
              .from('operators')
              .select('is_verified')
              .eq('id', user.id)
              .single()

            console.log('Debug: operator row', operatorRow, opError)

            if (!opError && operatorRow?.is_verified) {
              setUserType('operator')
            } else {
              setUserType('tourist')
            }
          } catch (err) {
            console.error('Error checking operator verification:', err)
            setUserType('tourist')
          }
        } else if (normalized === 'admin') {
          setUserType('admin')
        } else {
          setUserType('tourist')
        }
        
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (!error) {
          setTrips(data || [])
        }
      }
      setLoading(false)
    }
    
    getUser()
  }, [])

  // ============================================================
  // 2.3 HELPER FUNCTIONS
  // ============================================================
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const loadTrips = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (!error) {
      setTrips(data || [])
    }
  }

  // ============================================================
  // 2.4 LOADING SCREEN
  // ============================================================
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px' }}
          >
            🌍
          </motion.div>
          <p style={{ color: darkMode ? '#a1a1aa' : '#1a1a2e', fontWeight: '500', marginTop: '1rem' }}>
            Loading your adventure...
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // 2.5 PAGE VIEWS (Conditions)
  // ============================================================

  // ---- Page: Operator Dashboard (if user is an operator) ----
  if (userType === 'operator' && !showProfile && !showOperatorRegistration) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
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
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#000',
                  marginBottom: '0.5rem'
                }}>
                  🏢 Operator Dashboard
                </h1>
                <p style={{ color: '#666', fontSize: '16px' }}>
                  Manage your tour packages and bookings
                </p>
              </div>
              <button
                onClick={() => { console.log('Dashboard: open profile panel'); setShowProfile(true) }}
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                👤 View Profile
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '2rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1rem', color: '#000' }}>
                  📦 Your Tour Packages
                </h2>
                <UserTourPackages user={user} />
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1rem', color: '#000' }}>
                  📋 Booking Dashboard
                </h2>
                <BookingDashboard user={user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 2.5 PAGE VIEWS (Conditions)
  // ============================================================
  if (showTripGenerator) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <TripGenerator user={user} onTripSaved={loadTrips} />
      </div>
    )
  }

  // ---- Page: Profile ----
  if (showProfile) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <SlidePanel open={showProfile} onClose={() => { console.log('Dashboard: close profile panel'); setShowProfile(false) }} title="Your Profile">
          <Profile user={user} onLogout={handleLogout} />
        </SlidePanel>
      </div>
    )
  }

  // ---- Page: Operator Registration ----
  if (showOperatorRegistration) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <SlidePanel open={showOperatorRegistration} onClose={() => { console.log('Dashboard: close operator registration'); setShowOperatorRegistration(false) }} title="Operator Registration">
          <OperatorRegistration user={user} onRegistered={() => setShowOperatorRegistration(false)} />
        </SlidePanel>
      </div>
    )
  }

  // ---- Modal: Share Trip ----
  if (shareTrip) {
    return <TripShare trip={shareTrip} onClose={() => setShareTrip(null)} />
  }

  // ---- Page: Trip Photos ----
  if (selectedTripForPhotos) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: darkMode ? '#0f0f1a' : '#f5f3ff',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button
              onClick={() => setSelectedTripForPhotos(null)}
              style={{
                background: 'transparent',
                color: darkMode ? '#a1a1aa' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid rgba(26, 43, 60, 0.06)'
            }}>
              <h2 style={{ fontSize: '24px', marginBottom: '0.5rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                📸 {selectedTripForPhotos.destination} Photos
              </h2>
              <TripPhotos trip={selectedTripForPhotos} user={user} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---- Page: Group Chat ----
  if (selectedTripForChat) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: darkMode ? '#0f0f1a' : '#f5f3ff',
          padding: '2rem',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '2rem' }}>
            <button
              onClick={() => setSelectedTripForChat(null)}
              style={{
                background: 'transparent',
                color: darkMode ? '#a1a1aa' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
            <GroupChat trip={selectedTripForChat} user={user} />
          </div>
        </div>
      </div>
    )
  }

  // ---- Page: Map View ----
  if (showMap) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: darkMode ? '#0f0f1a' : '#f5f3ff',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                🗺️ Your Trips Map
              </h1>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  background: 'transparent',
                  color: darkMode ? '#a1a1aa' : '#1a1a2e',
                  border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                  padding: '0.5rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
            {trips.length === 0 ? (
              <div style={{
                background: darkMode ? '#1a1a2e' : 'white',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                border: '2px dashed rgba(26, 43, 60, 0.1)'
              }}>
                <span style={{ fontSize: '48px' }}>🗺️</span>
                <h3 style={{ marginTop: '1rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>No trips to show</h3>
                <p style={{ color: '#6b7280' }}>Create a trip first to see it on the map!</p>
              </div>
            ) : (
              <TripMap trips={trips} />
            )}
          </div>
        </div>
      </div>
    )
  }

  // ---- Page: Calendar View ----
  if (showCalendar) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: darkMode ? '#0f0f1a' : '#f5f3ff',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button
              onClick={() => setShowCalendar(false)}
              style={{
                background: 'transparent',
                color: darkMode ? '#a1a1aa' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
            <TripCalendar trips={trips} />
          </div>
        </div>
      </div>
    )
  }

  // ---- Page: Packing List ----
if (selectedTripForPacking) {
  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{
        minHeight: '100vh',
        background: darkMode ? '#0f0f1a' : '#f5f3ff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <PackingList 
            trip={selectedTripForPacking} 
            onBack={() => setSelectedTripForPacking(null)} 
          />
        </div>
      </div>
    </div>
  )
}

// ---- Page: Admin Dashboard (PROTECTED) ----
if (showAdmin) {
  // Only admins can access
  if (userType === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  } else {
    // Non-admin trying to access - show access denied
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: darkMode ? '#0f0f1a' : '#f5f3ff',
          padding: '2rem'
        }}>
          <div style={{
            background: darkMode ? '#1a1a2e' : 'white',
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%'
          }}>
            <span style={{ fontSize: '48px' }}>⛔</span>
            <h2 style={{ marginTop: '1rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
              Access Denied
            </h2>
            <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280', margin: '0.5rem 0 1.5rem' }}>
              You don't have admin privileges. Please contact the system administrator.
            </p>
            <button
              onClick={() => setShowAdmin(false)}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }
}

// ---- Page: ShowBookings ----
if (showBookings) {
  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{
        minHeight: '100vh',
        background: darkMode ? '#0f0f1a' : '#f5f3ff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button
            onClick={() => setShowBookings(false)}
            style={{
              background: 'transparent',
              color: darkMode ? '#a1a1aa' : '#1a1a2e',
              border: '2px solid #1a1a2e',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </button>
          <UserBookings user={user} />
        </div>
      </div>
    </div>
  )
}


// ---- Page: ShowTourPackages ----
if (showTourPackages) {
  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{
        minHeight: '100vh',
        background: darkMode ? '#0f0f1a' : '#f5f3ff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button
            onClick={() => setShowTourPackages(false)}
            style={{
              background: 'transparent',
              color: darkMode ? '#a1a1aa' : '#1a1a2e',
              border: '2px solid #1a1a2e',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </button>
          <UserTourPackages user={user} />
        </div>
      </div>
    </div>
  )
}

// ---- Page: ShowStats ----
if (showStats) {
  const totalTrips = trips.length
  const uniqueDestinations = new Set(
    trips
      .map((trip) => trip.destination && trip.destination.toString().trim().toLowerCase())
      .filter(Boolean)
  ).size
  const totalBudget = trips.reduce((sum, trip) => sum + (Number(trip.budget) || 0), 0)
  const averageDuration = trips.length > 0
    ? Math.round(trips.reduce((sum, trip) => sum + (Number(trip.duration_days) || 0), 0) / trips.length)
    : 0
  const upcomingTrips = trips.filter((trip) => {
    if (!trip.departure_date) return false
    return new Date(trip.departure_date) > new Date()
  }).length

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{
        minHeight: '100vh',
        background: darkMode ? '#0f0f1a' : '#f5f3ff',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button
            onClick={() => setShowStats(false)}
            style={{
              background: 'transparent',
              color: darkMode ? '#a1a1aa' : '#1a1a2e',
              border: '2px solid #1a1a2e',
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '1rem',
              fontWeight: '600'
            }}
          >
            ← Back to Dashboard
          </button>
          <div style={{
            background: darkMode ? '#1a1a2e' : 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid rgba(26, 43, 60, 0.06)'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '1rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
              📊 Your Stats
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: darkMode ? '#111827' : '#f9fafb', borderRadius: '16px', padding: '1.5rem' }}>
                <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>Total Trips</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#8B5CF6' }}>{totalTrips}</p>
              </div>
              <div style={{ background: darkMode ? '#111827' : '#f9fafb', borderRadius: '16px', padding: '1.5rem' }}>
                <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>Unique Destinations</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B' }}>{uniqueDestinations}</p>
              </div>
              <div style={{ background: darkMode ? '#111827' : '#f9fafb', borderRadius: '16px', padding: '1.5rem' }}>
                <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>Average Duration</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#22C55E' }}>{averageDuration} days</p>
              </div>
              <div style={{ background: darkMode ? '#111827' : '#f9fafb', borderRadius: '16px', padding: '1.5rem' }}>
                <p style={{ marginBottom: '0.5rem', color: '#6b7280' }}>Upcoming Trips</p>
                <p style={{ fontSize: '32px', fontWeight: '700', color: '#EF4444' }}>{upcomingTrips}</p>
              </div>
            </div>
            <div style={{ marginTop: '2rem', color: '#6b7280' }}>
              <p>{totalBudget > 0 ? `Total planned budget across trips: $${totalBudget.toLocaleString()}` : 'No trip budget data available yet.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

  // ============================================================
  // 2.6 MAIN DASHBOARD (Default View)
  // ============================================================
  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="dashboard-container" style={{
        minHeight: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' 
          : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        padding: '2rem',
        position: 'relative'
      }}>
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          
          {/* Welcome Section */}
          <div style={{
            background: darkMode ? '#1a1a2e' : 'white',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid rgba(26, 43, 60, 0.06)',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontSize: '40px' }}>👋</span>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: darkMode ? '#e4e4e7' : '#1a1a2e',
                  marginBottom: '0.25rem'
                }}>
                  Welcome back, {user?.email?.split('@')[0] || 'Traveler'}!
                </h1>
                <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                  Ready to plan your next adventure? Let's go! ✈️
                </p>
              </div>
              <div style={{
                background: darkMode ? '#0f0f1a' : '#f5f3ff',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '13px',
                color: darkMode ? '#a1a1aa' : '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  background: '#22c55e',
                  borderRadius: '50%'
                }} />
                {trips.length > 0 ? `${trips.length} trips planned` : 'No trips yet'}
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="quick-actions" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            
            <button
              onClick={() => setShowTripGenerator(true)}
              style={{
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                color: 'white',
                border: 'none',
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(232, 141, 92, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>✨</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem', color: 'white' }}>New Trip</h3>
              <p style={{ fontSize: '13px', opacity: 0.8, color: 'white' }}>Plan with AI</p>
            </button>

            <button
              onClick={() => setShowOperatorRegistration(true)}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: 'white',
                border: 'none',
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🏢</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem', color: 'white' }}>Become an Operator</h3>
              <p style={{ fontSize: '13px', opacity: 0.9, color: 'white' }}>Start earning with your tours</p>
            </button>

            <button
              onClick={() => setShowProfile(true)}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>👤</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>My Profile</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Edit your info</p>
            </button>

            <button
              onClick={() => setShowMap(true)}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🗺️</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>View Map</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>See all trips</p>
            </button>

            <button
              onClick={() => setShowCalendar(true)}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📅</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>Calendar</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>View your trips</p>
            </button>

            {/* Admin Portal - ONLY visible to admins */}
            {userType === 'admin' && (
              <button
                onClick={() => setShowAdmin(true)}
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #6d28d9)',
                  color: 'white',
                  border: 'none',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px)'
                  e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📊</span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem', color: 'white' }}>Admin Portal</h3>
                <p style={{ fontSize: '13px', opacity: 0.8, color: 'white' }}>Manage your platform</p>
              </button>
            )}

            <button
              onClick={() => setShowBookings(true)}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📋</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>My Bookings</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>View and pay</p>
            </button>

            <button
              onClick={() => setShowTourPackages(true)}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                border: '2px solid' + (darkMode ? '#2d2d44' : '#1a1a2e'),
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🏝️</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>Tour Packages</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Book your adventure</p>
            </button>

            {/* Your Stats - Clickable */}
            <button
              onClick={() => setShowStats(true)}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                border: '1px solid rgba(26, 43, 60, 0.06)',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: darkMode ? '#e4e4e7' : '#1a1a2e'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📊</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>Your Stats</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
              </p>
            </button>

            {/* AI Assistant Card */}
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid rgba(26, 43, 60, 0.06)',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🤖</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>AI Assistant</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Chat below</p>
            </div>
          </div>

          {/* Chatbot Section */}
          <div style={{ marginBottom: '2rem' }}>
            <MockChatbot />
          </div>

          {/* Trip List Section */}
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: darkMode ? '#e4e4e7' : '#1a1a2e',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            🗺️ Your Trips
            <span style={{
              fontSize: '14px',
              fontWeight: '400',
              color: '#6b7280',
              background: darkMode ? '#0f0f1a' : '#f5f3ff',
              padding: '2px 10px',
              borderRadius: '12px'
            }}>
              {trips.length}
            </span>
          </h2>

          {/* Empty State (No Trips) */}
          {trips.length === 0 ? (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '2px dashed rgba(26, 43, 60, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: '#E88D5C',
                borderRadius: '50%',
                opacity: 0.05
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-80px',
                left: '-80px',
                width: '250px',
                height: '250px',
                background: '#2E4A4A',
                borderRadius: '50%',
                opacity: 0.05
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '72px', display: 'block', marginBottom: '1rem' }}>🗺️</span>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#e4e4e7' : '#1a1a2e', marginBottom: '0.5rem' }}>
                  Your adventure awaits!
                </h3>
                <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  You haven't planned any trips yet. Let our AI create a personalized itinerary just for you!
                </p>
                <button
                  onClick={() => setShowTripGenerator(true)}
                  style={{
                    background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                    color: 'white',
                    border: 'none',
                    padding: '0.85rem 2.5rem',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = '0 8px 24px rgba(232, 141, 92, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  ✨ Create Your First Trip
                </button>
              </div>
            </div>
          ) : (
            /* Trip Cards */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  style={{
                    background: darkMode ? '#1a1a2e' : 'white',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(26, 43, 60, 0.06)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)'
                    e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)'
                    e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, transparent 50%, #F9F3E8 50%)',
                    borderTopRightRadius: '20px',
                    opacity: 0.5
                  }} />

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        fontFamily: "'Playfair Display', serif",
                        color: darkMode ? '#e4e4e7' : '#1a1a2e',
                        marginBottom: '0.25rem'
                      }}>
                        {trip.destination}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          📅 {trip.duration_days} days
                        </span>
                        <span style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          💰 {trip.budget ? `$${trip.budget}` : 'Budget flexible'}
                        </span>
                        {trip.itinerary?.estimatedCost && (
                          <span style={{
                            fontSize: '12px',
                            background: '#F9F3E8',
                            padding: '0.2rem 0.75rem',
                            borderRadius: '12px',
                            color: '#1a1a2e'
                          }}>
                            {trip.itinerary.estimatedCost}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '0.25rem'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        background: 'rgba(46, 74, 74, 0.1)',
                        color: '#2E4A4A',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        📌 {trip.duration_days} days
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                    <WeatherWidget destination={trip.destination} />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <TripCountdown trip={trip} />
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    borderTop: '1px solid rgba(26, 43, 60, 0.06)',
                    paddingTop: '1rem',
                    marginTop: '0.5rem'
                  }}>
                    <button
                      onClick={() => setShareTrip(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: '13px',
                        color: darkMode ? '#a1a1aa' : '#1a1a2e',
                        background: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid rgba(26, 43, 60, 0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#1a1a2e'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = darkMode ? '#a1a1aa' : '#1a1a2e'
                      }}
                    >
                      🔗 Share
                    </button>
                    
                    <button
                      onClick={() => setSelectedTripForChat(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: '13px',
                        color: '#2E4A4A',
                        background: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #2E4A4A',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#2E4A4A'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#2E4A4A'
                      }}
                    >
                      💬 Chat
                    </button>
                    
                    <button
                      onClick={() => setSelectedTripForPhotos(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: '13px',
                        color: '#F4C542',
                        background: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #F4C542',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#F4C542'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#F4C542'
                      }}
                    >
                      📸 Photos
                    </button>
                    
                    <button
                      onClick={() => setSelectedTripForPacking(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: '13px',
                        color: '#E88D5C',
                        background: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #E88D5C',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#E88D5C'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#E88D5C'
                      }}
                    >
                      🧳 Packing
                    </button>
                    
                    <button
                      onClick={() => {
                        alert(JSON.stringify(trip.itinerary, null, 2))
                      }}
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: '13px',
                        color: darkMode ? '#a1a1aa' : '#2C2C2C',
                        background: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid rgba(26, 43, 60, 0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#2C2C2C'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = darkMode ? '#a1a1aa' : '#2C2C2C'
                      }}
                    >
                      View Itinerary
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 3. EXPORT
// ============================================================
export default Dashboard