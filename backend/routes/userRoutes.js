import express from 'express';
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} from '../controllers/userController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (would need auth middleware)
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Admin routes
router.get('/', getAllUsers);

export default router;
