import Seller from '../models/Seller.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { sequelize } from '../config/database.js';

const initializeDatabase = async () => {
  try {
    // Sync all models with the database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    process.exit(1);
  }
};

export default initializeDatabase;
