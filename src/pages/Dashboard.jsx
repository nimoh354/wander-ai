// ============================================================
// 1. IMPORTS
// ============================================================
import React, { useState, useEffect } from 'react'
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

// ============================================================
// 2. MAIN COMPONENT
// ============================================================
function Dashboard() {
  // ============================================================
  // 2.1 STATE VARIABLES
  // ============================================================
  // 🔹 User & Trips
  const [user, setUser] = useState(null)           // Current logged-in user
  const [trips, setTrips] = useState([])           // User's saved trips
  const [loading, setLoading] = useState(true)     // Loading state

  // 🔹 Page Views (Switch between different pages)
  const [showTripGenerator, setShowTripGenerator] = useState(false)           // Show trip planner
  const [showOperatorRegistration, setShowOperatorRegistration] = useState(false) // Show operator signup
  const [showProfile, setShowProfile] = useState(false)                       // Show profile page
  const [showMap, setShowMap] = useState(false)                               // Show map view
  const [showCalendar, setShowCalendar] = useState(false)                     // Show calendar view

  // 🔹 Trip-specific modals
  const [shareTrip, setShareTrip] = useState(null)              // Which trip to share
  const [selectedTripForChat, setSelectedTripForChat] = useState(null)       // Chat for a specific trip
  const [selectedTripForPhotos, setSelectedTripForPhotos] = useState(null)   // Photos for a specific trip
  const [selectedTripForPacking, setSelectedTripForPacking] = useState(null) // Packing list for a specific trip

  // ============================================================
  // 2.2 FETCH USER DATA (Runs once on component mount)
  // ============================================================
  useEffect(() => {
    const getUser = async () => {
      // Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // If user is logged in, fetch their trips
      if (user) {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)           // Filter trips by user ID
          .order('created_at', { ascending: false }) // Newest first
        
        if (!error) {
          setTrips(data || [])
        }
      }
      setLoading(false)
    }
    
    getUser()
  }, []) // Empty dependency array = runs once

  // ============================================================
  // 2.3 HELPER FUNCTIONS
  // ============================================================
  
  // 🔹 Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload() // Refresh page to clear state
  }

  // 🔹 Refresh trips list (called after saving a new trip)
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
        background: '#f0f4ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '48px' }}
          >
            🌍
          </motion.div>
          <p style={{ color: '#8B5CF6', fontWeight: '500', marginTop: '1rem' }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // 2.5 PAGE VIEWS (Conditions that render different pages)
  // ============================================================

  // 🔹 CONDITION 1: Show Trip Generator
  // When user clicks "New Trip" button
  if (showTripGenerator) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <TripGenerator user={user} onTripSaved={loadTrips} />
      </div>
    )
  }

  // 🔹 CONDITION 2: Show Profile Page
  // When user clicks "My Profile" button
  if (showProfile) {
    return <Profile user={user} onLogout={handleLogout} />
  }

  // 🔹 CONDITION 3: Show Operator Registration
  // When user clicks "Become an Operator" button
  if (showOperatorRegistration) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          padding: '2rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 0
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '600px',
            margin: '0 auto',
            paddingTop: '2rem'
          }}>
            {/* Back Button */}
            <button
              onClick={() => setShowOperatorRegistration(false)}
              style={{
                background: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
            <OperatorRegistration user={user} onRegistered={() => setShowOperatorRegistration(false)} />
          </div>
        </div>
      </div>
    )
  }

  // 🔹 CONDITION 4: Show Trip Share Modal
  // When user clicks "Share" button on a trip
  if (shareTrip) {
    return <TripShare trip={shareTrip} onClose={() => setShareTrip(null)} />
  }

  // 🔹 CONDITION 5: Show Trip Photos
  // When user clicks "Photos" button on a trip
  if (selectedTripForPhotos) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: '#f0f4ff',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
              onClick={() => setSelectedTripForPhotos(null)}
              style={{
                background: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '0.5rem',
                color: '#1a1a2e'
              }}>
                📸 {selectedTripForPhotos.destination} Photos
              </h2>
              <TripPhotos trip={selectedTripForPhotos} user={user} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🔹 CONDITION 6: Show Group Chat
  // When user clicks "Chat" button on a trip
  if (selectedTripForChat) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          padding: '2rem',
          position: 'relative'
        }}>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 0
          }} />
          <div style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '700px',
            margin: '0 auto',
            paddingTop: '2rem'
          }}>
            {/* Back Button */}
            <button
              onClick={() => setSelectedTripForChat(null)}
              style={{
                background: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
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

  // 🔹 CONDITION 7: Show Map View
  // When user clicks "View Map" button
  if (showMap) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: '#f0f4ff',
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
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🗺️ Your Trips Map
              </h1>
              {/* Back Button */}
              <button
                onClick={() => setShowMap(false)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'white',
                  color: '#1a1a2e',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
            {trips.length === 0 ? (
              <div style={{
                background: 'white',
                padding: '3rem 2rem',
                borderRadius: '20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '48px' }}>🗺️</span>
                <h3 style={{ marginTop: '1rem' }}>No trips to show</h3>
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

  // 🔹 CONDITION 8: Show Calendar View
  // When user clicks "Calendar" button
  if (showCalendar) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: '#f0f4ff',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
              onClick={() => setShowCalendar(false)}
              style={{
                background: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
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

  // 🔹 CONDITION 9: Show Packing List
  // When user clicks "Packing" button on a trip
  if (selectedTripForPacking) {
    return (
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{
          minHeight: '100vh',
          background: '#f0f4ff',
          padding: '2rem'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
              onClick={() => setSelectedTripForPacking(null)}
              style={{
                background: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1rem',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
            <PackingList trip={selectedTripForPacking} />
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 2.6 MAIN DASHBOARD (Default view)
  // ============================================================
  return (
    <div>
      {/* Navbar - always visible */}
      <Navbar user={user} onLogout={handleLogout} />
      
      {/* Main container with background image */}
      <div className="dashboard-container" style={{
        minHeight: '100vh',
        backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Dark overlay for readability */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 0
        }} />
        
        {/* Content wrapper */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          // ============================================================
          // 2.6.1 WELCOME SECTION
          // ============================================================
          <div className="welcome-section" style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            marginBottom: '2rem',
            border: '1px solid rgba(139, 92, 246, 0.08)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* 👋 Floating welcome emoji */}
              <span className="float-animation" style={{ fontSize: '40px' }}>👋</span>
              
              {/* User greeting */}
              <div style={{ flex: 1, minWidth: '150px' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '0.25rem'
                }}>
                  Welcome back, {user?.email?.split('@')[0] || 'Traveler'}!
                </h1>
                <p style={{ color: '#6b7280' }}>
                  Ready to plan your next adventure? Let's go! ✈️
                </p>
              </div>
              
              {/* 📊 Trip count badge */}
              <div style={{
                background: '#f0f0f0',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                fontSize: '13px',
                color: '#6b7280',
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

          // ============================================================
          // 2.6.2 QUICK ACTIONS GRID (Buttons that change page view)
          // ============================================================
          <div className="quick-actions" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            
            // 🔹 BUTTON 1: New Trip → Shows TripGenerator
            <button
              onClick={() => setShowTripGenerator(true)}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>✨</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>New Trip</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Plan with AI</p>
            </button>

            // 🔹 BUTTON 2: Become an Operator → Shows OperatorRegistration
            <button
              onClick={() => setShowOperatorRegistration(true)}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🏢</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>Become an Operator</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>List your services</p>
            </button>

            // 🔹 BUTTON 3: My Profile → Shows Profile page
            <button
              onClick={() => setShowProfile(true)}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>👤</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>My Profile</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Edit your info</p>
            </button>

            // 🔹 BUTTON 4: View Map → Shows TripMap
            <button
              onClick={() => setShowMap(true)}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🗺️</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>View Map</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>See all trips</p>
            </button>

            // 🔹 BUTTON 5: Calendar → Shows TripCalendar
            <button
              onClick={() => setShowCalendar(true)}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📅</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>Calendar</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>View your trips</p>
            </button>

            // 🔹 CARD 6: Stats (Static info card)
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.08)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>📊</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>Your Stats</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>
                {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
              </p>
            </div>

            // 🔹 CARD 7: AI Assistant (Static info card)
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid rgba(139, 92, 246, 0.08)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '0.5rem' }}>🤖</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '0.25rem' }}>AI Assistant</h3>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Chat below</p>
            </div>
          </div>

          // ============================================================
          // 2.6.3 CHATBOT SECTION
          // ============================================================
          <div style={{ marginBottom: '2rem' }}>
            <MockChatbot />
          </div>

          // ============================================================
          // 2.6.4 TRIP LIST SECTION
          // ============================================================
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#1a1a2e',
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
              background: '#f0f0f0',
              padding: '2px 10px',
              borderRadius: '12px'
            }}>
              {trips.length}
            </span>
          </h2>

          // 🔹 IF NO TRIPS: Show empty state
          {trips.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '3rem 2rem',
              borderRadius: '20px',
              textAlign: 'center',
              border: '2px dashed rgba(139, 92, 246, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circles */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '200px',
                height: '200px',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: '50%',
                opacity: 0.05
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-80px',
                left: '-80px',
                width: '250px',
                height: '250px',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                borderRadius: '50%',
                opacity: 0.05
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: '72px', display: 'block', marginBottom: '1rem' }}>🗺️</span>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  marginBottom: '0.5rem'
                }}>
                  Your adventure awaits!
                </h3>
                <p style={{
                  color: '#6b7280',
                  maxWidth: '400px',
                  margin: '0 auto 1.5rem',
                  lineHeight: '1.6'
                }}>
                  You haven't planned any trips yet. Let our AI create a personalized itinerary just for you!
                </p>
                <button
                  onClick={() => setShowTripGenerator(true)}
                  style={{
                    padding: '0.85rem 2.5rem',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)'
                    e.target.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)'
                    e.target.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  ✨ Create Your First Trip
                </button>
              </div>
            </div>
          ) : (
            // 🔹 IF TRIPS EXIST: Show trip cards
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {trips.map((trip, index) => (
                // Each trip card with animation
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="trip-card"
                  style={{
                    background: 'white',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: '1px solid rgba(139, 92, 246, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#8B5CF6'
                    e.target.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.06)'
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* Trip Info */}
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a1a2e',
                      marginBottom: '0.25rem'
                    }}>
                      {trip.destination}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                      📅 {trip.duration_days} days • 💰 {trip.budget ? `$${trip.budget}` : 'Budget flexible'}
                    </p>
                    {/* Countdown timer for this trip */}
                    <TripCountdown trip={trip} />
                  </div>
                  
                  {/* Trip Actions Buttons */}
                  <div className="trip-actions" style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    flexWrap: 'wrap' 
                  }}>
                    // 🔹 BUTTON: Share → Opens TripShare modal
                    <button
                      onClick={() => setShareTrip(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        background: 'transparent',
                        color: '#8B5CF6',
                        border: '1px solid #8B5CF6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#8B5CF6'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#8B5CF6'
                      }}
                    >
                      🔗 Share
                    </button>
                    
                    // 🔹 BUTTON: Chat → Opens GroupChat for this trip
                    <button
                      onClick={() => setSelectedTripForChat(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        background: 'transparent',
                        color: '#22c55e',
                        border: '1px solid #22c55e',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#22c55e'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#22c55e'
                      }}
                    >
                      💬 Chat
                    </button>
                    
                    // 🔹 BUTTON: Photos → Opens TripPhotos for this trip
                    <button
                      onClick={() => setSelectedTripForPhotos(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        background: 'transparent',
                        color: '#F59E0B',
                        border: '1px solid #F59E0B',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#F59E0B'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#F59E0B'
                      }}
                    >
                      📸 Photos
                    </button>
                    
                    // 🔹 BUTTON: Packing → Opens PackingList for this trip
                    <button
                      onClick={() => setSelectedTripForPacking(trip)}
                      style={{
                        padding: '0.4rem 1rem',
                        background: 'transparent',
                        color: '#EC4899',
                        border: '1px solid #EC4899',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#EC4899'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent'
                        e.target.style.color = '#EC4899'
                      }}
                    >
                      🧳 Packing
                    </button>
                    
                    // 🔹 BUTTON: View Itinerary → Shows trip details in an alert
                    <button
                      style={{
                        padding: '0.4rem 1rem',
                        background: '#f5f3ff',
                        color: '#8B5CF6',
                        border: '1px solid #8B5CF6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#8B5CF6'
                        e.target.style.color = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#f5f3ff'
                        e.target.style.color = '#8B5CF6'
                      }}
                      onClick={() => {
                        alert(JSON.stringify(trip.itinerary, null, 2))
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