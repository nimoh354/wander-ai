// src/components/AIChat.jsx
import React, { useState, useRef, useEffect } from 'react'

const bookingWebsites = {
  'flights': [
    { name: 'Skyscanner', url: 'https://www.skyscanner.com', description: 'Compare flight prices', icon: '✈️' },
    { name: 'Kayak', url: 'https://www.kayak.com', description: 'Flights, hotels & rental cars', icon: '🔍' },
    { name: 'Google Flights', url: 'https://www.google.com/flights', description: 'Search flights easily', icon: '🌐' },
    { name: 'Expedia', url: 'https://www.expedia.com', description: 'Flights & packages', icon: '🏢' },
    { name: 'Momondo', url: 'https://www.momondo.com', description: 'Find cheap flights', icon: '🌍' },
    { name: 'Kiwi', url: 'https://www.kiwi.com', description: 'Budget flights worldwide', icon: '🐦' },
    { name: 'JetBlue', url: 'https://www.jetblue.com', description: 'US & international flights', icon: '🔵' },
    { name: 'Delta', url: 'https://www.delta.com', description: 'Major US airline', icon: '🔺' },
    { name: 'Emirates', url: 'https://www.emirates.com', description: 'Luxury international flights', icon: '✨' },
    { name: 'Qatar Airways', url: 'https://www.qatarairways.com', description: 'Award-winning airline', icon: '🏆' },
  ],
  'hotels': [
    { name: 'Booking.com', url: 'https://www.booking.com', description: 'Best hotel deals worldwide', icon: '🏨' },
    { name: 'Airbnb', url: 'https://www.airbnb.com', description: 'Unique stays & homes', icon: '🏠' },
    { name: 'Hotels.com', url: 'https://www.hotels.com', description: 'Hotel bookings', icon: '🏩' },
    { name: 'Agoda', url: 'https://www.agoda.com', description: 'Hotels in Asia & beyond', icon: '🌏' },
    { name: 'Marriott', url: 'https://www.marriott.com', description: 'Luxury hotels worldwide', icon: '⭐' },
    { name: 'Hilton', url: 'https://www.hilton.com', description: 'Premium hotel stays', icon: '💎' },
    { name: 'Hostelworld', url: 'https://www.hostelworld.com', description: 'Budget hostels', icon: '🎒' },
    { name: 'VRBO', url: 'https://www.vrbo.com', description: 'Vacation rentals', icon: '🏖️' },
    { name: 'Trivago', url: 'https://www.trivago.com', description: 'Compare hotel prices', icon: '📊' },
    { name: 'Oyo Rooms', url: 'https://www.oyorooms.com', description: 'Budget hotels', icon: '🟢' },
  ],
  'activities': [
    { name: 'Viator', url: 'https://www.viator.com', description: 'Tours & activities', icon: '🎯' },
    { name: 'GetYourGuide', url: 'https://www.getyourguide.com', description: 'Book tours & experiences', icon: '🎫' },
    { name: 'Klook', url: 'https://www.klook.com', description: 'Activities & attractions', icon: '📱' },
    { name: 'TripAdvisor', url: 'https://www.tripadvisor.com', description: 'Reviews & attractions', icon: '📝' },
    { name: 'Airbnb Experiences', url: 'https://www.airbnb.com/experiences', description: 'Unique local experiences', icon: '🎨' },
    { name: 'Musement', url: 'https://www.musement.com', description: 'Tickets & tours', icon: '🎭' },
    { name: 'Tiqets', url: 'https://www.tiqets.com', description: 'Museum & attraction tickets', icon: '🏛️' },
  ],
  'packages': [
    { name: 'Expedia', url: 'https://www.expedia.com', description: 'Vacation packages', icon: '🌴' },
    { name: 'Travelocity', url: 'https://www.travelocity.com', description: 'Flight + hotel deals', icon: '🚗' },
    { name: 'CheapTickets', url: 'https://www.cheaptickets.com', description: 'Budget packages', icon: '💰' },
    { name: 'Costco Travel', url: 'https://www.costcotravel.com', description: 'Member deals', icon: '🛒' },
    { name: 'Priceline', url: 'https://www.priceline.com', description: 'Name your own price', icon: '🎰' },
    { name: 'Travelzoo', url: 'https://www.travelzoo.com', description: 'Deals & packages', icon: '🔥' },
  ],
  'general': [
    { name: 'TripAdvisor', url: 'https://www.tripadvisor.com', description: 'Read reviews & plan trips', icon: '📚' },
    { name: 'Lonely Planet', url: 'https://www.lonelyplanet.com', description: 'Travel guides & tips', icon: '📖' },
    { name: 'Culture Trip', url: 'https://theculturetrip.com', description: 'Local experiences', icon: '🎭' },
    { name: 'Travel + Leisure', url: 'https://www.travelandleisure.com', description: 'Inspiration & guides', icon: '✨' },
    { name: 'AFAR', url: 'https://www.afar.com', description: 'Immersive travel guides', icon: '🗺️' },
  ],
  'usa': [
    { name: 'Southwest Airlines', url: 'https://www.southwest.com', description: 'US domestic flights', icon: '🟦' },
    { name: 'Amtrak', url: 'https://www.amtrak.com', description: 'US train travel', icon: '🚆' },
    { name: 'Greyhound', url: 'https://www.greyhound.com', description: 'US bus travel', icon: '🚌' },
    { name: 'Hertz', url: 'https://www.hertz.com', description: 'Car rentals in USA', icon: '🚗' },
  ],
  'europe': [
    { name: 'Ryanair', url: 'https://www.ryanair.com', description: 'Budget European flights', icon: '🟡' },
    { name: 'EasyJet', url: 'https://www.easyjet.com', description: 'European budget airline', icon: '🟠' },
    { name: 'Eurostar', url: 'https://www.eurostar.com', description: 'European train travel', icon: '🚄' },
    { name: 'European Car Rental', url: 'https://www.europcar.com', description: 'Car rentals in Europe', icon: '🚙' },
  ],
  'asia': [
    { name: 'AirAsia', url: 'https://www.airasia.com', description: 'Budget Asian flights', icon: '🛩️' },
    { name: 'Scoot', url: 'https://www.flyscoot.com', description: 'Singapore budget airline', icon: '🟦' },
    { name: 'Jetstar Asia', url: 'https://www.jetstar.com', description: 'Asian budget flights', icon: '🟢' },
    { name: 'Agoda', url: 'https://www.agoda.com', description: 'Hotels in Asia', icon: '🌏' },
  ],
  'africa': [
    { name: 'Kenya Airways', url: 'https://www.kenya-airways.com', description: 'Fly to Africa', icon: '🦁' },
    { name: 'South African Airways', url: 'https://www.flysaa.com', description: 'South African flights', icon: '✈️' },
    { name: 'Ethiopian Airlines', url: 'https://www.ethiopianairlines.com', description: 'Ethiopian flights', icon: '🌍' },
    { name: 'Safari Booking', url: 'https://www.safaribookings.com', description: 'African safari tours', icon: '🐘' },
  ],
  'australia': [
    { name: 'Qantas', url: 'https://www.qantas.com', description: 'Australian national airline', icon: '🦘' },
    { name: 'Jetstar', url: 'https://www.jetstar.com', description: 'Australian budget airline', icon: '🟢' },
    { name: 'Virgin Australia', url: 'https://www.virginaustralia.com', description: 'Australian flights', icon: '🔴' },
    { name: 'Accommodation Australia', url: 'https://www.accommodation.com.au', description: 'Hotels in Australia', icon: '🏄' },
  ]
}

function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const extractDestination = (message) => {
    const words = message.split(' ')
    const destinations = []
    
    const patterns = [
      /\b(to|in|for|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
      /\b(?:flights?|hotels?|stay|tours?)\s+(?:to|in|for|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
      /\b(?:visit|trip|travel)\s+(?:to|in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g
    ]

    patterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(message)) !== null) {
        if (match[2]) destinations.push(match[2])
      }
    })

    if (destinations.length === 0) {
      const capitalWords = message.match(/\b[A-Z][a-z]{2,}\b/g)
      if (capitalWords) {
        const common = ['Paris', 'London', 'New York', 'Tokyo', 'Bali', 'Dubai', 'Singapore', 'Bangkok', 'Rome', 'Barcelona', 'Amsterdam', 'Prague', 'Vienna', 'Kyoto', 'Sydney', 'Melbourne', 'Cape Town', 'Nairobi', 'Marrakech', 'Istanbul', 'Lisbon', 'Berlin', 'Munich', 'Milan', 'Florence', 'Venice', 'Budapest', 'Edinburgh', 'Dublin', 'Rio', 'Cairo', 'Mumbai', 'Beijing', 'Shanghai', 'Hong Kong', 'Seoul', 'Manila', 'Jakarta', 'Hanoi', 'Siem Reap', 'Chiang Mai', 'Kuala Lumpur', 'Taipei']
        const found = capitalWords.filter(w => common.includes(w))
        if (found.length > 0) {
          destinations.push(found.join(' '))
        }
      }
    }

    return destinations.length > 0 ? destinations[0] : null
  }

  const detectRegion = (message) => {
    const lower = message.toLowerCase()
    if (lower.includes('usa') || lower.includes('america') || lower.includes('united states') || lower.includes('us')) return 'usa'
    if (lower.includes('europe') || lower.includes('european')) return 'europe'
    if (lower.includes('asia') || lower.includes('asian')) return 'asia'
    if (lower.includes('africa') || lower.includes('african')) return 'africa'
    if (lower.includes('australia') || lower.includes('australian')) return 'australia'
    return null
  }

  const generateMockResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase()
    let suggestions = []
    let responseText = ''
    let destination = extractDestination(userMessage) || 'your destination'
    let region = detectRegion(userMessage)

    if (lowerMsg.includes('flight') || lowerMsg.includes('fly') || lowerMsg.includes('plane') || lowerMsg.includes('airport') || lowerMsg.includes('airfare')) {
      suggestions = [...bookingWebsites.flights]
      if (region) suggestions = [...suggestions, ...bookingWebsites[region]]
      responseText = `✈️ Here are the best websites to book flights to ${destination}:`
    }
    else if (lowerMsg.includes('hotel') || lowerMsg.includes('stay') || lowerMsg.includes('accommodation') || lowerMsg.includes('hostel') || lowerMsg.includes('resort') || lowerMsg.includes('lodge')) {
      suggestions = [...bookingWebsites.hotels]
      if (region) suggestions = [...suggestions, ...bookingWebsites[region]]
      responseText = `🏨 Here are the best websites to book hotels and accommodations in ${destination}:`
    }
    else if (lowerMsg.includes('activity') || lowerMsg.includes('tour') || lowerMsg.includes('attraction') || lowerMsg.includes('thing to do') || lowerMsg.includes('sight') || lowerMsg.includes('experience')) {
      suggestions = bookingWebsites.activities
      responseText = `🎯 Here are the best websites to book tours and activities in ${destination}:`
    }
    else if (lowerMsg.includes('package') || lowerMsg.includes('deal') || lowerMsg.includes('all-inclusive') || lowerMsg.includes('vacation') || lowerMsg.includes('holiday')) {
      suggestions = bookingWebsites.packages
      responseText = `🌴 Here are the best websites for vacation packages and deals to ${destination}:`
    }
    else if (lowerMsg.includes('car') || lowerMsg.includes('rental') || lowerMsg.includes('drive') || lowerMsg.includes('rent a car')) {
      suggestions = [
        { name: 'Hertz', url: 'https://www.hertz.com', description: 'Car rentals worldwide', icon: '🚗' },
        { name: 'Enterprise', url: 'https://www.enterprise.com', description: 'Car rentals', icon: '🚙' },
        { name: 'Avis', url: 'https://www.avis.com', description: 'Car rentals', icon: '🚘' },
        { name: 'Budget', url: 'https://www.budget.com', description: 'Budget car rentals', icon: '💰' },
        { name: 'Sixt', url: 'https://www.sixt.com', description: 'Luxury car rentals', icon: '🏎️' },
      ]
      responseText = `🚗 Here are the best websites for car rentals in ${destination}:`
    }
    else {
      suggestions = bookingWebsites.general
      responseText = `🌍 Here are some general travel resources to help you plan your trip to ${destination}:`
    }

    const uniqueSuggestions = suggestions.filter((site, index, self) => 
      index === self.findIndex(s => s.name === site.name)
    )

    return { text: responseText, suggestions: uniqueSuggestions }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    await new Promise(resolve => setTimeout(resolve, 600))

    const { text, suggestions } = generateMockResponse(userMessage)

    const aiMessage = {
      role: 'assistant',
      content: text,
      suggestions: suggestions
    }

    setMessages(prev => [...prev, aiMessage])
    setLoading(false)
  }

  const formatSuggestions = (suggestions) => {
    if (!suggestions || suggestions.length === 0) return []
    return suggestions.slice(0, 8)
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      maxHeight: '80vh',
      background: '#0a1628', // Navy blue background
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header - Navy Theme */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0d1b33',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🌍
          </div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#e8edf5',
              margin: 0,
              lineHeight: '1.2'
            }}>
              Travel Assistant
            </h3>
            <p style={{
              fontSize: '12px',
              color: '#7a8ba8',
              margin: '0.25rem 0 0 0'
            }}>
              Powered by AI • Real-time recommendations
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '12px',
            color: '#34d399',
            background: 'rgba(52, 211, 153, 0.12)',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            border: '1px solid rgba(52, 211, 153, 0.15)'
          }}>
            <span style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              background: '#34d399',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            Online
          </span>
        </div>
      </div>

      {/* Messages - Navy Theme */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        background: '#0a1628'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '1.5rem'
            }}>
              🗺️
            </div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#e8edf5',
              margin: '0 0 0.5rem 0'
            }}>
              How can I help you travel?
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#7a8ba8',
              maxWidth: '400px',
              margin: '0 0 1.5rem 0',
              lineHeight: '1.6'
            }}>
              Ask me anything about your trip - flights, hotels, activities, car rentals, and more!
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              {[
                '✈️ Flights to Japan',
                '🏨 Hotels in Paris',
                '🎯 Things to do in Bali',
                '🚗 Car rental in Italy'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(example.replace('✈️ ', '').replace('🏨 ', '').replace('🎯 ', '').replace('🚗 ', ''))
                    setTimeout(() => {
                      const fakeEvent = { preventDefault: () => {} }
                      handleSend(fakeEvent)
                    }, 100)
                  }}
                  style={{
                    padding: '0.6rem 1rem',
                    background: '#0d1b33',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#c8d2e0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#4F46E5'
                    e.target.style.background = 'rgba(79, 70, 229, 0.15)'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.background = '#0d1b33'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} style={{
              marginBottom: '1.5rem'
            }}>
              {msg.role === 'user' ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    maxWidth: '85%',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '18px 18px 4px 18px',
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    color: 'white',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      minWidth: '32px',
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      marginTop: '0.1rem'
                    }}>
                      🌍
                    </div>
                    <div style={{
                      maxWidth: '85%'
                    }}>
                      <div style={{
                        padding: '0.85rem 1.25rem',
                        borderRadius: '18px 18px 18px 4px',
                        background: '#0d1b33',
                        color: '#e8edf5',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}>
                        {msg.content}
                      </div>

                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div style={{
                          marginTop: '0.75rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                          gap: '0.5rem'
                        }}>
                          {formatSuggestions(msg.suggestions).map((site, i) => (
                            <a
                              key={i}
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.6rem 1rem',
                                background: '#0d1b33',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '12px',
                                color: '#c8d2e0',
                                textDecoration: 'none',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.borderColor = '#4F46E5'
                                e.target.style.background = 'rgba(79, 70, 229, 0.12)'
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.15)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.borderColor = 'rgba(255,255,255,0.06)'
                                e.target.style.background = '#0d1b33'
                                e.target.style.transform = 'translateY(0)'
                                e.target.style.boxShadow = 'none'
                              }}
                            >
                              <span style={{ fontSize: '16px' }}>{site.icon || '🔗'}</span>
                              <span>{site.name}</span>
                              <span style={{ 
                                marginLeft: 'auto', 
                                fontSize: '12px', 
                                color: '#8B5CF6',
                                fontWeight: '600'
                              }}>
                                ↗
                              </span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              minWidth: '32px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🌍
            </div>
            <div style={{
              padding: '0.85rem 1.25rem',
              background: '#0d1b33',
              borderRadius: '18px 18px 18px 4px',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              gap: '0.25rem'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                background: '#4F46E5',
                borderRadius: '50%',
                animation: 'typing 1.4s infinite'
              }} />
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                background: '#4F46E5',
                borderRadius: '50%',
                animation: 'typing 1.4s infinite 0.2s'
              }} />
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                background: '#4F46E5',
                borderRadius: '50%',
                animation: 'typing 1.4s infinite 0.4s'
              }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Navy Theme */}
      <form onSubmit={handleSend} style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: '#0d1b33',
        display: 'flex',
        gap: '0.75rem'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your trip..."
          style={{
            flex: 1,
            padding: '0.75rem 1.25rem',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            background: '#0a1628',
            color: '#e8edf5'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#4F46E5'
            e.target.style.background = '#0d1b33'
            e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)'
            e.target.style.background = '#0a1628'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0.75rem 1.75rem',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            opacity: loading || !input.trim() ? 0.5 : 1,
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
          }}
          onMouseEnter={(e) => {
            if (!loading && input.trim()) {
              e.target.style.transform = 'scale(1.02)'
              e.target.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.35)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.25)'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Thinking</span>
              <span style={{ fontSize: '12px' }}>⏳</span>
            </span>
          ) : (
            'Send →'
          )}
        </button>
      </form>

      {/* Animations */}
      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #0a1628;
        }
        ::-webkit-scrollbar-thumb {
          background: #1a2d4a;
          border-radius: 8px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2a3d5a;
        }
      `}</style>
    </div>
  )
}

export default AIChat