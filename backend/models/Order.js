import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zipcode: DataTypes.STRING,
  country: DataTypes.STRING,
  phone: DataTypes.STRING,
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shippingFee: {
    type: DataTypes.FLOAT,
    defaultValue: 40,
  },
  commission: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  orderStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  trackingNumber: DataTypes.STRING,
}, {
  timestamps: true,
});

export default Order;
