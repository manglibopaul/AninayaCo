import fs from 'fs';
import path from 'path';
import { connectDB } from '../config/database.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const argv = process.argv.slice(2);
const doFix = argv.includes('--fix');
const fileArg = argv.find(a => a.startsWith('--file='));
const specifiedFile = fileArg ? fileArg.split('=')[1] : null;

const uploadsDir = path.join(new URL(import.meta.url).pathname.replace('/file:',''), '../../uploads/images');

const relativeUploadPath = (filename) => `/uploads/images/${filename}`;

const findFirstUpload = () => {
  try {
    const dir = path.join(process.cwd(), 'uploads', 'images');
    const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    return files.length ? files[0] : null;
  } catch (err) {
    return null;
  }
};

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — scanning orders');

    const orders = await Order.findAll();
    let totalMissing = 0;
    const missingDetails = [];

    for (const ord of orders) {
      let items = Array.isArray(ord.items) ? ord.items : JSON.parse(ord.items || '[]');
      let changed = false;
      const missingInOrder = [];

      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const hasImage = it.image && ((Array.isArray(it.image) && it.image.length) || typeof it.image === 'string');
        if (!hasImage) {
          totalMissing++;
          missingInOrder.push({ index: i, productId: it.productId || it.id || it._id || null, name: it.name || null });

          if (doFix) {
            // determine file to use
            let useFile = specifiedFile;
            if (!useFile) useFile = findFirstUpload();
            if (useFile) {
              items[i] = { ...it, image: [relativeUploadPath(useFile)] };
              changed = true;
            }
          }
        }
      }

      if (missingInOrder.length) {
        missingDetails.push({ orderId: ord.id, missing: missingInOrder });
      }

      if (doFix && changed) {
        await ord.update({ items });
        console.log(`Updated order ${ord.id}`);
      }
    }

    console.log(`Found ${totalMissing} missing item images across ${missingDetails.length} orders.`);
    if (missingDetails.length) console.dir(missingDetails, { depth: null });
    if (doFix) console.log('Fix completed.');
    process.exit(0);
  } catch (err) {
    console.error('Error scanning orders:', err.message || err);
    process.exit(1);
  }
};

run();
