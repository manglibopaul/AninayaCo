import Product from '../models/Product.js';
import { Op } from 'sequelize';

// Get all products (public)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.findAll({ where: { category } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller's products
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.seller.id;
    const products = await Product.findAll({ where: { sellerId } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (seller)
export const createProduct = async (req, res) => {
  try {
    const sellerId = req.seller?.id; // From auth middleware
    const productData = { ...req.body, sellerId: sellerId || null };

    // Handle file uploads
    if (req.files) {
      // Handle multiple images
      const imageFiles = req.files.filter(f => f.fieldname === 'image');
      if (imageFiles.length > 0) {
        productData.image = imageFiles.map(f => ({
          url: `/uploads/images/${f.filename}`,
          filename: f.filename,
        }));
      }

      // Handle model file
      const modelFile = req.files.find(f => f.fieldname === 'model');
      if (modelFile) {
        productData.modelUrl = `/uploads/models/${modelFile.filename}`;
      }
    }

    const newProduct = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if seller owns this product
    if (req.seller && product.sellerId !== req.seller.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      // Handle multiple images - only update if new images are provided
      const imageFiles = req.files.filter(f => f.fieldname === 'image');
      if (imageFiles.length > 0) {
        updateData.image = imageFiles.map(f => ({
          url: `/uploads/images/${f.filename}`,
          filename: f.filename,
        }));
      }
      // If no new images, keep existing images
      else if (!updateData.image) {
        updateData.image = product.image;
      }

      // Handle model file
      const modelFile = req.files.find(f => f.fieldname === 'model');
      if (modelFile) {
        updateData.modelUrl = `/uploads/models/${modelFile.filename}`;
      }
    } else {
      // If no files uploaded, keep existing images and model
      if (!updateData.image) {
        updateData.image = product.image;
      }
    }

    await product.update(updateData);
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if seller owns this product
    if (req.seller && product.sellerId !== req.seller.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
        ],
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
