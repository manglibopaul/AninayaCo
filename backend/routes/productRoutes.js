import express from 'express';
import {
  getAllProducts,
  getProduct,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getSellerProducts,
} from '../controllers/productController.js';
import { verifySeller } from '../middleware/sellerAuth.js';
import { verifyAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

// Seller routes (protected)
router.get('/seller/my-products', verifySeller, getSellerProducts);
router.post('/', verifySeller, upload.any(), createProduct);
router.put('/:id', verifySeller, upload.any(), updateProduct);
router.delete('/:id', verifySeller, deleteProduct);

// Admin delete any product
router.delete('/admin/:id', verifyAdmin, deleteProduct);

export default router;
