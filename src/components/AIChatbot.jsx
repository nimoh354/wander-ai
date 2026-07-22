// src/components/AIChatbot.jsx
import React, { useState, useRef, useEffect } from 'react'

function AIChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Hi! I'm WanderAI's travel assistant! Ask me anything about travel, and I'll help you plan your adventure!",
      sender: 'bot'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ✅ Get AI response from Groq API
  const getAIResponse = async (userMessage) => {
    try {
      const API_URL = import.meta.env.PROD 
        ? '/api/ai-chat'
        : 'http://localhost:3000/api/ai-chat'

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-5) // Send last 5 messages for context
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'AI service unavailable')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('❌ AI Error:', error)
      return "I'm having trouble connecting right now. Please try again in a moment! 🙏"
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
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

  // ✅ Quick suggestions
  const suggestions = [
    { label: '🌍 Best Destinations', value: 'What are the best travel destinations?' },
    { label: '💰 Budget Tips', value: 'How can I travel on a budget?' },
    { label: '🏝️ Beach Vacations', value: 'Recommend good beach destinations' },
    { label: '🎒 Solo Travel', value: 'Tips for solo travel' },
    { label: '✈️ Flight Tips', value: 'How to find cheap flights?' },
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
            Powered by Groq AI • Real-time
          </p>
        </div>
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
          placeholder="Ask about travel destinations..."
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
          {isTyping ? 'Thinking...' : 'Send →'}
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
        Powered by Groq AI • Real-time responses • Ask me anything!
      </div>
    </div>
  )
}

export default AIChatbot