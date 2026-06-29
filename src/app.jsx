import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SharedTrip from './pages/SharedTrip'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSharedTrip, setIsSharedTrip] = useState(false)

  useEffect(() => {
    // Check if this is a shared trip URL
    if (window.location.pathname.startsWith('/shared/')) {
      setIsSharedTrip(true)
      setLoading(false)
      return
    }

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f3ff'
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Show shared trip page if it's a shared link
  if (isSharedTrip) {
    return (
      <ThemeProvider>
        <SharedTrip />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      {session ? <Dashboard /> : <Login />}
    </ThemeProvider>
  )
}

export default App