import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
} from '../controllers/orderController.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', verifyUser, createOrder);
router.get('/my-orders', verifyUser, getUserOrders);
router.get('/:id', verifyUser, getOrder);
router.put('/:id/cancel', verifyUser, cancelOrder);

// Admin routes
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
