import express from 'express'
import { verifySeller } from '../middleware/sellerAuth.js'
import { verifyUserOptional } from '../middleware/auth.js'
import {
  getSellerConversations,
  getConversationMessagesForSeller,
  sellerSendMessage,
  getUserConversations,
  getConversationMessagesForUser,
  userSendMessage,
} from '../controllers/chatController.js'

const router = express.Router()

// Seller routes
router.get('/seller/conversations', verifySeller, getSellerConversations)
router.get('/seller/conversation/:userId', verifySeller, getConversationMessagesForSeller)
router.post('/seller/:userId/message', verifySeller, sellerSendMessage)

// User routes (support authenticated users and guests)
router.get('/user/conversations', verifyUserOptional, getUserConversations)
router.get('/user/conversation/:sellerId', verifyUserOptional, getConversationMessagesForUser)
router.post('/user/:sellerId/message', verifyUserOptional, userSendMessage)

export default router
