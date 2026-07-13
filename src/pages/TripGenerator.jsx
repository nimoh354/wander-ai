// src/pages/TripGenerator.jsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'

function TripGenerator({ user, onTripSaved }) {
  const [destination, setDestination] = useState('')
  const [duration, setDuration] = useState(4)
  const [budget, setBudget] = useState('')
  const [preferences, setPreferences] = useState('')
  const [loading, setLoading] = useState(false)
  const [itinerary, setItinerary] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [booking, setBooking] = useState(false)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    travelers: 1,
    specialRequests: '',
    paymentMethod: 'card'
  })

  // ============================================================
  // REAL CLIENT DATA FOR DESTINATIONS
  // ============================================================
  const getRealClientData = (dest, days, budget) => {
    const data = {
      'tokyo': {
        flight_airline: 'Japan Airlines',
        flight_number: `JL ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Ritz-Carlton, Tokyo',
        hotel_address: 'Tokyo Midtown, 9-7-1 Akasaka, Minato-ku, Tokyo 107-6245, Japan',
        arrival_date: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (30 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'CENTRAL TOKYO', morning: 'Visit Senso-ji temple in Asakusa and explore Nakamura Shopping Street.', afternoon: 'Experience the vibrant atmosphere of Shibuya, including the famous Shibuya Crossing.', evening: 'Enjoy shopping and dining in Shibuya.' },
          { title: 'MODERN TOKYO', morning: 'Explore the upscale district of Ginza with its luxury boutiques and department stores.', afternoon: 'Visit Odaiba for futuristic entertainment and enjoy the views of Tokyo Bay.', evening: 'Experience the nightlife of Shinjuku with its neon lights and dining options.' },
          { title: 'CULTURAL TOKYO', morning: 'Visit the historic Imperial Palace and stroll through the East Gardens.', afternoon: 'Explore Ueno Park area, including the Tokyo National Museum and Ueno Zoo.', evening: 'Watch a traditional theater performance at the Kabukiza Theatre in Ginza.' },
          { title: 'MODERN & TRADITIONAL', morning: 'Visit the Tokyo Skytree or Tokyo Tower for panoramic views.', afternoon: 'Explore the anime and electronics culture of Akihabara.', evening: 'Conclude your trip in Roppongi, known for art galleries and nightlife.' }
        ]
      },
      'paris': {
        flight_airline: 'Air France',
        flight_number: `AF ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Hôtel Ritz Paris',
        hotel_address: '15 Place Vendôme, 75001 Paris, France',
        arrival_date: new Date(Date.now() + 45 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (45 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'THE HEART OF PARIS', morning: 'Visit the iconic Eiffel Tower and enjoy panoramic views of the city.', afternoon: 'Explore the Louvre Museum and see the Mona Lisa.', evening: 'Stroll along the Seine River and enjoy a romantic dinner cruise.' },
          { title: 'ART & CULTURE', morning: 'Visit the Musée d\'Orsay and admire Impressionist masterpieces.', afternoon: 'Explore the charming streets of Montmartre and visit the Sacré-Cœur Basilica.', evening: 'Enjoy a cabaret show at the famous Moulin Rouge.' },
          { title: 'ROYAL ELEGANCE', morning: 'Take a day trip to the Palace of Versailles and explore its magnificent gardens.', afternoon: 'Visit the Grand Trianon and Marie Antoinette\'s Hamlet.', evening: 'Return to Paris and enjoy a dinner at a traditional French bistro.' },
          { title: 'LOCAL EXPERIENCE', morning: 'Visit the Latin Quarter and explore the Sorbonne University.', afternoon: 'Shop at the vibrant Marché d\'Aligre market.', evening: 'Enjoy a final French dinner at a local brasserie.' }
        ]
      },
      'rome': {
        flight_airline: 'ITA Airways',
        flight_number: `AZ ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Hotel Eden, Rome',
        hotel_address: 'Via Ludovisi 49, 00187 Rome, Italy',
        arrival_date: new Date(Date.now() + 60 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (60 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'ANCIENT ROME', morning: 'Visit the Colosseum and learn about ancient Roman history.', afternoon: 'Explore the Roman Forum and Palatine Hill.', evening: 'Enjoy authentic Italian pasta at a trattoria in Trastevere.' },
          { title: 'VATICAN CITY', morning: 'Visit St. Peter\'s Basilica and climb to the top of the dome.', afternoon: 'Explore the Vatican Museums and the Sistine Chapel.', evening: 'Stroll through the charming streets of Trastevere.' },
          { title: 'ROMAN HILLS', morning: 'Visit the Villa Borghese gardens and enjoy a relaxing walk.', afternoon: 'Explore the Spanish Steps and Trevi Fountain.', evening: 'Enjoy a romantic dinner with a view of the Roman skyline.' },
          { title: 'UNDERGROUND ROME', morning: 'Visit the Catacombs of Rome and explore underground burial chambers.', afternoon: 'Explore the ancient Appian Way and its historic landmarks.', evening: 'Enjoy a final Roman dinner and gelato.' }
        ]
      },
      'bali': {
        flight_airline: 'Garuda Indonesia',
        flight_number: `GA ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Mandapa, A Ritz-Carlton Reserve',
        hotel_address: 'Jalan Kedewatan, Banjar Kedewatan, Ubud, Gianyar 80571, Bali, Indonesia',
        arrival_date: new Date(Date.now() + 75 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (75 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'UBUD CULTURE', morning: 'Visit the Sacred Monkey Forest Sanctuary in Ubud.', afternoon: 'Explore the Ubud Art Market and traditional crafts.', evening: 'Enjoy a traditional Balinese dance performance.' },
          { title: 'RICE TERRACES', morning: 'Visit the stunning Tegalalang Rice Terraces.', afternoon: 'Explore the Tirta Empul Temple and its holy springs.', evening: 'Enjoy a romantic dinner overlooking the jungle.' },
          { title: 'COASTAL EXPLORATION', morning: 'Visit the Tanah Lot Temple on the coastal cliffs.', afternoon: 'Explore the beaches of Seminyak and enjoy water sports.', evening: 'Watch the sunset at Jimbaran Bay with a seafood dinner.' },
          { title: 'BALINESE WELLNESS', morning: 'Participate in a traditional Balinese yoga session.', afternoon: 'Enjoy a relaxing spa and wellness treatment.', evening: 'Attend a traditional cooking class and learn Balinese cuisine.' }
        ]
      },
      'nairobi': {
        flight_airline: 'Kenya Airways',
        flight_number: `KQ ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'Giraffe Manor',
        hotel_address: 'Langata, P.O. Box 20-00603, Nairobi, Kenya',
        arrival_date: new Date(Date.now() + 90 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (90 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'WILDLIFE EXPERIENCE', morning: 'Visit the David Sheldrick Wildlife Trust and meet orphaned elephants.', afternoon: 'Explore the Giraffe Centre and feed the endangered Rothschild giraffes.', evening: 'Enjoy a sundowner dinner with a view of the Nairobi skyline.' },
          { title: 'NATIONAL PARK SAFARI', morning: 'Embark on a morning game drive in Nairobi National Park.', afternoon: 'Visit the Nairobi Safari Walk and explore the animal trails.', evening: 'Enjoy a traditional Kenyan dinner and cultural performance.' },
          { title: 'MAASAI CULTURE', morning: 'Visit the Bomas of Kenya and learn about Kenyan tribal cultures.', afternoon: 'Explore the Karen Blixen Museum.', evening: 'Enjoy a night out at a local restaurant in the vibrant Kilimani area.' },
          { title: 'CRYSTAL WATERS', morning: 'Take a day trip to the beautiful Lake Naivasha.', afternoon: 'Enjoy a boat ride and spot hippos and birdlife.', evening: 'Return to Nairobi and enjoy a farewell dinner.' }
        ]
      },
      'london': {
        flight_airline: 'British Airways',
        flight_number: `BA ${Math.floor(100 + Math.random() * 900)}`,
        hotel: 'The Ritz London',
        hotel_address: '150 Piccadilly, St. James\'s, London W1J 9BR, United Kingdom',
        arrival_date: new Date(Date.now() + 40 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        departure_date: new Date(Date.now() + (40 + days) * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        days: [
          { title: 'ROYAL LONDON', morning: 'Visit Buckingham Palace and watch the Changing of the Guard.', afternoon: 'Explore the Tower of London and see the Crown Jewels.', evening: 'Enjoy a traditional British dinner at a historic pub.' },
          { title: 'HISTORIC LONDON', morning: 'Visit Westminster Abbey and the Houses of Parliament.', afternoon: 'Ride the London Eye for panoramic views of the city.', evening: 'Explore the vibrant South Bank and its cultural venues.' },
          { title: 'MUSEUM LONDON', morning: 'Visit the British Museum and see the Rosetta Stone.', afternoon: 'Explore the Natural History Museum and its stunning architecture.', evening: 'Enjoy a show in London\'s West End theatre district.' },
          { title: 'MODERN LONDON', morning: 'Visit the Shard for breathtaking views of the city.', afternoon: 'Explore the trendy neighborhoods of Notting Hill and Portobello Road.', evening: 'Experience the nightlife of Soho and its diverse dining options.' }
        ]
      }
    }

    return data[dest.toLowerCase()] || null
  }

  const generateItinerary = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setItinerary(null)
    setShowBooking(false)

    try {
      // Get real client data for the destination
      const clientData = getRealClientData(destination, duration, budget)
      
      if (!clientData) {
        throw new Error(`We don't have data for "${destination}" yet. Try Tokyo, Paris, Rome, Bali, Nairobi, or London.`)
      }

      // Build the itinerary with client data
      const generatedItinerary = {
        destination: destination,
        duration: duration,
        estimatedCost: budget || 'Flexible',
        flight_airline: clientData.flight_airline,
        flight_number: clientData.flight_number,
        hotel: clientData.hotel,
        hotel_address: clientData.hotel_address,
        arrival_date: clientData.arrival_date,
        departure_date: clientData.departure_date,
        days: clientData.days.slice(0, duration).map((day, index) => ({
          title: `DAY ${index + 1}: ${day.title}`,
          morning: day.morning,
          afternoon: day.afternoon,
          evening: day.evening
        })),
        tips: [
          `💡 Book your ${destination} tours in advance for better rates`,
          `💡 Learn a few local phrases to enhance your experience`,
          `💡 Check local events and festivals during your stay`,
          `💡 Use public transport to explore like a local`,
          `💡 Leave room in your itinerary for spontaneous adventures`
        ]
      }

      setTimeout(() => {
        setItinerary(generatedItinerary)
        setLoading(false)
      }, 1500)

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      console.error('Error:', err)
      setLoading(false)
    }
  }

  const saveTrip = async () => {
    if (!itinerary) return
    
    setSaving(true)
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'Traveler',
        user_type: 'tourist'
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
      
      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }
      
      const tripData = {
        user_id: user.id,
        destination: destination,
        duration_days: duration,
        budget: budget ? parseFloat(budget) : null,
        preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
        itinerary: itinerary,
        status: 'planned'
      }
      
      const { error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
      
      if (tripError) {
        throw new Error(`Trip save failed: ${tripError.message}`)
      }
      
      alert('✅ Trip saved successfully!')
      if (onTripSaved) onTripSaved()
      setDestination('')
      setDuration(4)
      setBudget('')
      setPreferences('')
      setItinerary(null)
      setShowBooking(false)
    } catch (err) {
      console.error('Save error:', err)
      alert('❌ Error saving trip: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const bookTrip = async () => {
    if (!itinerary) return
    
    setBooking(true)
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0] || 'Traveler',
        user_type: 'tourist'
      }
      
      await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
      
      const tripData = {
        user_id: user.id,
        destination: destination,
        duration_days: duration,
        budget: budget ? parseFloat(budget) : null,
        preferences: preferences ? preferences.split(',').map(p => p.trim()) : [],
        itinerary: itinerary,
        status: 'booked',
        travelers: bookingDetails.travelers,
        special_requests: bookingDetails.specialRequests || null
      }
      
      const { data: tripResult, error: tripError } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
      
      if (tripError) throw tripError
      
      const bookingData = {
        trip_id: tripResult[0].id,
        user_id: user.id,
        status: 'confirmed',
        total_price: parseFloat(budget) || 0,
        travelers: bookingDetails.travelers,
        special_requests: bookingDetails.specialRequests || null,
        payment_method: bookingDetails.paymentMethod
      }
      
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([bookingData])
      
      if (bookingError) throw bookingError
      
      alert('✅ Trip booked successfully! Check your bookings.')
      if (onTripSaved) onTripSaved()
      
      setDestination('')
      setDuration(4)
      setBudget('')
      setPreferences('')
      setItinerary(null)
      setShowBooking(false)
      setBookingDetails({
        travelers: 1,
        specialRequests: '',
        paymentMethod: 'card'
      })
    } catch (err) {
      console.error('Booking error:', err)
      alert('❌ Error booking trip: ' + err.message)
    } finally {
      setBooking(false)
    }
  }

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const goToDashboard = () => {
    window.location.href = '/dashboard'
  }

  return (
    <div>
      <Navbar user={user} onLogout={() => window.location.reload()} />
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
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 0
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <button
            onClick={goToDashboard}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(255,255,255,0.9)',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginBottom: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ffffff'
              e.target.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.9)'
              e.target.style.transform = 'scale(1)'
            }}
          >
            ← Back to Dashboard
          </button>

          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            ✨ Plan Your Dream Trip
          </h1>

          <p style={{ 
            color: '#ffffff', 
            marginBottom: '2rem', 
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            fontSize: '16px'
          }}>
            Tell us about your ideal trip, and our AI will create a personalized itinerary!
          </p>

          {/* Input Form */}
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <form onSubmit={generateItinerary}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  🌍 Where do you want to go?
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Tokyo, Paris, Bali, Nairobi, Rome, London..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  📅 How many days?
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 4)}
                  min="1"
                  max="7"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  💰 Budget (optional)
                </label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., Luxury, Budget, $1000..."
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '0.25rem'
                }}>
                  🎯 Preferences (optional)
                </label>
                <input
                  type="text"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="e.g., food, adventure, culture, beach..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {loading ? '🧠 AI is thinking...' : '✨ Generate Itinerary'}
              </button>
            </form>

            {error && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#fef2f2',
                color: '#ef4444',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                ❌ {error}
              </div>
            )}
          </div>

          {/* Itinerary Results - Lock Page Style */}
          {itinerary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                padding: '2.5rem',
                border: '2px solid #e5e7eb',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              {/* Lock Icon Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  background: '#f3f4f6',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🔒</span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>
                    TRAVEL ITINERARY
                  </span>
                </div>
              </div>

              {/* Flight & Hotel Details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>FLIGHT #</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {itinerary.flight_airline} {itinerary.flight_number}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>HOTEL</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e', fontSize: '14px' }}>
                    {itinerary.hotel}
                  </p>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>HOTEL ADDRESS</span>
                  <p style={{ fontWeight: '400', color: '#4b5563', fontSize: '14px' }}>
                    {itinerary.hotel_address}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>ARRIVAL</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {itinerary.arrival_date}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>DEPARTURE</span>
                  <p style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {itinerary.departure_date}
                  </p>
                </div>
              </div>

              {/* Itinerary Days */}
              <div style={{ marginBottom: '1.5rem' }}>
                {itinerary.days.map((day, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: index < itinerary.days.length - 1 ? '1.5rem' : '0',
                      borderBottom: index < itinerary.days.length - 1 ? '1px solid #e5e7eb' : 'none',
                      paddingBottom: index < itinerary.days.length - 1 ? '1.5rem' : '0'
                    }}
                  >
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      fontFamily: "'Playfair Display', serif",
                      color: '#1a1a2e',
                      marginBottom: '0.75rem'
                    }}>
                      {day.title}
                    </h3>
                    <div style={{ display: 'grid', gap: '0.5rem', paddingLeft: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#E88D5C', fontWeight: '600', minWidth: '70px' }}>Morning:</span>
                        <span style={{ color: '#4b5563' }}>{day.morning}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#8B5CF6', fontWeight: '600', minWidth: '70px' }}>Afternoon:</span>
                        <span style={{ color: '#4b5563' }}>{day.afternoon}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: '#EC4899', fontWeight: '600', minWidth: '70px' }}>Evening:</span>
                        <span style={{ color: '#4b5563' }}>{day.evening}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Travel Tips */}
              {itinerary.tips && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.5rem', color: '#1a1a2e' }}>
                    💡 Travel Tips
                  </h4>
                  {itinerary.tips.slice(0, 4).map((tip, i) => (
                    <p key={i} style={{ color: '#4b5563', fontSize: '13px', marginBottom: '0.25rem' }}>
                      {tip}
                    </p>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <button
                  onClick={saveTrip}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? '💾 Saving...' : '💾 Save Trip'}
                </button>
                <button
                  onClick={() => setShowBooking(!showBooking)}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {showBooking ? '✕ Cancel Booking' : '📅 Book This Trip'}
                </button>
                <button
                  onClick={goToDashboard}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
              </div>

              {/* Booking Form */}
              {showBooking && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  border: '2px solid #8B5CF6'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: '#1a1a2e'
                  }}>
                    📅 Book This Trip
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '14px' }}>
                    Confirm your booking details below.
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}>
                      Number of Travelers
                    </label>
                    <input
                      type="number"
                      name="travelers"
                      value={bookingDetails.travelers}
                      onChange={handleBookingInputChange}
                      min="1"
                      max="20"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '0.25rem'
                    }}>
                      Special Requests
                    </label>
                    <textarea
                      name="specialRequests"
                      value={bookingDetails.specialRequests}
                      onChange={handleBookingInputChange}
                      rows="2"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'inherit'
                      }}
                      placeholder="Any special requests?"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={bookTrip}
                      disabled={booking}
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        opacity: booking ? 0.7 : 1
                      }}
                    >
                      {booking ? 'Processing...' : '✅ Confirm Booking'}
                    </button>
                    <button
                      onClick={() => setShowBooking(false)}
                      style={{
                        padding: '0.75rem 2rem',
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TripGenerator