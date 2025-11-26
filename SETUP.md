# Aninaya E-Commerce Platform - Complete Setup

## Project Structure

```
aninaya-e-commerce/
├── frontend/               # React + Vite
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── backend/               # Node.js + Express + MongoDB
    ├── models/
    ├── controllers/
    ├── routes/
    ├── config/
    ├── seeds/
    ├── server.js
    └── package.json
```

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB connection string and JWT secret

# Start MongoDB service
mongod

# Seed the database with products
npm run seed

# Start the backend server
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App will run on http://localhost:5173
```

## Environment Configuration

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/aninaya
JWT_SECRET=your_secure_secret_key_here
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env or .env.local)
```
VITE_API_URL=http://localhost:5000/api
```

## Database Collections

The MongoDB database includes the following collections:

1. **users** - Customer accounts and authentication
2. **products** - Product catalog with details, images, and AR models
3. **orders** - Customer orders with status tracking
4. **carts** - Shopping cart data
5. **reviews** - Product reviews and ratings

## API Architecture

### Base URL: `http://localhost:5000/api`

**Products API**
- Get all products: `GET /products`
- Get product: `GET /products/:id`
- Search products: `GET /products/search?query=term`
- Get by category: `GET /products/category/:category`

**Users API**
- Register: `POST /users/register`
- Login: `POST /users/login`
- Get profile: `GET /users/profile` (auth required)
- Update profile: `PUT /users/profile` (auth required)

**Orders API**
- Create order: `POST /orders` (auth required)
- Get my orders: `GET /orders/my-orders` (auth required)
- Get order: `GET /orders/:id` (auth required)
- Cancel order: `PUT /orders/:id/cancel` (auth required)
- Get all orders: `GET /orders` (admin)
- Update status: `PUT /orders/:id/status` (admin)

## Features Implemented

✅ User authentication with JWT
✅ Product catalog with filtering & search
✅ Shopping cart functionality
✅ Order management & tracking
✅ Product reviews & ratings
✅ Augmented Reality (AR) model integration
✅ Multiple payment methods (COD, GCash, PayPal - placeholders)
✅ Admin controls for products and orders
✅ Responsive design with Tailwind CSS
✅ CORS-enabled API

## Technologies Used

### Frontend
- React 19
- Vite
- React Router DOM 7
- Tailwind CSS 3
- React Toastify

### Backend
- Node.js
- Express 4
- MongoDB
- Mongoose 7
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- CORS
- Dotenv

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Verify connection string in `.env`
- Check MongoDB is installed: `mongod --version`

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: `npm run dev -- --port 3000`

### CORS Errors
- Update CORS_ORIGIN in backend `.env`
- Ensure frontend URL matches

### Seed Database Fails
- Ensure MongoDB is connected
- Check MongoDB URI in `.env`
- Try: `npm run seed`

## Default Data

The database is seeded with 10+ sample crochet products including:
- Coasters, Keychains, Pillows
- Scarves, Bags, Bonnets
- Decorations, Bouquets
- Complete product details with images and AR models

## Next Steps

1. Configure payment gateway integration
2. Add email notifications
3. Implement file uploads for admin dashboard
4. Add analytics and monitoring
5. Deploy to production (Vercel/Netlify for frontend, Heroku/Render for backend)
6. Set up CI/CD pipeline
7. Add comprehensive testing

## Support

For detailed setup instructions, see:
- Backend: `/backend/README.md`
- API Documentation: `/backend/README.md` (API Endpoints section)

## License

All rights reserved - Aninaya E-Commerce Platform 2025
