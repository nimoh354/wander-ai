// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTheme } from '../context/ThemeContext'
import Users from 'lucide-react/dist/esm/icons/users.mjs'
import Calendar from 'lucide-react/dist/esm/icons/calendar.mjs'
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign.mjs'
import Star from 'lucide-react/dist/esm/icons/star.mjs'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up.mjs'
import Package from 'lucide-react/dist/esm/icons/package.mjs'
import BookOpen from 'lucide-react/dist/esm/icons/book-open.mjs'
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3.mjs'
import Search from 'lucide-react/dist/esm/icons/search.mjs'
import Download from 'lucide-react/dist/esm/icons/download.mjs'
import Edit from 'lucide-react/dist/esm/icons/edit.mjs'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.mjs'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle.mjs'
import XCircle from 'lucide-react/dist/esm/icons/x-circle.mjs'
import Clock from 'lucide-react/dist/esm/icons/clock.mjs'
import Plus from 'lucide-react/dist/esm/icons/plus.mjs'
import Menu from 'lucide-react/dist/esm/icons/menu.mjs'
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard.mjs'
import LogOut from 'lucide-react/dist/esm/icons/log-out.mjs'
import Activity from 'lucide-react/dist/esm/icons/activity.mjs'
import Inventory from '../components/Inventory'

function AdminDashboard({ user, onLogout }) {
  const { darkMode } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalPackages: 0,
    pendingBookings: 0,
    totalReviews: 0,
    activeUsers: 0,
    growthRate: 0
  })
  
  const [recentBookings, setRecentBookings] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [packageLoading, setPackageLoading] = useState(false)
  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    price: '',
    duration_days: 1,
    max_guests: 1,
    includes: '',
    excludes: '',
    status: 'active',
    start_date: '',
    end_date: '',
    available_from: '',
    available_to: '',
    season: ''
  })
  
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setCheckingAdmin(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (!error && profile?.user_type === 'admin') {
        setIsAdmin(true)
      }
      setCheckingAdmin(false)
    }

    checkAdmin()
  }, [user])

  // Fetch dashboard data only if admin
  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData()

      const channel = supabase
        .channel('admin-dashboard-bookings')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'tour_bookings'
        }, () => {
          fetchDashboardData()
        })
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    }
  }, [isAdmin])

 const fetchDashboardData = async () => {
  setLoading(true)
  try {
    console.log('📊 Fetching dashboard data...')

    // Fetch stats
    const [
      { count: usersCount },
      { count: bookingsCount },
      { count: packagesCount },
      { count: pendingCount },
      { count: reviewsCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('tour_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('tour_packages').select('*', { count: 'exact', head: true }),
      supabase.from('tour_bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('trip_reviews').select('*', { count: 'exact', head: true })
    ])

    console.log('📊 Stats:', { usersCount, bookingsCount, packagesCount, pendingCount, reviewsCount })

    // Fetch bookings (without joins)
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('tour_bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (bookingsError) {
      console.error('❌ Error fetching bookings:', bookingsError)
    } else {
      console.log('✅ Bookings fetched:', bookingsData?.length || 0)
      
      // Enrich bookings with user and package data (fetch separately)
      const enrichedBookings = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const [userResult, packageResult] = await Promise.all([
            supabase.from('profiles').select('full_name, email').eq('id', booking.user_id).single(),
            supabase.from('tour_packages').select('name, price').eq('id', booking.package_id).single()
          ])
          
          return {
            ...booking,
            profiles: userResult.data || { full_name: 'Unknown', email: '' },
            tour_packages: packageResult.data || { name: 'Unknown', price: 0 }
          }
        })
      )
      
      setBookings(enrichedBookings)
      setRecentBookings(enrichedBookings.slice(0, 10))
    }

    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    }

    // Fetch reviews (without joins)
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('trip_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (reviewsError) {
      console.error('❌ Error fetching reviews:', reviewsError)
    } else {
      // Enrich reviews with user data
      const enrichedReviews = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const userResult = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', review.user_id)
            .single()
          
          return {
            ...review,
            profiles: userResult.data || { full_name: 'Anonymous', email: '' }
          }
        })
      )
      setRecentReviews(enrichedReviews)
    }

    // Fetch all packages
    const { data: packagesData, error: packagesError } = await supabase
      .from('tour_packages')
      .select('*')
      .order('created_at', { ascending: false })

    if (packagesError) {
      console.error('❌ Error fetching packages:', packagesError)
    }

    // Calculate revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('tour_bookings')
      .select('total_price')
      .eq('payment_status', 'paid')

    if (revenueError) {
      console.error('❌ Error fetching revenue:', revenueError)
    }

    const totalRevenue = revenueData?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0

    setStats({
      totalUsers: usersCount || 0,
      totalBookings: bookingsCount || 0,
      totalRevenue: totalRevenue,
      totalPackages: packagesCount || 0,
      pendingBookings: pendingCount || 0,
      totalReviews: reviewsCount || 0,
      activeUsers: Math.round((usersCount || 0) * 0.7),
      growthRate: 12.5
    })

    // Set remaining states
    setRecentUsers(usersData || [])
    setPackages(packagesData || [])
    setUsers(usersData || [])

    console.log('✅ Bookings set in state:', bookingsData?.length || 0)

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error)
    showNotificationMessage('Failed to load dashboard data', 'error')
  } finally {
    setLoading(false)
  }
}
  const showNotificationMessage = (message, type = 'success') => {
    setNotificationMessage({ text: message, type })
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 4000)
  }

  const resetPackageForm = () => {
    setEditingPackage(null)
    setPackageForm({
      name: '',
      description: '',
      price: '',
      duration_days: 1,
      max_guests: 1,
      includes: '',
      excludes: '',
      status: 'active',
      start_date: '',
      end_date: '',
      available_from: '',
      available_to: '',
      season: ''
    })
  }

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price || '',
      duration_days: pkg.duration_days || 1,
      max_guests: pkg.max_guests || 1,
      includes: Array.isArray(pkg.includes) ? pkg.includes.join(', ') : pkg.includes || '',
      excludes: Array.isArray(pkg.excludes) ? pkg.excludes.join(', ') : pkg.excludes || '',
      status: pkg.status || 'active',
      start_date: pkg.start_date || '',
      end_date: pkg.end_date || '',
      available_from: pkg.available_from || '',
      available_to: pkg.available_to || '',
      season: pkg.season || ''
    })
    setShowPackageForm(true)
  }

  const handlePackageSubmit = async (e) => {
    e.preventDefault()
    setPackageLoading(true)

    try {
      const payload = {
        name: packageForm.name,
        description: packageForm.description,
        price: parseFloat(packageForm.price) || 0,
        duration_days: parseInt(packageForm.duration_days, 10) || 1,
        max_guests: parseInt(packageForm.max_guests, 10) || 1,
        includes: packageForm.includes
          ? packageForm.includes.split(',').map(item => item.trim())
          : [],
        excludes: packageForm.excludes
          ? packageForm.excludes.split(',').map(item => item.trim())
          : [],
        status: 'active',
        start_date: packageForm.start_date || null,
        end_date: packageForm.end_date || null,
        available_from: packageForm.available_from || null,
        available_to: packageForm.available_to || null,
        season: packageForm.season || null,
        user_id: user?.id
      }

      let error
      if (editingPackage) {
        const { error: updateError } = await supabase
          .from('tour_packages')
          .update(payload)
          .eq('id', editingPackage.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('tour_packages')
          .insert([payload])
        error = insertError
      }

      if (error) {
        throw error
      }

      showNotificationMessage(editingPackage ? 'Package updated successfully' : 'Package added successfully')
      resetPackageForm()
      setShowPackageForm(false)
      fetchDashboardData()
    } catch (error) {
      console.error('Failed to save package:', error)
      showNotificationMessage('Failed to save package', 'error')
    } finally {
      setPackageLoading(false)
    }
  }

  const handleDeletePackage = async (id) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    try {
      const { error } = await supabase
        .from('tour_packages')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      showNotificationMessage('Package deleted successfully')
      fetchDashboardData()
    } catch (error) {
      showNotificationMessage('Failed to delete package', 'error')
    }
  }

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('tour_bookings')
        .update({ status })
        .eq('id', id)
      
      if (error) throw error
      showNotificationMessage(`Booking ${status} successfully`)
      fetchDashboardData()
    } catch (error) {
      showNotificationMessage('Failed to update booking', 'error')
    }
  }

  const exportData = () => {
    const data = {
      stats,
      bookings: recentBookings,
      users: recentUsers,
      packages,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wanderai-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showNotificationMessage('Data exported successfully')
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'inventory', label: 'Inventory', icon: BookOpen },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  // ============================================================
  // ADMIN ACCESS CHECK
  // ============================================================
  if (checkingAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: darkMode ? '#0f0f1a' : '#f5f3ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #E88D5C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>Verifying admin access...</p>
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
            onClick={() => window.location.href = '/'}
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
    )
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: darkMode ? '#0f0f1a' : '#f5f3ff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #E88D5C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: darkMode ? '#0f0f1a' : '#f5f3ff',
      color: darkMode ? '#e4e4e7' : '#1a1a2e'
    }}>
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          zIndex: 9999,
          background: notificationMessage.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${notificationMessage.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: notificationMessage.type === 'error' ? '#991b1b' : '#166534',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {notificationMessage.text}
        </div>
      )}

      <div style={{
        width: sidebarOpen ? '260px' : '70px',
        background: darkMode ? '#1a1a2e' : 'white',
        borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
        padding: '1.5rem 1rem',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          padding: '0 0.5rem'
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: darkMode ? '#a1a1aa' : '#6b7280',
              padding: '0.25rem'
            }}
          >
            <Menu size={24} />
          </button>
          {sidebarOpen && (
            <span style={{
              fontSize: '20px',
              fontWeight: '700',
              fontFamily: "'Playfair Display', serif",
              color: darkMode ? '#e4e4e7' : '#1a1a2e'
            }}>
              WanderAI
            </span>
          )}
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.25rem',
                  borderRadius: '10px',
                  background: isActive ? (darkMode ? 'rgba(232, 141, 92, 0.2)' : '#fef3e8') : 'transparent',
                  border: 'none',
                  color: isActive ? '#E88D5C' : (darkMode ? '#a1a1aa' : '#6b7280'),
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  fontSize: sidebarOpen ? '14px' : '0'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <Icon size={20} />
                {sidebarOpen && item.label}
              </button>
            )
          })}
        </nav>

        <div style={{ borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`, paddingTop: '1rem' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              justifyContent: sidebarOpen ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={20} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          padding: '1.5rem 2rem',
          background: darkMode ? '#1a1a2e' : 'white',
          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              fontFamily: "'Playfair Display', serif"
            }}>
              {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280', fontSize: '13px' }}>
              Welcome back, {user?.email || 'Admin'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={exportData}
              style={{
                padding: '0.5rem 1rem',
                background: darkMode ? '#2d2d44' : '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                color: darkMode ? '#e4e4e7' : '#1a1a2e',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '13px'
              }}
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={fetchDashboardData}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '13px'
              }}
            >
              <Activity size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {activeTab === 'overview' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#8B5CF6' },
                  { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: '#EC4899' },
                  { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#22c55e' },
                  { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: '#F59E0B' },
                  { label: 'Packages', value: stats.totalPackages, icon: Package, color: '#E88D5C' },
                  { label: 'Reviews', value: stats.totalReviews, icon: Star, color: '#F4C542' }
                ].map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={index}
                      style={{
                        background: darkMode ? '#1a1a2e' : 'white',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>{stat.label}</p>
                          <p style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</p>
                        </div>
                        <div style={{
                          padding: '0.5rem',
                          borderRadius: '12px',
                          background: `${stat.color}20`,
                          color: stat.color
                        }}>
                          <Icon size={20} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{
                  background: darkMode ? '#1a1a2e' : 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
                    Recent Bookings
                  </h3>
                  {recentBookings.length === 0 ? (
                    <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>No bookings yet</p>
                  ) : (
                    recentBookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        style={{
                          padding: '0.75rem 0',
                          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: '500' }}>
                            {booking.tour_packages?.name || 'Unknown Package'}
                          </p>
                          <p style={{ fontSize: '12px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                            {booking.profiles?.full_name || 'Unknown'} · {booking.guests} guests
                          </p>
                        </div>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '11px',
                          background: booking.status === 'confirmed' ? '#f0fdf4' : 
                                     booking.status === 'pending' ? '#fef3c7' : '#fef2f2',
                          color: booking.status === 'confirmed' ? '#22c55e' : 
                                 booking.status === 'pending' ? '#d97706' : '#ef4444'
                        }}>
                          {booking.status || 'pending'}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{
                  background: darkMode ? '#1a1a2e' : 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>
                    Recent Users
                  </h3>
                  {recentUsers.length === 0 ? (
                    <p style={{ color: darkMode ? '#a1a1aa' : '#6b7280' }}>No users yet</p>
                  ) : (
                    recentUsers.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        style={{
                          padding: '0.75rem 0',
                          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: '500' }}>{user.full_name || user.email}</p>
                          <p style={{ fontSize: '12px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                            {user.email} · {user.user_type || 'user'}
                          </p>
                        </div>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '11px',
                          background: user.user_type === 'admin' ? '#fef3c7' : '#e5e7eb',
                          color: user.user_type === 'admin' ? '#92400e' : '#6b7280'
                        }}>
                          {user.user_type || 'user'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>All Users ({users.length})</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                        borderRadius: '8px',
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
                        background: darkMode ? '#0f0f1a' : 'white',
                        color: darkMode ? '#e4e4e7' : '#1a1a2e',
                        width: '200px'
                      }}
                    />
                  </div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}` }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Joined</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => 
                    (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(26,43,60,0.04)'}` }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '0.75rem 0.5rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '11px',
                          background: u.user_type === 'admin' ? '#fef3c7' : '#e5e7eb',
                          color: u.user_type === 'admin' ? '#92400e' : '#6b7280'
                        }}>
                          {u.user_type || 'user'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                          onClick={() => {
                            if (confirm(`Delete user ${u.email}?`)) {
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                  No users found
                </p>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>All Bookings ({bookings.length})</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
                      background: darkMode ? '#0f0f1a' : 'white',
                      color: darkMode ? '#e4e4e7' : '#1a1a2e'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {bookings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: darkMode ? '#a1a1aa' : '#6b7280'
                }}>
                  <p style={{ fontSize: '16px' }}>📭 No bookings found</p>
                  <p style={{ fontSize: '13px', marginTop: '0.5rem' }}>Bookings will appear here once customers make reservations.</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}` }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Package</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>User</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Guests</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Amount</th>
                      <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings
                      .filter(b => selectedFilter === 'all' || b.status === selectedFilter)
                      .map((b) => (
                        <tr key={b.id} style={{ borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(26,43,60,0.04)'}` }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: '500' }}>
                            {b.tour_packages?.name || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                            {b.profiles?.full_name || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                            {new Date(b.booking_date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>{b.guests}</td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>
                            ${b.total_price?.toFixed(2) || '0.00'}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '12px',
                              fontSize: '11px',
                              background: b.status === 'confirmed' ? '#f0fdf4' : 
                                         b.status === 'pending' ? '#fef3c7' : '#fef2f2',
                              color: b.status === 'confirmed' ? '#22c55e' : 
                                     b.status === 'pending' ? '#d97706' : '#ef4444'
                            }}>
                              {b.status || 'pending'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                              <button
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: darkMode ? '#a1a1aa' : '#6b7280'
                                }}
                                onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                              >
                                <CheckCircle size={16} style={{ color: '#22c55e' }} />
                              </button>
                              <button
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: darkMode ? '#a1a1aa' : '#6b7280'
                                }}
                                onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              >
                                <XCircle size={16} style={{ color: '#ef4444' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'packages' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
              overflow: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>All Packages ({packages.length})</h3>
                <button
                  onClick={() => {
                    setShowPackageForm(!showPackageForm)
                    if (showPackageForm) {
                      resetPackageForm()
                      setEditingPackage(null)
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '13px'
                  }}
                >
                  <Plus size={18} />
                  {showPackageForm ? 'Cancel' : (editingPackage ? 'Edit Package' : 'Add Package')}
                </button>
              </div>

              {packages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: darkMode ? '#a1a1aa' : '#6b7280'
                }}>
                  <p style={{ fontSize: '16px' }}>📦 No packages found</p>
                  <p style={{ fontSize: '13px', marginTop: '0.5rem' }}>Create your first package to get started.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem'
                }}>
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
                        background: darkMode ? '#0f0f1a' : '#f9fafb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{pkg.name}</h4>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '10px',
                          background: pkg.status === 'active' ? '#f0fdf4' : '#fef2f2',
                          color: pkg.status === 'active' ? '#22c55e' : '#ef4444'
                        }}>
                          {pkg.status || 'active'}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#6b7280', margin: '0.5rem 0' }}>
                        {pkg.description || 'No description'}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '13px' }}>
                        <span>💰 ${pkg.price}</span>
                        <span>📅 {pkg.duration_days} days</span>
                        <span>👥 {pkg.max_guests} guests</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: darkMode ? '#2d2d44' : '#f3f4f6',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#fef2f2',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: '#ef4444',
                            fontSize: '12px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showPackageForm && (
                <div style={{
                  background: darkMode ? '#0f0f1a' : '#ffffff',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  marginTop: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>
                    {editingPackage ? 'Edit Package' : 'Add New Package'}
                  </h3>
                  <form onSubmit={handlePackageSubmit}>
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Name</label>
                        <input
                          type="text"
                          value={packageForm.name}
                          onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={packageForm.price}
                          onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Duration (days)</label>
                        <input
                          type="number"
                          value={packageForm.duration_days}
                          onChange={(e) => setPackageForm({ ...packageForm, duration_days: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Max Guests</label>
                        <input
                          type="number"
                          value={packageForm.max_guests}
                          onChange={(e) => setPackageForm({ ...packageForm, max_guests: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Status</label>
                        <select
                          value={packageForm.status}
                          onChange={(e) => setPackageForm({ ...packageForm, status: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Season</label>
                        <input
                          type="text"
                          value={packageForm.season}
                          onChange={(e) => setPackageForm({ ...packageForm, season: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Start Date</label>
                        <input
                          type="date"
                          value={packageForm.start_date}
                          onChange={(e) => setPackageForm({ ...packageForm, start_date: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>End Date</label>
                        <input
                          type="date"
                          value={packageForm.end_date}
                          onChange={(e) => setPackageForm({ ...packageForm, end_date: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Available From</label>
                        <input
                          type="date"
                          value={packageForm.available_from}
                          onChange={(e) => setPackageForm({ ...packageForm, available_from: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Available To</label>
                        <input
                          type="date"
                          value={packageForm.available_to}
                          onChange={(e) => setPackageForm({ ...packageForm, available_to: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Includes</label>
                        <input
                          type="text"
                          value={packageForm.includes}
                          onChange={(e) => setPackageForm({ ...packageForm, includes: e.target.value })}
                          placeholder="e.g. Breakfast, Guide"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Excludes</label>
                        <input
                          type="text"
                          value={packageForm.excludes}
                          onChange={(e) => setPackageForm({ ...packageForm, excludes: e.target.value })}
                          placeholder="e.g. Flights, Insurance"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>Description</label>
                        <textarea
                          value={packageForm.description}
                          onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                          rows="3"
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #d1d5db' }}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={packageLoading}
                      style={{
                        marginTop: '1rem',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #E88D5C, #D97A4A)',
                        color: 'white',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {packageLoading ? 'Saving...' : (editingPackage ? 'Update Package' : 'Create Package')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
              overflow: 'auto'
            }}>
              <Inventory user={user} />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{
              background: darkMode ? '#1a1a2e' : 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1rem' }}>
                Recent Reviews ({recentReviews.length})
              </h3>
              {recentReviews.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                  No reviews yet
                </p>
              ) : (
                recentReviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: '1rem',
                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '500' }}>{review.profiles?.full_name || 'Anonymous'}</span>
                        <span style={{ fontSize: '13px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ margin: '0.25rem 0' }}>
                        {'⭐'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                      </div>
                      <p style={{ fontSize: '14px' }}>{review.comment}</p>
                    </div>
                    <button
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: darkMode ? '#1a1a2e' : 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>Booking Trend</h3>
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <TrendingUp size={48} style={{ color: '#E88D5C' }} />
                  <p style={{ fontSize: '14px', color: darkMode ? '#a1a1aa' : '#6b7280', marginTop: '0.5rem' }}>
                    {stats.totalBookings} total bookings
                  </p>
                  <p style={{ fontSize: '13px', color: '#22c55e' }}>
                    ↑ {stats.growthRate}% growth rate
                  </p>
                </div>
              </div>

              <div style={{
                background: darkMode ? '#1a1a2e' : 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>Revenue Overview</h3>
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <DollarSign size={48} style={{ color: '#22c55e' }} />
                  <p style={{ fontSize: '24px', fontWeight: '700' }}>
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '14px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                    Total revenue generated
                  </p>
                </div>
              </div>

              <div style={{
                background: darkMode ? '#1a1a2e' : 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(26,43,60,0.06)'}`
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>User Engagement</h3>
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <Users size={48} style={{ color: '#8B5CF6' }} />
                  <p style={{ fontSize: '24px', fontWeight: '700' }}>
                    {stats.activeUsers}
                  </p>
                  <p style={{ fontSize: '14px', color: darkMode ? '#a1a1aa' : '#6b7280' }}>
                    Active users this month
                  </p>
                  <p style={{ fontSize: '13px', color: '#22c55e' }}>
                    {Math.round((stats.activeUsers / (stats.totalUsers || 1)) * 100)}% engagement rate
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard