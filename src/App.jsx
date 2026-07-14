import React, { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SharedTrip from './pages/SharedTrip'
import AdminDashboard from './pages/AdminDashboard'
import NewAdminLogin from './pages/NewAdminLogin'
import { ThemeProvider } from './context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSharedTrip, setIsSharedTrip] = useState(false)
  const [isAdminRoute, setIsAdminRoute] = useState(false)
  const [adminPath, setAdminPath] = useState('')

  useEffect(() => {
    const pathname = window.location.pathname
    
    // Check for shared trip routes
    if (pathname.startsWith('/shared/')) {
      setIsSharedTrip(true)
      setLoading(false)
      return
    }
    
    // Check for admin routes
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      setIsAdminRoute(true)
      setAdminPath(pathname)
      setLoading(false)
      return
    }

    // Regular user session
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('adminUser')
    window.location.href = '/'
  }

  const handleAdminLogin = (user) => {
    localStorage.setItem('adminUser', JSON.stringify(user))
    window.location.href = '/admin/dashboard'
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f3ff'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          style={{ fontSize: '48px' }}
        >
          🌍
        </motion.div>
      </div>
    )
  }

  // Shared trip route
  if (isSharedTrip) {
    return (
      <ThemeProvider>
        <SharedTrip />
      </ThemeProvider>
    )
  }

  if (isAdminRoute) {
    const adminUser = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('adminUser') || 'null')
      : null

    if (adminPath === '/admin') {
      return (
        <ThemeProvider>
          <NewAdminLogin onLogin={handleAdminLogin} />
        </ThemeProvider>
      )
    }

    if (adminPath.startsWith('/admin/dashboard')) {
      const currentUser = adminUser || session?.user

      if (!currentUser) {
        window.location.href = '/admin'
        return null
      }

      return (
        <ThemeProvider>
          <AdminDashboard user={currentUser} onLogout={handleLogout} />
        </ThemeProvider>
      )
    }

    return (
      <ThemeProvider>
        <NewAdminLogin onLogin={handleAdminLogin} />
      </ThemeProvider>
    )
  }

  // Regular user routes
  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        <motion.div
          key={session ? 'dashboard' : 'login'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {session ? <Dashboard /> : <Login />}
        </motion.div>
      </AnimatePresence>
    </ThemeProvider>
  )
}

export default App