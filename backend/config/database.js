import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './aninaya.db',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

let dbConnected = false;

const connectDB = async () => {
  if (dbConnected) return;
  
  try {
    await sequelize.authenticate();
    await sequelize.query('PRAGMA foreign_keys = OFF');
    await sequelize.sync({ force: false, alter: false });
    await sequelize.query('PRAGMA foreign_keys = ON');
    dbConnected = true;
    console.log('✅ SQLite database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
