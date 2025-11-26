import { connectDB } from '../config/database.js';
import Product from '../models/Product.js';

const products = [
  { name: "MonoStitch", price: 50, category: "Decor", subCategory: "Coasters", image: ["p_img1.png"], bestseller: true, stock: 50, description: "Simple yet elegant" },
  { name: "Sunflower", price: 50, category: "Decor", subCategory: "Coasters", image: ["p_img3.png"], bestseller: false, stock: 100, description: "Hand-crocheted coaster" },
  { name: "Octopus Keychain", price: 150, category: "Accessories", subCategory: "Keychains", image: ["p_img6.png"], bestseller: false, stock: 60, description: "Cute octopus keychain" },
  { name: "Mini Octopus", price: 100, category: "Accessories", subCategory: "Keychains", image: ["p_img7.png"], bestseller: false, stock: 75, description: "Mini octopus charm" },
  { name: "Paw Keychain", price: 100, category: "Accessories", subCategory: "Keychains", image: ["p_img8.png"], bestseller: false, stock: 55, description: "Paw keychain", modelUrl: "/models/catpaw.glb" },
  { name: "Crochet Bouquets", price: 300, category: "Decor", subCategory: "Bouquets", image: ["p_img9.png"], bestseller: true, stock: 35, description: "Handmade bouquets" },
  { name: "Bouquets V2", price: 300, category: "Decor", subCategory: "Bouquets", image: ["p_img10.png"], bestseller: true, stock: 42, description: "Bouquet variant" },
  { name: "Bini Keychain", price: 150, category: "Accessories", subCategory: "Keychains", image: ["p_img11.png"], bestseller: false, stock: 45, description: "Bini phone charm" },
  { name: "Frog Coaster", price: 200, category: "Decor", subCategory: "Coasters", image: ["p_img12.png"], bestseller: false, stock: 55, description: "Playful frog coaster" },
  { name: "Crochet Tulip Bouquet", price: 200, category: "Decor", subCategory: "Bouquets", image: ["p_img14.png"], bestseller: true, stock: 38, description: "Tulip bouquet", modelUrl: "/models/tulip.glb" },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Product.truncate();
    const result = await Product.bulkCreate(products);
    console.log(`✅ ${result.length} products seeded!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
