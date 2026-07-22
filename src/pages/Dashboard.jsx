// ============================================================
// 1. IMPORTS
// ============================================================
import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import AIChatbot from '../components/AIChatbot'
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
import MyReviews from './MyReviews'

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
  const [selectedTripItinerary, setSelectedTripItinerary] = useState(null)
  const [reviews, setReviews] = useState([])
  const [showMyReviews, setShowMyReviews] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [allReviews, setAllReviews] = useState([])

  // ============================================================
  // 2.2 FETCH USER DATA
  // ============================================================
  useEffect(() => {
    const getUser = async () => {
      try {
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
          
          // Fetch trips and reviews
          try {
            await loadTrips(user.id)
            await loadAllReviews()
          } catch (err) {
            console.error('Error loading data:', err)
            setFetchError('Could not load some data')
          }
        }
        setLoading(false)
      } catch (error) {
        console.error('Error in getUser:', error)
        setFetchError('Failed to load user data')
        setLoading(false)
      }
    }
    
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ============================================================
  // 2.3 HELPER FUNCTIONS (FIXED - WORKING QUERIES)
  // ============================================================
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.reload()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // FIXED: Load trips with working review queries
  const loadTrips = async (userId = null) => {
    const currentUserId = userId || user?.id
    if (!currentUserId) return
    
    try {
      setFetchError(null)
      
      // Fetch trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
      
      if (!tripsError && tripsData) {
        setTrips(tripsData || [])
        console.log(`✅ Loaded ${tripsData.length} trips`)
      } else if (tripsError) {
        console.error('Error fetching trips:', tripsError)
        setFetchError('Failed to load trips')
      }
      
      // ============================================================
      // FIXED: Load personal reviews - using simple SELECT first
      // ============================================================
      try {
        // First, get reviews for this user
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('trip_reviews')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false })
        
        if (!reviewsError && reviewsData) {
          console.log(`✅ Found ${reviewsData.length} personal reviews`)
          
          // If we have reviews, get profile info separately
          if (reviewsData.length > 0) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, full_name, email')
              .eq('id', currentUserId)
              .single()
            
            // Combine the data
            const enrichedReviews = reviewsData.map(review => ({
              ...review,
              profiles: profileData || { full_name: 'You', email: user?.email }
            }))
            
            setReviews(enrichedReviews)
            console.log(`✅ Loaded ${enrichedReviews.length} personal reviews with profiles`)
          } else {
            setReviews([])
          }
        } else if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError)
          setReviews([])
        }
      } catch (reviewErr) {
        console.warn('Could not load reviews:', reviewErr.message)
        setReviews([])
      }
      
    } catch (error) {
      console.error('Error in loadTrips:', error)
      setFetchError('An unexpected error occurred')
    }
  }

  // FIXED: Load all public reviews with working queries
  const loadAllReviews = async () => {
    try {
      console.log('Loading all reviews...')
      
      // Step 1: Get all reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('trip_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
        setAllReviews([])
        return
      }

      if (!reviewsData || reviewsData.length === 0) {
        console.log('No reviews found')
        setAllReviews([])
        return
      }

      console.log(`✅ Found ${reviewsData.length} reviews`)

      // Step 2: Get all unique user IDs from reviews
      const userIds = [...new Set(reviewsData.map(r => r.user_id).filter(Boolean))]
      console.log(`👤 Found ${userIds.length} unique users`)

      // Step 3: Fetch profiles for these users
      let profilesMap = {}
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)

        if (!profilesError && profilesData) {
          profilesMap = profilesData.reduce((acc, p) => {
            acc[p.id] = p
            return acc
          }, {})
          console.log(`✅ Loaded ${profilesData.length} profiles`)
        } else {
          console.warn('Could not fetch profiles:', profilesError)
        }
      }

      // Step 4: Get all unique trip IDs from reviews
      const tripIds = [...new Set(reviewsData.map(r => r.trip_id).filter(Boolean))]
      console.log(`📍 Found ${tripIds.length} unique trips`)

      // Step 5: Fetch trip data for these reviews
      let tripsMap = {}
      if (tripIds.length > 0) {
        const { data: tripsData, error: tripsError } = await supabase
          .from('trips')
          .select('id, destination, user_id')
          .in('id', tripIds)

        if (!tripsError && tripsData) {
          tripsMap = tripsData.reduce((acc, t) => {
            acc[t.id] = t
            return acc
          }, {})
          console.log(`✅ Loaded ${tripsData.length} trips`)
        } else {
          console.warn('Could not fetch trips:', tripsError)
        }
      }

      // Step 6: Combine all the data
      const combinedData = reviewsData.map(review => ({
        ...review,
        profiles: profilesMap[review.user_id] || null,
        trips: tripsMap[review.trip_id] || null
      }))

      setAllReviews(combinedData)
      console.log(`✅ Combined ${combinedData.length} reviews with profiles and trips`)

    } catch (error) {
      console.error('Error in loadAllReviews:', error)
      setAllReviews([])
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
  // 2.5 PAGE VIEWS (Conditions) - [KEPT THE SAME AS YOUR ORIGINAL]
  // ============================================================

  // ---- Page: Operator Dashboard ----
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

  // ---- Page: Trip Generator ----
  if (showTripGenerator) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <TripGenerator 
          user={user} 
          onTripSaved={() => {
            loadTrips()
            setShowTripGenerator(false)
          }} 
        />
      </div>
    )
  }

  // ---- Page: Profile ----
  if (showProfile) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: darkMode ? '#0f0f1a' : '#f5f3ff',
          padding: '2rem'
        }}>
          <Profile 
            user={user} 
            onLogout={handleLogout} 
            onClose={() => setShowProfile(false)}
            onProfileUpdate={() => loadTrips()}
          />
        </div>
      </div>
    )
  }

  // ---- Page: Operator Registration ----
  if (showOperatorRegistration) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <SlidePanel 
          open={showOperatorRegistration} 
          onClose={() => { 
            console.log('Dashboard: close operator registration'); 
            setShowOperatorRegistration(false) 
          }} 
          title="Operator Registration"
        >
          <OperatorRegistration 
            user={user} 
            onRegistered={() => {
              setShowOperatorRegistration(false)
              setUserType('operator')
            }} 
          />
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
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
                  border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
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
    if (userType === 'admin') {
      return <AdminDashboard user={user} onLogout={handleLogout} />
    } else {
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

  // ---- Page: My Reviews ----
  if (showMyReviews) {
    return <MyReviews user={user} onLogout={handleLogout} />
  }

  // ============================================================
  // ITINERARY MODAL
  // ============================================================
  if (selectedTripItinerary) {
    const trip = selectedTripItinerary
    const itinerary = trip.itinerary
    
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
              onClick={() => setSelectedTripItinerary(null)}
              style={{
                background: 'transparent',
                color: darkMode ? '#a1a1aa' : '#1a1a2e',
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
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
              padding: '2.5rem',
              border: `2px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: darkMode ? '#2d2d44' : '#f3f4f6',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔒</span>
                  <span style={{ fontSize: '14px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                    TRAVEL ITINERARY
                  </span>
                </div>
              </div>

              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                fontFamily: "'Playfair Display', serif",
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                {trip.destination}
              </h2>

              {itinerary && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>FLIGHT #</span>
                    <p style={{ fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                      {itinerary.flight_airline || 'N/A'} {itinerary.flight_number || ''}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>HOTEL</span>
                    <p style={{ fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e', fontSize: '14px' }}>
                      {itinerary.hotel || 'Not specified'}
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>HOTEL ADDRESS</span>
                    <p style={{ fontWeight: '400', color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '14px' }}>
                      {itinerary.hotel_address || 'Address not available'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>ARRIVAL</span>
                    <p style={{ fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                      {itinerary.arrival_date || 'TBD'}
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>DEPARTURE</span>
                    <p style={{ fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                      {itinerary.departure_date || 'TBD'}
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>BUDGET</span>
                    <p style={{ fontWeight: '600', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                      {itinerary.estimatedCost || trip.budget || 'Flexible'}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                {itinerary?.days && itinerary.days.map((day, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: index < itinerary.days.length - 1 ? '1.5rem' : '0',
                      borderBottom: index < itinerary.days.length - 1 ? `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}` : 'none',
                      paddingBottom: index < itinerary.days.length - 1 ? '1.5rem' : '0'
                    }}
                  >
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      fontFamily: "'Playfair Display', serif",
                      color: darkMode ? '#e4e4e7' : '#1a1a2e',
                      marginBottom: '0.75rem'
                    }}>
                      {day.title || `Day ${index + 1}`}
                    </h3>
                    <div style={{ display: 'grid', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#E88D5C', fontWeight: '600', minWidth: '70px' }}>Morning:</span>
                        <span style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
                          {day.morning || day.activities?.[0] || 'Free time'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#8B5CF6', fontWeight: '600', minWidth: '70px' }}>Afternoon:</span>
                        <span style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
                          {day.afternoon || day.activities?.[1] || 'Free time'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#EC4899', fontWeight: '600', minWidth: '70px' }}>Evening:</span>
                        <span style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
                          {day.evening || day.activities?.[2] || 'Free time'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {itinerary?.tips && itinerary.tips.length > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: darkMode ? '#0f0f1a' : '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>
                    💡 Travel Tips
                  </h4>
                  {itinerary.tips.slice(0, 4).map((tip, i) => (
                    <p key={i} style={{ color: darkMode ? '#d1d5db' : '#4b5563', fontSize: '13px', marginBottom: '0.25rem' }}>
                      {tip}
                    </p>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setSelectedTripItinerary(null)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ← Back to Dashboard
                </button>
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
          
          {/* Error Message */}
          {fetchError && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              border: '1px solid #fecaca'
            }}>
              ⚠️ {fetchError}
              <button
                onClick={() => setFetchError(null)}
                style={{
                  marginLeft: '1rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#991b1b',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Dismiss
              </button>
            </div>
          )}

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

          {/* Quick Actions Grid - [KEPT THE SAME AS YOUR ORIGINAL] */}
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
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 141, 92, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
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
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📅</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>Calendar</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>View your trips</p>
            </button>

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
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
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
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🏝️</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>Tour Packages</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Book your adventure</p>
            </button>

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
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📊</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem', color: darkMode ? '#e4e4e7' : '#1a1a2e' }}>Your Stats</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
              </p>
            </button>

            <button
              onClick={() => setShowMyReviews(true)}
              style={{
                background: darkMode ? '#1a1a2e' : 'white',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                border: `2px solid ${darkMode ? '#2d2d44' : '#1a1a2e'}`,
                padding: '1.5rem',
                borderRadius: '16px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>⭐</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>My Reviews</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Review your trips</p>
            </button>

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
            <AIChatbot />
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
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 141, 92, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  ✨ Create Your First Trip
                </button>
              </div>
            </div>
          ) : (
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
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.04)'
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
                        e.currentTarget.style.background = '#1a1a2e'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = darkMode ? '#a1a1aa' : '#1a1a2e'
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
                        e.currentTarget.style.background = '#2E4A4A'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#2E4A4A'
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
                        e.currentTarget.style.background = '#F4C542'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#F4C542'
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
                        e.currentTarget.style.background = '#E88D5C'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#E88D5C'
                      }}
                    >
                      🧳 Packing
                    </button>
                    
                    <button
                      onClick={() => {
                        if (trip.itinerary) {
                          setSelectedTripItinerary(trip)
                        } else {
                          alert('No itinerary available for this trip.')
                        }
                      }}
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
                        e.currentTarget.style.background = '#E88D5C'
                        e.currentTarget.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#E88D5C'
                      }}
                    >
                      📋 View Itinerary
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ============================================================
            COMMUNITY REVIEWS SECTION - FIXED with proper error handling
            ============================================================ */}
          <div style={{ marginTop: '3rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                🌍 Community Reviews
                <span style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#6b7280',
                  background: darkMode ? '#0f0f1a' : '#f5f3ff',
                  padding: '2px 10px',
                  borderRadius: '12px'
                }}>
                  {allReviews.length}
                </span>
              </h2>
              <button
                onClick={() => setShowMyReviews(true)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                ✏️ Write a Review
              </button>
            </div>

            {allReviews.length === 0 ? (
              <div style={{
                background: darkMode ? '#1a1a2e' : 'white',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                border: '2px dashed rgba(26, 43, 60, 0.1)'
              }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '1rem' }}>💬</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: darkMode ? '#e4e4e7' : '#1a1a2e', marginBottom: '0.5rem' }}>
                    No community reviews yet
                  </h3>
                  <p style={{ color: '#6b7280', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>
                    Be the first to share your travel experience with the community!
                  </p>
                  <button
                    onClick={() => setShowMyReviews(true)}
                    style={{
                      marginTop: '1.5rem',
                      padding: '0.75rem 2rem',
                      background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '15px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(232, 141, 92, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    Write Your First Review
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {allReviews.map((review) => {
                  // Determine the reviewer name
                  let reviewerName = 'Anonymous'
                  if (review.profiles) {
                    if (typeof review.profiles === 'object') {
                      reviewerName = review.profiles.full_name || review.profiles.email || 'Anonymous'
                    } else if (typeof review.profiles === 'string') {
                      reviewerName = review.profiles
                    }
                  }

                  // Check if this is the current user's review
                  const isOwnReview = review.user_id === user?.id
                  
                  return (
                    <div
                      key={review.id}
                      style={{
                        background: darkMode ? '#1a1a2e' : 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        border: isOwnReview 
                          ? `2px solid ${darkMode ? '#8B5CF6' : '#8B5CF6'}` 
                          : `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
                        boxShadow: isOwnReview 
                          ? '0 4px 16px rgba(139, 92, 246, 0.15)' 
                          : '0 4px 16px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = isOwnReview 
                          ? '0 4px 16px rgba(139, 92, 246, 0.15)' 
                          : '0 4px 16px rgba(0,0,0,0.04)'
                      }}
                    >
                      {isOwnReview && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: '#8B5CF6',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontWeight: '600'
                        }}>
                          Your Review
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontWeight: '600', 
                              color: darkMode ? '#e4e4e7' : '#1a1a2e',
                              fontSize: '15px'
                            }}>
                              {reviewerName}
                            </span>
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#6b7280',
                              background: darkMode ? '#0f0f1a' : '#f5f3ff',
                              padding: '0.15rem 0.6rem',
                              borderRadius: '12px'
                            }}>
                              {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                          <div style={{ marginTop: '0.25rem' }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} style={{ fontSize: '18px' }}>
                                {i < (review.rating || 0) ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.trips && review.trips.destination && (
                          <span style={{
                            fontSize: '10px',
                            background: darkMode ? '#0f0f1a' : '#f5f3ff',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            color: '#6b7280',
                            whiteSpace: 'nowrap',
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            📍 {review.trips.destination}
                          </span>
                        )}
                      </div>
                      {review.review && (
                        <p style={{ 
                          color: darkMode ? '#d1d5db' : '#4b5563', 
                          marginTop: '0.75rem',
                          lineHeight: '1.6',
                          fontSize: '14px'
                        }}>
                          {review.review}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 3. EXPORT
// ============================================================
export default Dashboard