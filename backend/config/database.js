import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './aninaya.db',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
   await sequelize.query('PRAGMA foreign_keys = OFF');
   await sequelize.sync({ force: true });
   await sequelize.query('PRAGMA foreign_keys = ON');
    console.log('✅ SQLite database connected successfully');
  } catch (error) {
   console.error('❌ Database connection failed:', error.message);
   console.error('Full error:', error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
