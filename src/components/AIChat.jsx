// src/components/AIChat.jsx
import React, { useState, useRef, useEffect } from 'react'
import { travelAgents } from '../data/travelAgents'

const bookingWebsites = {
  flights: [
    { name: 'Skyscanner', url: 'https://www.skyscanner.com', description: 'Compare flight prices', icon: '✈️' },
    { name: 'Kayak', url: 'https://www.kayak.com', description: 'Flights, hotels & rental cars', icon: '🔍' },
    { name: 'Google Flights', url: 'https://www.google.com/flights', description: 'Search flights easily', icon: '🌐' },
    { name: 'Expedia', url: 'https://www.expedia.com', description: 'Flights & packages', icon: '🏢' },
    { name: 'Momondo', url: 'https://www.momondo.com', description: 'Find cheap flights', icon: '🌍' },
    { name: 'Kiwi', url: 'https://www.kiwi.com', description: 'Budget flights worldwide', icon: '🐦' },
  ],
  hotels: [
    { name: 'Booking.com', url: 'https://www.booking.com', description: 'Best hotel deals worldwide', icon: '🏨' },
    { name: 'Airbnb', url: 'https://www.airbnb.com', description: 'Unique stays & homes', icon: '🏠' },
    { name: 'Hotels.com', url: 'https://www.hotels.com', description: 'Hotel bookings', icon: '🏩' },
    { name: 'Agoda', url: 'https://www.agoda.com', description: 'Hotels in Asia & beyond', icon: '🌏' },
    { name: 'Marriott', url: 'https://www.marriott.com', description: 'Luxury hotels worldwide', icon: '⭐' },
    { name: 'Hilton', url: 'https://www.hilton.com', description: 'Premium hotel stays', icon: '💎' },
  ],
  activities: [
    { name: 'Viator', url: 'https://www.viator.com', description: 'Tours & activities', icon: '🎯' },
    { name: 'GetYourGuide', url: 'https://www.getyourguide.com', description: 'Book tours & experiences', icon: '🎫' },
    { name: 'Klook', url: 'https://www.klook.com', description: 'Activities & attractions', icon: '📱' },
    { name: 'TripAdvisor', url: 'https://www.tripadvisor.com', description: 'Reviews & attractions', icon: '📝' },
    { name: 'Airbnb Experiences', url: 'https://www.airbnb.com/experiences', description: 'Unique local experiences', icon: '🎨' },
    { name: 'Musement', url: 'https://www.musement.com', description: 'Tickets & tours', icon: '🎭' },
  ],
  packages: [
    { name: 'Expedia', url: 'https://www.expedia.com', description: 'Vacation packages', icon: '🌴' },
    { name: 'Travelocity', url: 'https://www.travelocity.com', description: 'Flight + hotel deals', icon: '🚗' },
    { name: 'CheapTickets', url: 'https://www.cheaptickets.com', description: 'Budget packages', icon: '💰' },
    { name: 'Costco Travel', url: 'https://www.costcotravel.com', description: 'Member deals', icon: '🛒' },
    { name: 'Priceline', url: 'https://www.priceline.com', description: 'Name your own price', icon: '🎰' },
    { name: 'Travelzoo', url: 'https://www.travelzoo.com', description: 'Deals & packages', icon: '🔥' },
  ],
  general: [
    { name: 'TripAdvisor', url: 'https://www.tripadvisor.com', description: 'Read reviews & plan trips', icon: '📚' },
    { name: 'Lonely Planet', url: 'https://www.lonelyplanet.com', description: 'Travel guides & tips', icon: '📖' },
    { name: 'Culture Trip', url: 'https://theculturetrip.com', description: 'Local experiences', icon: '🎭' },
    { name: 'Travel + Leisure', url: 'https://www.travelandleisure.com', description: 'Inspiration & guides', icon: '✨' },
    { name: 'AFAR', url: 'https://www.afar.com', description: 'Immersive travel guides', icon: '🗺️' },
  ],
  usa: [
    { name: 'Southwest Airlines', url: 'https://www.southwest.com', description: 'US domestic flights', icon: '🟦' },
    { name: 'Amtrak', url: 'https://www.amtrak.com', description: 'US train travel', icon: '🚆' },
    { name: 'Greyhound', url: 'https://www.greyhound.com', description: 'US bus travel', icon: '🚌' },
    { name: 'Hertz', url: 'https://www.hertz.com', description: 'Car rentals in USA', icon: '🚗' },
  ],
  europe: [
    { name: 'Ryanair', url: 'https://www.ryanair.com', description: 'Budget European flights', icon: '🟡' },
    { name: 'EasyJet', url: 'https://www.easyjet.com', description: 'European budget airline', icon: '🟠' },
    { name: 'Eurostar', url: 'https://www.eurostar.com', description: 'European train travel', icon: '🚄' },
    { name: 'European Car Rental', url: 'https://www.europcar.com', description: 'Car rentals in Europe', icon: '🚙' },
  ],
  asia: [
    { name: 'AirAsia', url: 'https://www.airasia.com', description: 'Budget Asian flights', icon: '🛩️' },
    { name: 'Scoot', url: 'https://www.flyscoot.com', description: 'Singapore budget airline', icon: '🟦' },
    { name: 'Jetstar Asia', url: 'https://www.jetstar.com', description: 'Asian budget flights', icon: '🟢' },
    { name: 'Agoda', url: 'https://www.agoda.com', description: 'Hotels in Asia', icon: '🌏' },
  ],
  africa: [
    { name: 'Kenya Airways', url: 'https://www.kenya-airways.com', description: 'Fly to Africa', icon: '🦁' },
    { name: 'South African Airways', url: 'https://www.flysaa.com', description: 'South African flights', icon: '✈️' },
    { name: 'Ethiopian Airlines', url: 'https://www.ethiopianairlines.com', description: 'Ethiopian flights', icon: '🌍' },
    { name: 'Safari Booking', url: 'https://www.safaribookings.com', description: 'African safari tours', icon: '🐘' },
  ],
  australia: [
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

    // GREETINGS
    if (lowerMsg.match(/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|yo|hey there|hello there)/)) {
      return {
        text: "Hello there! I'm your travel assistant. I can help you with flights, hotels, activities, car rentals, and more! What are you planning for your trip?",
        suggestions: [
          { name: 'Plan a Trip', url: '#', description: 'Let me help you plan', icon: '🗺️' },
          { name: 'Find Flights', url: '#', description: 'Search for flights', icon: '✈️' },
          { name: 'Book Hotels', url: '#', description: 'Find accommodations', icon: '🏨' }
        ]
      }
    }

    // HOW ARE YOU
    if (lowerMsg.includes('how are you') || lowerMsg.includes('how are you doing') || lowerMsg.includes('how you doing') || lowerMsg.includes('how do you do')) {
      return {
        text: "I'm doing great, thank you for asking! I'm here 24/7 to help you plan your perfect trip. What can I assist you with today?",
        suggestions: [
          { name: 'Plan a Trip', url: '#', description: 'Start planning', icon: '🗺️' },
          { name: 'Get Advice', url: '#', description: 'Travel tips', icon: '💡' }
        ]
      }
    }

    // WHAT CAN YOU DO / HELP
    if (lowerMsg.includes('what can you do') || lowerMsg.includes('how can you help') || lowerMsg.includes('what do you do') || lowerMsg.includes('help me')) {
      return {
        text: "I can help you with:\n\nFind flights - Best prices and routes\nBook hotels - Accommodations worldwide\nActivities and tours - Things to do\nCar rentals - Transportation options\nTravel advice - Tips and recommendations\nItinerary planning - Help with your schedule\n\nJust tell me what you need and I will point you in the right direction!",
        suggestions: [
          { name: 'Flights', url: '#', description: 'Find flights', icon: '✈️' },
          { name: 'Hotels', url: '#', description: 'Book hotels', icon: '🏨' },
          { name: 'Activities', url: '#', description: 'Things to do', icon: '🎯' },
          { name: 'Car Rental', url: '#', description: 'Car rentals', icon: '🚗' }
        ]
      }
    }

    // WHERE SHOULD I GO
    if (lowerMsg.includes('where should i go') || lowerMsg.includes('best destination') || lowerMsg.includes('where to go') || lowerMsg.includes('recommend a destination') || lowerMsg.includes('suggest a place')) {
      return {
        text: "There are so many amazing places to visit! Here are some popular destinations:\n\nParis, France - Romance, art, and food\nBali, Indonesia - Beaches and culture\nNairobi, Kenya - Safari and wildlife\nTokyo, Japan - Modern and traditional\nSwitzerland - Mountains and lakes\n\nWhat kind of trip are you looking for? (beach, safari, city, nature)",
        suggestions: [
          { name: 'Paris', url: 'https://www.parisinfo.com', description: 'Visit Paris', icon: '🗼' },
          { name: 'Bali', url: 'https://www.bali.com', description: 'Visit Bali', icon: '🏝️' },
          { name: 'Nairobi', url: 'https://www.magicalkenya.com', description: 'Visit Nairobi', icon: '🦁' },
          { name: 'Tokyo', url: 'https://www.gotokyo.org', description: 'Visit Tokyo', icon: '🌅' }
        ]
      }
    }

    // WEATHER
    if (lowerMsg.includes('weather') || lowerMsg.includes('temperature') || lowerMsg.includes('climate') || lowerMsg.includes('rain') || lowerMsg.includes('sunny') || lowerMsg.includes('cold') || lowerMsg.includes('hot') || lowerMsg.includes('what is the weather')) {
      return {
        text: "I don't have live weather data, but I recommend checking these reliable weather services:\n\nWeather.com - Detailed forecasts\nAccuWeather - Hourly updates\nYour local weather app - For the most accurate info\n\nAlways check the weather a few days before your trip so you can pack appropriately!",
        suggestions: [
          { name: 'Weather.com', url: 'https://weather.com', description: 'Check weather', icon: '🌤️' },
          { name: 'AccuWeather', url: 'https://www.accuweather.com', description: 'Detailed forecast', icon: '📊' },
          { name: 'Packing Tips', url: '#', description: 'What to pack', icon: '🧳' }
        ]
      }
    }

    // PACKING
    if (lowerMsg.includes('pack') || lowerMsg.includes('what to bring') || lowerMsg.includes('luggage') || lowerMsg.includes('suitcase') || lowerMsg.includes('what should i take') || lowerMsg.includes('what should i bring')) {
      return {
        text: "Here are some essential packing tips:\n\nDocuments: Passport, visa, tickets, insurance\nClothing: Weather-appropriate outfits\nElectronics: Phone, charger, adapter\nToiletries: Travel-size essentials\nMedications: Any prescription drugs\nComfort items: Travel pillow, earplugs\n\nPro tip: Always pack a change of clothes in your carry-on in case your luggage gets delayed!",
        suggestions: [
          { name: 'Packing List', url: '#', description: 'Printable checklist', icon: '📋' },
          { name: 'Travel Adapter', url: 'https://www.amazon.com', description: 'Buy adapters', icon: '🔌' },
          { name: 'Travel Insurance', url: '#', description: 'Protect your trip', icon: '🛡️' }
        ]
      }
    }

    // BUDGET
    if (lowerMsg.includes('budget') || lowerMsg.includes('cost') || lowerMsg.includes('expensive') || lowerMsg.includes('cheap') || lowerMsg.includes('how much') || lowerMsg.includes('afford') || lowerMsg.includes('price range')) {
      return {
        text: "Travel costs vary a lot depending on your destination and preferences. Here's a rough guide:\n\nFlights: $500-$1500 (round trip)\nAccommodation: $50-$500/night\nFood: $20-$100/day\nActivities: $20-$200/day\n\nTips to save money:\nBook flights 2-3 months ahead\nStay in hostels or Airbnbs\nEat like a local\nUse public transport\n\nWhat's your budget? I can give more specific advice!",
        suggestions: [
          { name: 'Budget Calculator', url: '#', description: 'Plan your budget', icon: '💰' },
          { name: 'Cheap Flights', url: 'https://www.skyscanner.com', description: 'Find deals', icon: '✈️' },
          { name: 'Budget Stays', url: 'https://www.hostelworld.com', description: 'Hostels and budget', icon: '🎒' }
        ]
      }
    }

    // VISA
    if (lowerMsg.includes('visa') || lowerMsg.includes('passport') || lowerMsg.includes('document') || lowerMsg.includes('entry requirements') || lowerMsg.includes('travel requirements')) {
      return {
        text: "Visa requirements depend on your nationality.\n\nWhat to check:\nDoes your passport have 6+ months validity?\nDo you need a visa? Check the embassy website\nAny health requirements? (vaccinations)\n\nPro tip: Always check the official embassy website for your destination. Requirements change frequently!\n\nWould you like me to help you find more specific information?",
        suggestions: [
          { name: 'Official Embassy', url: '#', description: 'Check requirements', icon: '🏛️' },
          { name: 'iVisa', url: 'https://www.ivisa.com', description: 'Visa services', icon: '🛂' },
          { name: 'Passport Renewal', url: '#', description: 'Renew your passport', icon: '📕' }
        ]
      }
    }

    // SAFETY
    if (lowerMsg.includes('safe') || lowerMsg.includes('danger') || lowerMsg.includes('risk') || lowerMsg.includes('security') || lowerMsg.includes('is it safe') || lowerMsg.includes('travel advisory')) {
      return {
        text: "Safety is important! Here are some general travel safety tips:\n\nBefore you go:\nCheck travel advisories\nShare your itinerary with someone\nGet travel insurance\n\nDuring your trip:\nKeep valuables secure\nStay aware of your surroundings\nUse reputable transport\nKeep emergency numbers handy\n\nThe US State Department and UK Foreign Office have up-to-date travel advisories. Always check before you go!",
        suggestions: [
          { name: 'Travel Advisory', url: 'https://travel.state.gov', description: 'US State Dept', icon: '🛡️' },
          { name: 'Travel Insurance', url: '#', description: 'Get covered', icon: '📋' },
          { name: 'Emergency Numbers', url: '#', description: 'Global contacts', icon: '📞' }
        ]
      }
    }

    // BEST TIME TO VISIT
    if (lowerMsg.includes('best time to visit') || lowerMsg.includes('when to go') || lowerMsg.includes('best season') || lowerMsg.includes('peak season') || lowerMsg.includes('off season')) {
      return {
        text: "The best time to visit depends on what you want to experience!\n\nPeak Season: More crowds, higher prices, but great weather\nOff Season: Lower prices, fewer tourists, but possible rain\nShoulder Season: Best of both worlds - good weather, fewer crowds\n\nFor most destinations, consider visiting during shoulder season (just before or after peak) for the best value!\n\nWhat are your travel dates? I can help you plan!",
        suggestions: [
          { name: 'Check Weather', url: '#', description: 'Weather by month', icon: '🌤️' },
          { name: 'Flight Deals', url: 'https://www.skyscanner.com', description: 'Find cheap flights', icon: '✈️' },
          { name: 'Calendar', url: '#', description: 'Plan your dates', icon: '📅' }
        ]
      }
    }

    // THANK YOU
    if (lowerMsg.includes('thank you') || lowerMsg.includes('thanks') || lowerMsg.includes('thankyou') || lowerMsg.includes('thx') || lowerMsg.includes('appreciate')) {
      return {
        text: "You're welcome! I'm always here to help. If you need anything else for your trip, just let me know! Safe travels and have an amazing adventure!",
        suggestions: [
          { name: 'Plan Next Trip', url: '#', description: 'Start planning', icon: '🗺️' },
          { name: 'Quick Tips', url: '#', description: 'Travel advice', icon: '💡' }
        ]
      }
    }

    // GOODBYE
    if (lowerMsg.includes('bye') || lowerMsg.includes('goodbye') || lowerMsg.includes('see you') || lowerMsg.includes('talk to you later') || lowerMsg.includes('cya') || lowerMsg.includes('farewell')) {
      return {
        text: "Goodbye! It was great helping you. Remember, I'm always here when you need travel advice. Have a wonderful trip and enjoy every moment!",
        suggestions: []
      }
    }

    // FLIGHT RELATED
    if (lowerMsg.includes('flight') || lowerMsg.includes('fly') || lowerMsg.includes('plane') || lowerMsg.includes('airport') || lowerMsg.includes('airfare')) {
      suggestions = [...bookingWebsites.flights]
      if (region) suggestions = [...suggestions, ...bookingWebsites[region]]
      responseText = "Finding flights to your destination? I've got you covered! Here are the best websites to compare prices and book your flight:\n\nPro tip: Book 2-3 months ahead for the best deals, and try flying mid-week (Tuesday/Wednesday) for cheaper fares!"
    }
    // HOTEL RELATED
    else if (lowerMsg.includes('hotel') || lowerMsg.includes('stay') || lowerMsg.includes('accommodation') || lowerMsg.includes('hostel') || lowerMsg.includes('resort') || lowerMsg.includes('lodge')) {
      suggestions = [...bookingWebsites.hotels]
      if (region) suggestions = [...suggestions, ...bookingWebsites[region]]
      responseText = "Looking for the perfect place to stay? Here are the best booking websites to find hotels, resorts, and unique accommodations:\n\nPro tip: Read recent reviews and check the cancellation policy before booking!"
    }
    // ACTIVITIES
    else if (lowerMsg.includes('activity') || lowerMsg.includes('tour') || lowerMsg.includes('attraction') || lowerMsg.includes('thing to do') || lowerMsg.includes('sight') || lowerMsg.includes('experience')) {
      suggestions = bookingWebsites.activities
      responseText = "There are amazing things to do! Here are the best websites to book tours, activities, and experiences:\n\nPro tip: Book popular tours in advance, especially during peak season!"
    }
    // CAR RENTAL
    else if (lowerMsg.includes('car') || lowerMsg.includes('rental') || lowerMsg.includes('drive') || lowerMsg.includes('rent a car') || lowerMsg.includes('transport')) {
      suggestions = [
        { name: 'Hertz', url: 'https://www.hertz.com', description: 'Car rentals worldwide', icon: '🚗' },
        { name: 'Enterprise', url: 'https://www.enterprise.com', description: 'Car rentals', icon: '🚙' },
        { name: 'Avis', url: 'https://www.avis.com', description: 'Car rentals', icon: '🚘' },
        { name: 'Budget', url: 'https://www.budget.com', description: 'Budget car rentals', icon: '💰' },
        { name: 'Sixt', url: 'https://www.sixt.com', description: 'Luxury car rentals', icon: '🏎️' },
      ]
      responseText = "Renting a car? Here are the best car rental companies to get you on the road:\n\nPro tip: Compare prices across sites and book early for the best deals!"
    }
    // GENERAL
    else {
      suggestions = bookingWebsites.general
      responseText = "Great question! Here are some general travel resources to help you plan your trip:\n\nTip: Let me know if you need help with flights, hotels, activities, or anything specific!"
    }

    const uniqueSuggestions = suggestions.filter((site, index, self) => 
      index === self.findIndex(s => s.name === site.name)
    )

    return { 
      text: responseText, 
      suggestions: uniqueSuggestions.slice(0, 6),
    }
  }

  const findAgents = (category) => {
    if (category === 'flights') return travelAgents.flights || []
    if (category === 'hotels') return travelAgents.hotels || []
    if (category === 'activities') return travelAgents.activities || []
    if (category === 'packages') return travelAgents.packages || []
    return travelAgents.general || []
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
    const destination = extractDestination(userMessage) || 'your destination'
    
    let category = 'general'
    const lowerMsg = userMessage.toLowerCase()
    if (lowerMsg.includes('flight') || lowerMsg.includes('fly') || lowerMsg.includes('plane')) category = 'flights'
    else if (lowerMsg.includes('hotel') || lowerMsg.includes('stay') || lowerMsg.includes('accommodation')) category = 'hotels'
    else if (lowerMsg.includes('activity') || lowerMsg.includes('tour') || lowerMsg.includes('attraction')) category = 'activities'
    else if (lowerMsg.includes('package') || lowerMsg.includes('deal') || lowerMsg.includes('vacation')) category = 'packages'
    
    const agents = findAgents(category)

    const aiMessage = {
      role: 'assistant',
      content: text,
      suggestions: suggestions || [],
      agents: agents.slice(0, 3),
    }

    setMessages(prev => [...prev, aiMessage])
    setLoading(false)
  }

  const connectWithAgent = (agent) => {
    const message = `Hi! I'm interested in getting help with my travel plans. Can you assist me?\n\n- Agent: ${agent.name} (${agent.title})\n- Email: ${agent.email}\n- Phone: ${agent.phone}\n- Specialty: ${agent.specialty}`
    
    navigator.clipboard.writeText(message).then(() => {
      alert(`Agent contact info copied!\n\nAgent: ${agent.name}\nEmail: ${agent.email}\nPhone: ${agent.phone}\n\nYou can now email or call them directly.`)
    }).catch(() => {
      alert(`Contact ${agent.name}\nEmail: ${agent.email}\nPhone: ${agent.phone}\n\nSpecialty: ${agent.specialty}`)
    })
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      maxHeight: '80vh',
      background: '#0a1628',
      borderRadius: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.06)',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
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

      {/* Messages */}
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
              <br />
              <span style={{ color: '#34d399', fontSize: '13px' }}>
                Connect with real travel agents for personalized help
              </span>
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              {[
                'Flights to Japan',
                'Hotels in Paris',
                'Things to do in Bali',
                'Car rental in Italy',
                'Hey there!',
                'Help me plan'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(example)
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
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap'
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
                        lineHeight: '1.8',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.content}
                      </div>

                      {/* Booking Websites */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div style={{
                          marginTop: '0.75rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                          gap: '0.5rem'
                        }}>
                          {msg.suggestions.map((site, i) => (
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

                      {/* Travel Agents */}
                      {msg.agents && msg.agents.length > 0 && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'rgba(79, 70, 229, 0.08)',
                          borderRadius: '12px',
                          border: '1px solid rgba(79, 70, 229, 0.15)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                          }}>
                            <span style={{ fontSize: '18px' }}>🤝</span>
                            <span style={{ color: '#e8edf5', fontWeight: '600', fontSize: '14px' }}>
                              Our Travel Agents can help you!
                            </span>
                            <span style={{
                              fontSize: '10px',
                              padding: '0.2rem 0.6rem',
                              background: '#4F46E5',
                              color: 'white',
                              borderRadius: '12px'
                            }}>
                              Live
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '0.5rem'
                          }}>
                            {msg.agents.map((agent, i) => (
                              <div
                                key={i}
                                style={{
                                  padding: '0.75rem',
                                  background: '#0d1b33',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(255,255,255,0.06)'
                                }}
                              >
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginBottom: '0.25rem'
                                }}>
                                  <span style={{ fontSize: '20px' }}>{agent.avatar || '👤'}</span>
                                  <div>
                                    <div style={{ color: '#e8edf5', fontWeight: '600', fontSize: '13px' }}>
                                      {agent.name}
                                    </div>
                                    <div style={{ color: '#7a8ba8', fontSize: '11px' }}>
                                      {agent.title}
                                    </div>
                                  </div>
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  marginTop: '0.25rem'
                                }}>
                                  <span style={{ fontSize: '11px', color: '#34d399' }}>
                                    ● {agent.availability || 'Available'}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#7a8ba8' }}>
                                    ⭐ {agent.rating || '4.8'}
                                  </span>
                                </div>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#7a8ba8',
                                  marginTop: '0.25rem'
                                }}>
                                  {agent.experience || ''}
                                </div>
                                <button
                                  onClick={() => connectWithAgent(agent)}
                                  style={{
                                    width: '100%',
                                    marginTop: '0.5rem',
                                    padding: '0.4rem',
                                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.02)'
                                    e.target.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.3)'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)'
                                    e.target.style.boxShadow = 'none'
                                  }}
                                >
                                  Connect with {agent.name.split(' ')[0]}
                                </button>
                              </div>
                            ))}
                          </div>
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

      {/* Input */}
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