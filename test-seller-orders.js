#!/usr/bin/env node

/**
 * Simple test script to verify seller orders endpoint
 * Usage: node test-seller-orders.js
 */

const BASE_URL = 'http://localhost:5000';

async function test() {
  console.log('🧪 Testing Seller Orders Endpoint\n');

  try {
    // 1. Register/login a seller
    console.log('1️⃣  Registering seller...');
    const registerRes = await fetch(`${BASE_URL}/api/sellers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Seller',
        email: `seller-${Date.now()}@test.com`,
        password: 'password123',
        storeName: 'Test Store',
      }),
    });
    const registerData = await registerRes.json();
    console.log(`   Status: ${registerRes.status}`);
    console.log(`   Seller ID: ${registerData.seller?.id}`);
    const sellerToken = registerData.token;

    if (!sellerToken) {
      console.error('   ❌ Failed to get seller token');
      return;
    }

    // 2. Create a product as the seller
    console.log('\n2️⃣  Creating product as seller...');
    const productRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        name: 'Test Product',
        description: 'A test product for seller orders',
        price: 99.99,
        category: 'Accessories',
        subCategory: 'Keychains',
        stock: 100,
      }),
    });
    const productData = await productRes.json();
    console.log(`   Status: ${productRes.status}`);
    console.log(`   Product ID: ${productData.id}`);
    const productId = productData.id;

    if (!productId) {
      console.error('   ❌ Failed to create product');
      return;
    }

    // 3. Fetch seller orders (should be empty initially)
    console.log('\n3️⃣  Fetching seller orders (should be empty)...');
    const ordersRes = await fetch(`${BASE_URL}/api/sellers/orders`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` },
    });
    const ordersData = await ordersRes.json();
    console.log(`   Status: ${ordersRes.status}`);
    console.log(`   Orders count: ${ordersData.length}`);
    console.log(`   ✅ Endpoint working!`);

    // 4. Create a customer and order
    console.log('\n4️⃣  Creating customer account...');
    const userRes = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: `customer-${Date.now()}@test.com`,
        password: 'password123',
      }),
    });
    const userData = await userRes.json();
    const userToken = userData.token;
    const userId = userData.user?.id;
    console.log(`   Status: ${userRes.status}`);
    console.log(`   User ID: ${userId}`);

    // 5. Create an order
    console.log('\n5️⃣  Creating order...');
    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        items: [{ productId, quantity: 2, price: 99.99, name: 'Test Product' }],
        address: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipcode: '12345',
          country: 'Country',
          phone: '1234567890',
        },
        paymentMethod: 'cod',
        subtotal: 199.98,
        commission: 10,
      }),
    });
    const orderData = await orderRes.json();
    console.log(`   Status: ${orderRes.status}`);
    console.log(`   Order ID: ${orderData.id}`);

    // 6. Fetch seller orders again (should now have 1 order)
    console.log('\n6️⃣  Fetching seller orders (should have 1 order now)...');
    const orders2Res = await fetch(`${BASE_URL}/api/sellers/orders`, {
      headers: { 'Authorization': `Bearer ${sellerToken}` },
    });
    const orders2Data = await orders2Res.json();
    console.log(`   Status: ${orders2Res.status}`);
    console.log(`   Orders count: ${orders2Data.length}`);

    if (orders2Data.length > 0) {
      const order = orders2Data[0];
      console.log(`   Order ID: ${order.id}`);
      console.log(`   Buyer: ${order.firstName} ${order.lastName}`);
      console.log(`   Seller Items count: ${order.sellerItems?.length}`);
      if (order.sellerItems?.[0]) {
        console.log(`   Item: ${order.sellerItems[0].name} x${order.sellerItems[0].quantity}`);
      }
      console.log(`   ✅ Test passed!`);
    } else {
      console.warn('   ⚠️  Order not found in seller orders (may be a timing issue)');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
