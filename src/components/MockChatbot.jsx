import React, { useState, useRef, useEffect } from 'react'

function MockChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm WanderAI's travel assistant! Ask me anything about travel, and I'll help you plan your adventure!",
      sender: 'bot'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const mockResponses = [
    {
      keywords: ['hello', 'hi', 'hey'],
      response: "Hey there! 🌍 Ready to explore the world? Tell me where you want to go!"
    },
    {
      keywords: ['paris', 'france', 'eiffel'],
      response: "Ah, Paris! 🇫🇷 The City of Light! Don't miss the Eiffel Tower, Louvre Museum, and try croissants at a local bakery. Pro tip: Visit Montmartre for the best views!"
    },
    {
      keywords: ['tokyo', 'japan'],
      response: "Tokyo is AMAZING! 🇯🇵 Try sushi at Tsukiji Market, visit Shibuya Crossing, and don't miss the cherry blossoms if you go in spring! 🌸"
    },
    {
      keywords: ['bali', 'indonesia'],
      response: "Bali is paradise! 🏝️ Visit Ubud for rice terraces, relax on Kuta Beach, and try surfing at Canggu. Don't forget to visit a temple! 🛕"
    },
    {
      keywords: ['budget', 'cheap', 'affordable'],
      response: "Traveling on a budget? 💰 Here are my tips: Stay in hostels, eat street food, use public transport, and book flights 2-3 months in advance for the best deals!"
    },
    {
      keywords: ['hotel', 'stay', 'accommodation'],
      response: "For accommodations, I recommend checking Booking.com or Airbnb. Pro tip: Read reviews carefully and book places with free cancellation! 🏨"
    },
    {
      keywords: ['food', 'eat', 'restaurant'],
      response: "Food is the best part of travel! 🍜 I always ask locals for recommendations, avoid tourist traps, and try street food for authentic experiences!"
    },
    {
      keywords: ['beach', 'coast', 'ocean'],
      response: "Beach vibes! 🌊 Some of my favorites: Maldives, Phuket, Bali, and the Amalfi Coast. Don't forget sunscreen! ☀️"
    },
    {
      keywords: ['adventure', 'hike', 'mountain'],
      response: "Adventure seeker! 🏔️ Try hiking the Inca Trail, climbing Mount Fuji, or exploring the Swiss Alps. Always bring proper gear and check weather conditions!"
    },
    {
      keywords: ['culture', 'museum', 'history'],
      response: "Culture lover! 🏛️ Visit local museums, take walking tours, and learn a few words in the local language. It makes such a difference!"
    },
    {
      keywords: ['solo', 'alone', 'single'],
      response: "Solo travel is LIFE-CHANGING! 🌟 Stay in social hostels, join group tours to meet people, and always trust your instincts. You'll make friends everywhere!"
    },
    {
      keywords: ['packing', 'luggage', 'suitcase'],
      response: "Packing tips: 🎒 Roll your clothes (saves space!), pack versatile items, and always bring a power bank and a reusable water bottle!"
    },
    {
      keywords: ['flight', 'plane', 'airport'],
      response: "Flight tips: ✈️ Book on Tuesdays for cheaper tickets, check budget airlines, and always arrive at the airport 2-3 hours early. Safe travels!"
    },
    {
      keywords: ['weather', 'rain', 'cold', 'hot'],
      response: "Always check the weather before you go! 🌤️ Pack layers, bring a rain jacket just in case, and check if it's the dry/rainy season."
    }
  ]

  const getMockResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase()
    
    for (let item of mockResponses) {
      for (let keyword of item.keywords) {
        if (lowerInput.includes(keyword)) {
          return item.response
        }
      }
    }
    
    const defaultResponses = [
      "That's a great question! 🤔 Let me think... I'd recommend checking out local travel blogs or asking the hotel reception for the best tips!",
      "Interesting! 🌍 I'd suggest doing some research on TripAdvisor or joining local Facebook groups for up-to-date advice!",
      "Great topic! 💡 Did you know that the best travel experiences often come from talking to locals? Try it!",
      "Hmm, let me help you with that! 📚 I'd recommend creating a travel bucket list and prioritizing your must-see places!",
      "I love that question! ✨ Travel is all about exploration. My advice? Just go for it and make amazing memories!"
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getMockResponse(input),
        sender: 'bot'
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  return (
    <div className="chatbot-container" style={{
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      maxWidth: '700px',
      margin: '0 auto',
      overflow: 'hidden',
      border: '1px solid rgba(139, 92, 246, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
        padding: '1.25rem 1.5rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '28px' }}>🤖</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            WanderAI Assistant
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '12px', 
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              background: '#4ade80',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }} />
            Online • Demo Mode
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{
        height: '420px',
        overflowY: 'auto',
        padding: '1.25rem',
        background: '#faf9fe',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            <div className={msg.sender === 'user' ? 'message-user' : 'message-bot'} style={{
              maxWidth: '75%',
              padding: '0.75rem 1.25rem',
              borderRadius: '18px',
              background: msg.sender === 'user' 
                ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' 
                : 'white',
              color: msg.sender === 'user' ? 'white' : '#1a1a2e',
              boxShadow: msg.sender === 'user'
                ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                : '0 2px 8px rgba(0,0,0,0.06)',
              border: msg.sender === 'bot' ? '1px solid #f0f0f0' : 'none',
              fontSize: '14px',
              lineHeight: '1.5',
              wordBreak: 'break-word'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '18px',
              background: 'white',
              border: '1px solid #f0f0f0',
              display: 'flex',
              gap: '4px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                background: '#8B5CF6',
                borderRadius: '50%',
                animation: 'typing 1.4s infinite'
              }} />
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                background: '#8B5CF6',
                borderRadius: '50%',
                animation: 'typing 1.4s infinite 0.2s'
              }} />
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                background: '#8B5CF6',
                borderRadius: '50%',
                animation: 'typing 1.4s infinite 0.4s'
              }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input" onSubmit={handleSend} style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid #f0f0f0',
        background: 'white',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about any destination..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '2px solid #f0f0f0',
            borderRadius: '12px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            background: '#faf9fe',
            minWidth: '150px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8B5CF6'
            e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#f0f0f0'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          type="submit"
          disabled={isTyping}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            opacity: isTyping ? 0.6 : 1,
            transform: isTyping ? 'none' : 'scale(1)',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (!isTyping) {
              e.target.style.transform = 'scale(1.02)'
              e.target.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.35)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          Send →
        </button>
      </form>

      {/* Footer */}
      <div style={{
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '11px',
        color: '#a1a1aa',
        background: '#faf9fe',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          background: '#f59e0b',
          borderRadius: '50%'
        }} />
        Demo Mode • Pre-written responses • Real AI coming soon!
      </div>
    </div>
  )
}

export default MockChatbot