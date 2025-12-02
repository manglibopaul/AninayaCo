import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const UserChat = () => {
  const [conversations, setConversations] = useState([])
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [pollInterval, setPollInterval] = useState(null)
  const token = localStorage.getItem('token') || localStorage.getItem('userToken')
  // guest fields
  const [guestId, setGuestId] = useState(localStorage.getItem('guestChatId') || '')
  const [guestName, setGuestName] = useState(localStorage.getItem('guestName') || '')
  const [guestEmail, setGuestEmail] = useState(localStorage.getItem('guestEmail') || '')
  // Single-seller configuration (app is dedicated to one seller)
  const SINGLE_SELLER_ID = import.meta.env.VITE_SINGLE_SELLER_ID || '1'
  const SINGLE_SELLER_NAME = import.meta.env.VITE_SINGLE_SELLER_NAME || 'Aninaya.co'
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const scrollRef = useRef(null)

  useEffect(() => {
    // ensure guestId exists for anonymous users
    if (!token && !guestId) {
      const id = `g_${Date.now()}_${Math.random().toString(36).slice(2,9)}`
      localStorage.setItem('guestChatId', id)
      setGuestId(id)
    }
    // For single-seller flow, auto-select the seller and load messages
    const init = async () => {
      let sellerId = Number(SINGLE_SELLER_ID || 0)
      // if SINGLE_SELLER_NAME is set, try to resolve actual seller id from backend
      if ((!sellerId || sellerId === 0) && SINGLE_SELLER_NAME) {
        try {
          const res = await fetch(`${apiUrl}/api/sellers/by-name/${encodeURIComponent(SINGLE_SELLER_NAME)}`)
          if (res.ok) {
            const json = await res.json()
            sellerId = Number(json.id)
          }
        } catch (err) {
          console.warn('Failed to lookup seller by name', err)
        }
      }
      if (sellerId) {
        setSelectedSeller({ sellerId, sellerName: SINGLE_SELLER_NAME, lastAt: Date.now() })
        fetchMessages(sellerId)
      }
    }
    init()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (!selectedSeller) return
    fetchMessages(selectedSeller.sellerId)

    // start polling for new messages every 5s
    if (pollInterval) clearInterval(pollInterval)
    const id = setInterval(() => fetchMessages(selectedSeller.sellerId, false), 5000)
    setPollInterval(id)
    return () => clearInterval(id)
  }, [selectedSeller])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const qs = token ? '' : `?guestId=${encodeURIComponent(guestId)}`
      const res = await axios.get(`${apiUrl}/api/chat/user/conversations${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setConversations(res.data || [])
    } catch (err) {
      console.error('fetchConversations', err)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (sellerId, scroll = true) => {
    try {
      const qs = token ? '' : `?guestId=${encodeURIComponent(guestId)}`
      const res = await axios.get(`${apiUrl}/api/chat/user/conversation/${sellerId}${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setMessages(res.data || [])
      if (scroll) setTimeout(() => scrollToBottom(), 50)
      // refresh conversation list so lastMessage and order reflect
      fetchConversations()
    } catch (err) {
      console.error('fetchMessages', err)
    }
  }

  const selectConversation = (conv) => {
    setSelectedSeller(conv)
  }

  const sendMessage = async () => {
    if (!text.trim()) return
    // ensure we have a selected seller; try to resolve if missing
    let sellerId = selectedSeller?.sellerId
    if (!sellerId) {
      // try env id first
      sellerId = Number(SINGLE_SELLER_ID || 0) || null
      if (!sellerId && SINGLE_SELLER_NAME) {
        try {
          const res = await fetch(`${apiUrl}/api/sellers/by-name/${encodeURIComponent(SINGLE_SELLER_NAME)}`)
          if (res.ok) {
            const json = await res.json()
            sellerId = Number(json.id)
            setSelectedSeller({ sellerId, sellerName: SINGLE_SELLER_NAME, lastAt: Date.now() })
          }
        } catch (err) {
          console.warn('Failed to lookup seller by name before sending message', err)
        }
      }
    }
    if (!sellerId) {
      console.warn('No sellerId available, cannot send message')
      return
    }
    try {
      const body = { text: text.trim() }
      if (!token) {
        body.guestId = guestId
        if (guestName) body.guestName = guestName
        if (guestEmail) body.guestEmail = guestEmail
      }
      console.log('Sending message to sellerId', sellerId, 'body', body)
      const res = await axios.post(`${apiUrl}/api/chat/user/${sellerId}/message`, body, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      setText('')
      // append locally for optimistic UI
      setMessages(prev => [...prev, res.data])
      setTimeout(() => scrollToBottom(), 50)
      fetchConversations()
      // refresh messages for this seller
      fetchMessages(sellerId)
    } catch (err) {
      console.error('sendMessage', err)
      toast.error('Failed to send message')
    }
  }

  const scrollToBottom = () => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  const isGuest = !token

  return (
    <div className='h-full bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='col-span-1 border-r pr-2'>
        <div className='flex items-center mb-3'>
          <h3 className='font-semibold'>Conversations</h3>
        </div>
        {loading ? (
          <p className='text-gray-500'>Loading...</p>
        ) : conversations.length === 0 ? (
          <p className='text-gray-500'>No conversations yet.</p>
        ) : (
          <ul className='space-y-2'>
            {conversations.map((c) => (
              <li key={c.sellerId} onClick={() => selectConversation(c)} className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${selectedSeller?.sellerId === c.sellerId ? 'bg-gray-100' : ''}`}>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>{c.sellerName}</div>
                    <div className='text-xs text-gray-500 truncate'>{c.lastMessage}</div>
                  </div>
                  {c.unreadCount > 0 && <div className='bg-red-600 text-white text-xs px-2 py-0.5 rounded-full'>{c.unreadCount}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className='col-span-2 flex flex-col'>
        {!selectedSeller ? (
          <div className='flex-1 flex items-center justify-center text-gray-500'>Select a conversation to start chatting</div>
        ) : (
          <>
            <div className='flex items-center justify-between border-b pb-2 mb-2'>
                    <div>
                      <h4 className='font-semibold'>{(selectedSeller?.sellerName === 'Seller') ? 'Aninaya.co' : selectedSeller?.sellerName}</h4>
                      <div className='text-xs text-gray-500'>Conversation</div>
                    </div>
                    <div className='text-xs text-gray-500'>{new Date(selectedSeller.lastAt).toLocaleString()}</div>
                  </div>

            <div ref={scrollRef} className='flex-1 overflow-y-auto p-2 space-y-2'>
              {messages.map((m) => (
                <div key={m.id || Math.random()} className={`max-w-[70%] p-2 rounded ${m.sender === 'user' ? 'bg-blue-50 self-end ml-auto' : 'bg-gray-100 self-start'}`}>
                  <div className='text-sm text-gray-800'>{m.message}</div>
                  <div className='text-xs text-gray-400 mt-1'>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {isGuest && (
              <div className='mb-3 grid grid-cols-1 md:grid-cols-3 gap-2'>
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className='px-3 py-2 border rounded' placeholder='Your name (optional)' />
                <input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className='px-3 py-2 border rounded' placeholder='Email (optional)' />
                <button onClick={() => { localStorage.setItem('guestName', guestName); localStorage.setItem('guestEmail', guestEmail); }} className='bg-gray-200 px-3 py-2 rounded'>Save</button>
              </div>
            )}

            <div className='mt-3 flex gap-2'>
              <input value={text} onChange={(e) => setText(e.target.value)} className='flex-1 px-3 py-2 border rounded' placeholder='Write a message...' />
              <button onClick={sendMessage} className='bg-black text-white px-4 py-2 rounded'>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UserChat
