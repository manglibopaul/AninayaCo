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
    // Some SQLite ALTER operations create a temporary backup table (e.g. Reviews_backup)
    // If a previous alter attempt left a backup table around, it can cause UNIQUE constraint errors
    // when trying to copy rows into it. Drop such leftover backup table(s) before syncing.
    try {
      await sequelize.query('DROP TABLE IF EXISTS `Reviews_backup`');
    } catch (e) {
      // ignore drop errors and continue
    }
    // Use `alter: true` to update existing tables to match models (adds missing columns safely)
    await sequelize.sync({ force: false, alter: true });
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
