import { sequelize } from './config/database.js';
import Seller from './models/Seller.js';

const deleteSeller = async () => {
  try {
    // Delete all sellers (or you can specify by email)
    const result = await Seller.destroy({
      where: {}, // Remove all sellers, or add: email: 'specific@email.com'
      truncate: false
    });
    
    console.log(`✅ Deleted ${result} seller(s)`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting seller:', error.message);
    process.exit(1);
  }
};

deleteSeller();
