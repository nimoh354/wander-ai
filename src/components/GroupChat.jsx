import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

function GroupChat({ trip, user }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState({})
  const [typingUsers, setTypingUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Fetch messages and subscribe to new ones
  useEffect(() => {
    if (!trip?.id) return

    const fetchMessages = async () => {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', trip.id)
        .order('created_at', { ascending: true })
      
      if (!error && data) {
        setMessages(data)
        
        const userIds = [...new Set(data.map(m => m.user_id))]
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds)
          
          if (profiles) {
            const userMap = {}
            profiles.forEach(p => {
              userMap[p.id] = p
            })
            setUsers(userMap)
          }
        }
      }
      
      setLoading(false)
    }

    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${trip.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `trip_id=eq.${trip.id}`
      }, (payload) => {
        const newMsg = payload.new
        setMessages(prev => [...prev, newMsg])
        
        if (!users[newMsg.user_id]) {
          supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMsg.user_id)
            .single()
            .then(({ data }) => {
              if (data) {
                setUsers(prev => ({ ...prev, [data.id]: data }))
              }
            })
        }
        
        setTimeout(scrollToBottom, 100)
      })
      .subscribe()

    // Subscribe to typing events
    const typingChannel = supabase
      .channel(`typing:${trip.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { userId, typing } = payload.payload
        
        // Don't show typing indicator for the current user
        if (userId === user.id) return
        
        setTypingUsers(prev => {
          if (typing) {
            // Add user to typing list if not already there
            if (!prev.includes(userId)) {
              return [...prev, userId]
            }
            return prev
          } else {
            // Remove user from typing list
            return prev.filter(id => id !== userId)
          }
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(typingChannel)
    }
  }, [trip?.id, user.id])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleTyping = (e) => {
    const value = e.target.value
    setNewMessage(value)
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Send typing event
    const channel = supabase.channel(`typing:${trip.id}`)
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: user.id, 
        typing: value.length > 0 
      }
    })
    
    // Auto-stop typing after 3 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { 
          userId: user.id, 
          typing: false 
        }
      })
    }, 3000)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    const channel = supabase.channel(`typing:${trip.id}`)
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: user.id, 
        typing: false 
      }
    })

    setSending(true)
    
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          trip_id: trip.id,
          user_id: user.id,
          message: newMessage.trim()
        }
      ])
    
    if (error) {
      alert('❌ Error sending message: ' + error.message)
    }
    
    setNewMessage('')
    setSending(false)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Get typing user names
  const getTypingNames = () => {
    const names = typingUsers
      .map(id => users[id]?.full_name || 'Someone')
      .filter(Boolean)
    
    if (names.length === 0) return ''
    if (names.length === 1) return `${names[0]} is typing...`
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`
    return `${names.length} people are typing...`
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#6b7280'
      }}>
        <p>Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="chat-container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '500px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      border: '1px solid rgba(139, 92, 246, 0.08)',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(135deg, #faf9fe, #f5f3ff)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1a1a2e',
            margin: 0
          }}>
            💬 Group Chat
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#6b7280',
            margin: 0
          }}>
            {messages.length} messages • {trip.destination}
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '12px',
          color: '#22c55e'
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            background: '#22c55e',
            borderRadius: '50%'
          }} />
          Live
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        background: '#faf9fe'
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '48px', marginBottom: '1rem' }}>💬</span>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>No messages yet</p>
            <p style={{ fontSize: '14px' }}>Be the first to say something!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwn = msg.user_id === user.id
              const userInfo = users[msg.user_id]
              const showAvatar = index === 0 || messages[index - 1]?.user_id !== msg.user_id
              
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                    maxWidth: '80%',
                    flexDirection: isOwn ? 'row-reverse' : 'row'
                  }}>
                    {!isOwn && showAvatar && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#8B5CF6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {userInfo?.full_name ? getInitials(userInfo.full_name) : '👤'}
                      </div>
                    )}
                    {!isOwn && !showAvatar && (
                      <div style={{ width: '32px', flexShrink: 0 }} />
                    )}
                    
                    <div>
                      {!isOwn && showAvatar && userInfo?.full_name && (
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          marginBottom: '0.25rem',
                          marginLeft: '0.25rem'
                        }}>
                          {userInfo.full_name}
                        </p>
                      )}
                      <div className={isOwn ? 'message-user' : 'message-bot'} style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '16px',
                        background: isOwn 
                          ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                          : 'white',
                        color: isOwn ? 'white' : '#1a1a2e',
                        boxShadow: isOwn
                          ? '0 2px 8px rgba(139, 92, 246, 0.3)'
                          : '0 1px 4px rgba(0,0,0,0.04)',
                        border: isOwn ? 'none' : '1px solid #f0f0f0',
                        wordBreak: 'break-word'
                      }}>
                        {msg.message}
                      </div>
                      <p style={{
                        fontSize: '10px',
                        color: '#999',
                        marginTop: '0.25rem',
                        textAlign: isOwn ? 'right' : 'left'
                      }}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginTop: '0.5rem',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem 1rem',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{
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
                  <span style={{
                    fontSize: '13px',
                    color: '#6b7280',
                    fontStyle: 'italic'
                  }}>
                    {getTypingNames()}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form className="chat-input" onSubmit={handleSend} style={{
        padding: '1rem',
        borderTop: '1px solid #f0f0f0',
        background: 'white',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Write a message..."
          style={{
            flex: 1,
            padding: '0.6rem 1rem',
            border: '2px solid #f0f0f0',
            borderRadius: '12px',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s ease',
            minWidth: '150px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8B5CF6'
            e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#f0f0f0'
            e.target.style.boxShadow = 'none'
            // Stop typing when input loses focus
            const channel = supabase.channel(`typing:${trip.id}`)
            channel.send({
              type: 'broadcast',
              event: 'typing',
              payload: { 
                userId: user.id, 
                typing: false 
              }
            })
          }}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          style={{
            padding: '0.6rem 1.5rem',
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            opacity: sending || !newMessage.trim() ? 0.5 : 1,
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            if (!sending && newMessage.trim()) {
              e.target.style.transform = 'scale(1.02)'
              e.target.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.35)'
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = 'none'
          }}
        >
          {sending ? 'Sending...' : 'Send →'}
        </button>
      </form>
    </div>
  )
}

export default GroupChat