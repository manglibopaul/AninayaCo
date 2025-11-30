import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'
import User from './User.js'
import Seller from './Seller.js'

const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'id' },
  },
  guestId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guestName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guestEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Seller, key: 'id' },
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sender: {
    type: DataTypes.STRING, // 'user' or 'seller'
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  meta: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
})

export default ChatMessage
