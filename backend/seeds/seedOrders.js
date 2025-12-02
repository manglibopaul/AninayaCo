import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const seed = async () => {
  try {
    await connectDB();

    // Create or find a test user
    const [user] = await User.findOrCreate({
      where: { email: 'test@aninaya.co' },
      defaults: { name: 'Test User', password: 'password123' },
    });

    // Find a product to reference in the order items
    const product = await Product.findOne();
    const item = product ? {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || [],
    } : {
      name: 'Sample Product',
      price: 100,
      quantity: 1,
      image: ['/uploads/sample.png']
    };

    // Create an order for the test user
    const order = await Order.create({
      userId: user.id,
      items: [item],
      firstName: 'Test',
      lastName: 'User',
      email: 'test@aninaya.co',
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipcode: '0000',
      country: 'Testland',
      phone: '0000000000',
      subtotal: item.price,
      commission: 0,
      shippingFee: 40,
      total: item.price + 40,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'processing'
    });

    console.log('✅ Seeded test user and order:', { userId: user.id, orderId: order.id });
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
