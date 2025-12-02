import { connectDB } from '../config/database.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const backfill = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — starting backfill');

    const orders = await Order.findAll();
    console.log(`Found ${orders.length} orders`);

    let updated = 0;

    for (const ord of orders) {
      let items = Array.isArray(ord.items) ? ord.items : JSON.parse(ord.items || '[]');
      let changed = false;

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        // Skip if item already has image
        if (it.image && ((Array.isArray(it.image) && it.image.length) || typeof it.image === 'string')) continue;

        // Try product lookup by productId or id
        const prodId = it.productId || it.id || it._id;
        if (!prodId) continue;

        const product = await Product.findByPk(prodId);
        if (product && product.image && ((Array.isArray(product.image) && product.image.length) || typeof product.image === 'string')) {
          items[i] = { ...it, image: product.image };
          changed = true;
        }
      }

      if (changed) {
        await ord.update({ items });
        updated++;
        console.log(`Backfilled order ${ord.id}`);
      }
    }

    console.log(`Backfill complete — updated ${updated} orders`);
    process.exit(0);
  } catch (err) {
    console.error('Backfill error:', err.message || err);
    process.exit(1);
  }
};

backfill();
