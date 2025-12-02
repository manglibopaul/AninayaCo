import express from 'express';
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserByAdmin,
} from '../controllers/userController.js';
import { verifyUser, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (auth required)
router.get('/profile', verifyUser, getUserProfile);
router.put('/profile', verifyUser, updateUserProfile);

// Admin routes
router.get('/', verifyAdmin, getAllUsers);
router.delete('/:id', verifyAdmin, deleteUser);
router.put('/:id', verifyAdmin, updateUserByAdmin);

export default router;
