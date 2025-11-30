import ChatMessage from '../models/ChatMessage.js'
import User from '../models/User.js'
import Seller from '../models/Seller.js'

// Seller: get conversations (distinct users with last message)
export const getSellerConversations = async (req, res) => {
  try {
    const sellerId = req.seller?.id
    if (!sellerId) return res.status(401).json({ message: 'Unauthorized' })

    // Get last message per user
    const messages = await ChatMessage.findAll({
      where: { sellerId },
      order: [['createdAt', 'DESC']],
    })
    // group by either userId or guestId
    const map = new Map()
    for (const m of messages) {
      const key = m.userId ? `u:${m.userId}` : `g:${m.guestId || 'guest'}`
      if (!map.has(key)) map.set(key, m)
    }

    const results = []
    for (const [key, lastMsg] of map.entries()) {
      if (key.startsWith('u:')) {
        const userId = Number(key.split(':')[1])
        const user = await User.findByPk(userId)
        const unreadCount = await ChatMessage.count({ where: { sellerId, userId, sender: 'user', read: false } })
        results.push({ userId, guestId: null, name: user?.name || 'User', lastMessage: lastMsg.message, lastAt: lastMsg.createdAt, unreadCount, isGuest: false })
      } else {
        const guestId = key.split(':')[1]
        const unreadCount = await ChatMessage.count({ where: { sellerId, guestId, sender: 'user', read: false } })
        results.push({ userId: null, guestId, name: lastMsg.guestName || 'Guest', lastMessage: lastMsg.message, lastAt: lastMsg.createdAt, unreadCount, isGuest: true })
      }
    }

    // sort by lastAt desc
    results.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
    return res.json(results)
  } catch (error) {
    console.error('getSellerConversations', error)
    return res.status(500).json({ message: 'Failed to fetch conversations' })
  }
}

// Seller: get messages with a specific user
export const getConversationMessagesForSeller = async (req, res) => {
  try {
    const sellerId = req.seller?.id
    const { userId } = req.params
    if (!sellerId) return res.status(401).json({ message: 'Unauthorized' })
    let where = { sellerId }
    if (/^\d+$/.test(String(userId))) {
      where.userId = Number(userId)
    } else {
      // treat as guestId (or read from query)
      const guestId = req.query.guestId || userId
      where.guestId = guestId
    }

    const messages = await ChatMessage.findAll({ where, order: [['createdAt', 'ASC']] })

    // mark user's/guest's messages as read
    const markWhere = { sellerId, sender: 'user', read: false }
    if (where.userId) markWhere.userId = where.userId
    else if (where.guestId) markWhere.guestId = where.guestId
    await ChatMessage.update({ read: true }, { where: markWhere })

    return res.json(messages)
  } catch (error) {
    console.error('getConversationMessagesForSeller', error)
    return res.status(500).json({ message: 'Failed to fetch messages' })
  }
}

// Seller sends message to user
export const sellerSendMessage = async (req, res) => {
  try {
    const sellerId = req.seller?.id
    const { userId } = req.params
    const { text, orderId, guestName, guestEmail, guestId: bodyGuestId } = req.body
    if (!sellerId) return res.status(401).json({ message: 'Unauthorized' })
    if (!text) return res.status(400).json({ message: 'Message required' })
    let message
    if (/^\d+$/.test(String(userId))) {
      message = await ChatMessage.create({ userId: Number(userId), sellerId, message: text, sender: 'seller', orderId: orderId || null })
    } else {
      const guestId = bodyGuestId || userId
      message = await ChatMessage.create({ guestId, guestName: guestName || null, guestEmail: guestEmail || null, sellerId, message: text, sender: 'seller', orderId: orderId || null })
    }
    return res.status(201).json(message)
  } catch (error) {
    console.error('sellerSendMessage', error)
    return res.status(500).json({ message: 'Failed to send message' })
  }
}

// User: get conversations (list of sellers they've chatted with)
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user?.id
    const guestId = req.query?.guestId

    if (!userId && !guestId) return res.status(401).json({ message: 'Provide guestId or sign in' })

    if (userId) {
      const messages = await ChatMessage.findAll({ where: { userId }, order: [['createdAt', 'DESC']] })
      const map = new Map()
      for (const m of messages) if (!map.has(m.sellerId)) map.set(m.sellerId, m)

      const results = []
      for (const [sellerId, lastMsg] of map.entries()) {
        const seller = await Seller.findByPk(sellerId)
        const unreadCount = await ChatMessage.count({ where: { userId, sellerId, sender: 'seller', read: false } })
        results.push({ sellerId, sellerName: seller?.storeName || 'Seller', lastMessage: lastMsg.message, lastAt: lastMsg.createdAt, unreadCount, isGuest: false })
      }
      results.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
      return res.json(results)
    }

    // guest flow
    const messages = await ChatMessage.findAll({ where: { guestId }, order: [['createdAt', 'DESC']] })
    const map = new Map()
    for (const m of messages) if (!map.has(m.sellerId)) map.set(m.sellerId, m)
    const results = []
    for (const [sellerId, lastMsg] of map.entries()) {
      const seller = await Seller.findByPk(sellerId)
      const unreadCount = await ChatMessage.count({ where: { guestId, sellerId, sender: 'seller', read: false } })
      results.push({ sellerId, sellerName: seller?.storeName || 'Seller', lastMessage: lastMsg.message, lastAt: lastMsg.createdAt, unreadCount, isGuest: true, guestId })
    }
    results.sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt))
    return res.json(results)
  } catch (error) {
    console.error('getUserConversations', error)
    return res.status(500).json({ message: 'Failed to fetch conversations' })
  }
}

// User: get messages with seller
export const getConversationMessagesForUser = async (req, res) => {
  try {
    const userId = req.user?.id
    const { sellerId } = req.params
    const guestId = req.query?.guestId

    if (!userId && !guestId) return res.status(401).json({ message: 'Provide guestId or sign in' })

    let where = { sellerId: Number(sellerId) }
    if (userId) where.userId = userId
    else where.guestId = guestId

    const messages = await ChatMessage.findAll({ where, order: [['createdAt', 'ASC']] })
    // mark seller messages as read
    const markWhere = { sellerId: Number(sellerId), sender: 'seller', read: false }
    if (userId) markWhere.userId = userId
    else markWhere.guestId = guestId
    await ChatMessage.update({ read: true }, { where: markWhere })
    return res.json(messages)
  } catch (error) {
    console.error('getConversationMessagesForUser', error)
    return res.status(500).json({ message: 'Failed to fetch messages' })
  }
}

// User sends message to seller
export const userSendMessage = async (req, res) => {
  try {
    const userId = req.user?.id
    const { sellerId } = req.params
    const { text, orderId, guestId, guestName, guestEmail } = req.body
    if (!userId && !guestId) return res.status(401).json({ message: 'Provide guestId or sign in' })
    if (!text) return res.status(400).json({ message: 'Message required' })

    let message
    if (userId) {
      message = await ChatMessage.create({ userId, sellerId: Number(sellerId), message: text, sender: 'user', orderId: orderId || null })
    } else {
      message = await ChatMessage.create({ guestId, guestName: guestName || null, guestEmail: guestEmail || null, sellerId: Number(sellerId), message: text, sender: 'user', orderId: orderId || null })
    }
    return res.status(201).json(message)
  } catch (error) {
    console.error('userSendMessage', error)
    return res.status(500).json({ message: 'Failed to send message' })
  }
}
