import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const SellerChat = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [pollId, setPollId] = useState(null)

  const token = localStorage.getItem('sellerToken')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const scrollRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    return () => {
      if (pollId) clearInterval(pollId)
    }
  }, [])

  useEffect(() => {
    if (!selectedConv) return
    fetchMessages()
    if (pollId) clearInterval(pollId)
    const id = setInterval(fetchMessages, 5000)
    setPollId(id)
    return () => clearInterval(id)
  }, [selectedConv])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${apiUrl}/api/chat/seller/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setConversations(res.data || [])
    } catch (err) {
      console.error('fetchConversations', err)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedConv) return
    try {
      const key = selectedConv.userId ? selectedConv.userId : selectedConv.guestId
      const res = await axios.get(`${apiUrl}/api/chat/seller/conversation/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(res.data || [])
      setTimeout(() => scrollToBottom(), 50)
      fetchConversations()
    } catch (err) {
      console.error('fetchMessages', err)
    }
  }

  const selectConversation = (conv) => {
    setSelectedConv(conv)
  }

  const sendMessage = async () => {
    if (!text.trim() || !selectedConv) return
    try {
      const key = selectedConv.userId ? selectedConv.userId : selectedConv.guestId
      const body = { text: text.trim() }
      // include guest meta if guest
      if (!selectedConv.userId) {
        body.guestId = selectedConv.guestId
        if (selectedConv.name) body.guestName = selectedConv.name
      }
      const res = await axios.post(`${apiUrl}/api/chat/seller/${encodeURIComponent(key)}/message`, body, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setText('')
      setMessages(prev => [...prev, res.data])
      setTimeout(() => scrollToBottom(), 50)
      fetchConversations()
    } catch (err) {
      console.error('sendMessage', err)
      toast.error('Failed to send message')
    }
  }

  const scrollToBottom = () => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  const formatName = (n) => {
    if (!n) return null
    return n === 'Seller' ? 'Aninaya.co' : n
  }

  return (
    <div className='bg-white rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
      <div className='col-span-1 border-r pr-2'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='font-semibold'>Conversations</h3>
          <button onClick={fetchConversations} className='text-sm text-gray-600 hover:text-black'>Refresh</button>
        </div>
        {loading ? (
          <p className='text-gray-500'>Loading...</p>
        ) : conversations.length === 0 ? (
          <p className='text-gray-500'>No conversations yet.</p>
        ) : (
          <ul className='space-y-2'>
            {conversations.map((c, idx) => (
              <li key={idx} onClick={() => selectConversation(c)} className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${selectedConv === c ? 'bg-gray-100' : ''}`}>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium'>{formatName(c.name) || formatName(c.userName) || formatName(c.sellerName) || 'User'}</div>
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
        {!selectedConv ? (
          <div className='flex-1 flex items-center justify-center text-gray-500'>Select a conversation to view messages</div>
        ) : (
          <>
            <div className='flex items-center justify-between border-b pb-2 mb-2'>
              <div>
                <h4 className='font-semibold'>{formatName(selectedConv.name) || formatName(selectedConv.userName) || 'Customer'}</h4>
                <div className='text-xs text-gray-500'>Conversation</div>
              </div>
              <div className='text-xs text-gray-500'>{new Date(selectedConv.lastAt).toLocaleString()}</div>
            </div>

            <div ref={scrollRef} className='flex-1 overflow-y-auto p-2 space-y-2'>
              {messages.map((m) => (
                <div key={m.id || Math.random()} className={`max-w-[70%] p-2 rounded ${m.sender === 'seller' ? 'bg-blue-50 self-end ml-auto' : 'bg-gray-100 self-start'}`}>
                  <div className='text-sm text-gray-800'>{m.message}</div>
                  <div className='text-xs text-gray-400 mt-1'>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>

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

export default SellerChat
