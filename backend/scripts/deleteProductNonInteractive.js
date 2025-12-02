#!/usr/bin/env node
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';

dotenv.config();

const nameArg = process.argv[2];
if (!nameArg) {
  console.error('Usage: node deleteProductNonInteractive.js "Product Name"');
  process.exit(1);
}

const run = async () => {
  try {
    await connectDB();
    const products = await Product.findAll({ where: { name: { [Op.like]: `%${nameArg}%` } } });
    if (!products || products.length === 0) {
      console.log(`No products found matching: ${nameArg}`);
      process.exit(0);
    }

    console.log(`Found ${products.length} product(s):`);
    products.forEach(p => console.log(`- id=${p.id} name="${p.name}" sellerId=${p.sellerId}`));

    for (const p of products) {
      await p.destroy();
      console.log(`Deleted product id=${p.id} name="${p.name}"`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error deleting product:', err);
    process.exit(1);
  }
};

run();
