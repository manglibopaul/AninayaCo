import express from 'express';
import {
  registerSeller,
  loginSeller,
  getSellerProfile,
  updateSellerProfile,
  getSellerOrders,
  findSellerByName,
} from '../controllers/sellerController.js';
import { verifySeller } from '../middleware/sellerAuth.js';

const router = express.Router();

// Public routes
router.post('/register', registerSeller);
router.post('/login', loginSeller);

// Protected routes
router.get('/profile', verifySeller, getSellerProfile);
router.put('/profile', verifySeller, updateSellerProfile);
// Seller's orders (orders that include their products)
router.get('/orders', verifySeller, getSellerOrders);

// Public: find seller by store name
router.get('/by-name/:name', findSellerByName);

export default router;
