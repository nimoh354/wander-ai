// src/components/AIChatbot.jsx
import React, { useState, useRef, useEffect } from 'react'

function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm WanderAI's Trip Planner! Tell me where you want to go, and I'll create a detailed itinerary for you! 🌍",
      sender: 'bot'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('planner') // 'planner' or 'chat'
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ✅ Enhanced: Get AI response with trip planning context
  const getAIResponse = async (userMessage) => {
    try {
      const API_URL = import.meta.env.PROD 
        ? '/api/ai-chat'
        : 'http://localhost:3000/api/ai-chat'

      // Track trip info
      const tripContext = extractTripInfo(messages, userMessage);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-8),
          mode: mode, // Send mode to backend
          tripState: tripContext
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 429) {
          return "⏳ I'm getting a lot of requests right now. Please wait a moment and try again! 🙏"
        }
        throw new Error(errorData.error || 'AI service unavailable')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('❌ AI Error:', error)
      return "I'm having trouble connecting right now. Please try again in a moment! 🙏"
    }
  }

  // ✅ Helper: Extract trip info
  const extractTripInfo = (messages, newMessage) => {
    const allText = messages.map(m => m.text).join(' ') + ' ' + newMessage;
    const lower = allText.toLowerCase();
    
    const destinations = ['kenya', 'bali', 'paris', 'tokyo', 'london', 'rome', 
                          'dubai', 'singapore', 'bangkok', 'sydney', 'cape town', 
                          'maldives', 'hawaii', 'new york', 'barcelona'];
    
    let destination = null;
    for (const dest of destinations) {
      if (lower.includes(dest)) {
        destination = dest;
        break;
      }
    }
    
    return {
      destination: destination,
      hasDates: /\b\d+\s*(days?|nights?)\b/.test(lower),
      hasBudget: /\$\d+/.test(lower) || /budget/i.test(lower),
      hasGroup: /(family|solo|couple|group|kids?|children|adults?)/i.test(lower),
      hasInterests: /(adventure|beach|culture|food|nature|wildlife|shopping)/i.test(lower),
      messageCount: messages.length
    };
  }

  // ✅ Format AI responses
  const formatAIResponse = (text) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Day headers
      if (/^.*Day \d+[:|]/.test(line) || line.includes('📍')) {
        return <div key={index} style={{ 
          fontWeight: '700', 
          color: '#7C3AED', 
          fontSize: '15px',
          marginTop: '8px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '4px'
        }}>{line}</div>;
      }
      
      // Activity lines
      if (/^[•\-⭐🌅🌤️🌙💰💡]/.test(line.trim())) {
        return <div key={index} style={{ 
          paddingLeft: '8px',
          marginTop: '2px',
          fontSize: '14px'
        }}>{line}</div>;
      }
      
      // Cost lines
      if (/\$\d+/.test(line)) {
        return <div key={index} style={{ 
          color: '#059669', 
          fontWeight: '600',
          marginTop: '4px'
        }}>💰 {line}</div>;
      }
      
      return <div key={index} style={{ marginTop: '2px' }}>{line}</div>;
    });
  };

  const handleSend = async (e) => {
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
    setError('')

    try {
      const aiResponse = await getAIResponse(input)
      
      const botMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'bot'
      }
      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      setError('Failed to get response. Please try again.')
      console.error('❌ Error:', err)
    } finally {
      setIsTyping(false)
    }
  }

  // ✅ Trip planning suggestions
  const suggestions = [
    { label: '✈️ Plan a Trip', value: 'I want to plan a trip. Where should I start?' },
    { label: '🌍 Safari in Kenya', value: 'Plan a 5-day safari in Kenya for my family of 4 with a $3000 budget' },
    { label: '🏝️ Bali Vacation', value: 'Create a 7-day itinerary for Bali for a couple on a $2000 budget' },
    { label: '💰 Budget Trip', value: 'Help me plan a budget-friendly European trip for 10 days' },
    { label: '🎒 Solo Adventure', value: "I'm traveling solo to Japan for 2 weeks. What should I do?" },
  ]

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} }
      handleSend(fakeEvent)
    }, 300)
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
    }}>
      {/* Header with Mode Toggle */}
      <div style={{
        background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
        padding: '1.25rem 1.5rem',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '28px' }}>🤖</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
              WanderAI {mode === 'planner' ? 'Trip Planner' : 'Assistant'}
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
              {mode === 'planner' ? '📍 Create your dream itinerary' : '💬 Quick travel questions'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setMode(mode === 'chat' ? 'planner' : 'chat')}
          style={{
            padding: '0.3rem 0.8rem',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.25)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
        >
          {mode === 'chat' ? '🗺️ Switch to Trip Planner' : '💬 Switch to Chat'}
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{
        height: '380px',
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
            <div style={{
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
              lineHeight: '1.6',
              wordBreak: 'break-word'
            }}>
              {msg.sender === 'bot' ? formatAIResponse(msg.text) : msg.text}
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
        {error && (
          <div style={{
            padding: '0.5rem',
            background: '#fee2e2',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div style={{
        padding: '0.5rem 1.25rem',
        background: '#faf9fe',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        borderTop: '1px solid #f0f0f0'
      }}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion.value)}
            style={{
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              background: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#374151',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#8B5CF6'
              e.target.style.background = '#f5f3ff'
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.background = 'white'
            }}
          >
            {suggestion.label}
          </button>
        ))}
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
          placeholder={mode === 'planner' 
            ? "Tell me your dream trip... 🌍" 
            : "Ask about travel destinations..."}
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
            whiteSpace: 'nowrap'
          }}
        >
          {isTyping ? 'Planning...' : 'Send ✈️'}
        </button>
      </form>

      {/* Footer */}
      <div style={{
        padding: '0.5rem',
        textAlign: 'center',
        fontSize: '11px',
        color: '#a1a1aa',
        background: '#faf9fe',
        borderTop: '1px solid #f0f0f0'
      }}>
        {mode === 'planner' 
          ? '🗺️ Powered by Groq AI • Plan your dream trip today!' 
          : '💬 Powered by Groq AI • Ask me anything!'}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default AIChatbot