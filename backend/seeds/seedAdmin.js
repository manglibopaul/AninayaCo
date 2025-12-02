import { connectDB } from '../config/database.js';
import User from '../models/User.js';

const seedAdmin = async () => {
  try {
    await connectDB();
    const [user] = await User.findOrCreate({
      where: { email: 'admin@aninaya.co' },
      defaults: { name: 'Admin', password: 'admin123', isAdmin: true },
    });
    if (!user.isAdmin) {
      await user.update({ isAdmin: true });
    }
    console.log('✅ Admin seeded:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ SeedAdmin error:', err.message);
    process.exit(1);
  }
};

seedAdmin();
