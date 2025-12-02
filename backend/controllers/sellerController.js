import Seller from '../models/Seller.js';
import { generateSellerToken } from '../middleware/sellerAuth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// Register seller
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, storeName, phone, address } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingSeller = await Seller.findOne({ where: { email } });
    if (existingSeller) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const seller = await Seller.create({
      name,
      email,
      password,
      storeName,
      phone,
      address,
    });

    const token = generateSellerToken(seller.id);

    res.status(201).json({
      message: 'Seller registered successfully',
      token,
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        storeName: seller.storeName,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error registering seller', error: error.message });
  }
};

// Login seller
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    console.log('🔍 Looking up seller with email:', email);
    const startTime = Date.now();
    
    const seller = await Seller.findOne({ where: { email } });
    const lookupTime = Date.now() - startTime;
    console.log(`⏱️ Seller lookup took ${lookupTime}ms`);
    
    if (!seller) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('🔐 Comparing passwords...');
    const isPasswordValid = await seller.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password valid, generating token...');
    const token = generateSellerToken(seller.id);

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        storeName: seller.storeName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Get seller profile
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.seller.id, {
      attributes: { exclude: ['password'] },
    });

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json(seller);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Find seller by store name (public helper)
export const findSellerByName = async (req, res) => {
  try {
    const { name } = req.params
    if (!name) return res.status(400).json({ message: 'Name required' })
    const seller = await Seller.findOne({ where: { storeName: name } })
    if (!seller) return res.status(404).json({ message: 'Seller not found' })
    return res.json({ id: seller.id, storeName: seller.storeName, name: seller.name })
  } catch (error) {
    console.error('findSellerByName', error)
    return res.status(500).json({ message: 'Failed to find seller' })
  }
}

// Update seller profile
export const updateSellerProfile = async (req, res) => {
  try {
    const { name, storeName, description, phone, address } = req.body;

    const seller = await Seller.findByPk(req.seller.id);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    await seller.update({
      name: name || seller.name,
      storeName: storeName || seller.storeName,
      description: description || seller.description,
      phone: phone || seller.phone,
      address: address || seller.address,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        storeName: seller.storeName,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Get orders that include this seller's products
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller.id;

    // find seller's products
    const sellerProducts = await Product.findAll({ where: { sellerId } });
    const sellerProductIds = sellerProducts.map((p) => p.id);

    // fetch recent orders
    const orders = await Order.findAll({ order: [['createdAt', 'DESC']] });

    const sellerOrders = orders.reduce((acc, order) => {
      let items = order.items || [];
      // items stored as JSON (Sequelize JSON) — ensure it's an array
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch (e) { items = []; }
      }

      const sellerItems = items.filter((it) => {
        const pid = it.productId ?? it.id ?? it._id ?? it.product_id;
        return pid && sellerProductIds.includes(Number(pid));
      });

      if (sellerItems.length) {
        acc.push({ ...order.toJSON(), sellerItems });
      }

      return acc;
    }, []);

    res.json(sellerOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: error.message });
  }
};
