import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const Seller = sequelize.define('Seller', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  storeName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (seller) => {
      if (seller.password) {
        const salt = await bcrypt.genSalt(10);
        seller.password = await bcrypt.hash(seller.password, salt);
      }
    },
    beforeUpdate: async (seller) => {
      if (seller.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        seller.password = await bcrypt.hash(seller.password, salt);
      }
    },
  },
});

// Method to compare passwords
Seller.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default Seller;
