# Development Setup Guide

## Prerequisites

- **Node.js 18+** (recommended: 20 LTS)
- **npm** or **pnpm** (recommended: pnpm)
- **MongoDB** (local installation or MongoDB Atlas)
- **Stripe account** (for payment testing)

## 1. Clone & Install

```bash
# Navigate to project
cd projects/sandbox/new-project

# Install backend dependencies
cd backend
cp .env.example .env
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Environment Configuration

### Backend `.env`

```env
# Server
PORT=4000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/immersive-ecommerce

# JWT (generate strong secrets for production)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 3. Database Setup

### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start the service: `mongod`
3. Connection string: `mongodb://localhost:27017/immersive-ecommerce`

### Option B: MongoDB Atlas (Recommended)

1. Create account at cloud.mongodb.com
2. Create a free M0 cluster
3. Get connection string from "Connect" → "Connect your application"
4. Replace `MONGODB_URI` in `.env`

## 4. Seed Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin user**: `admin@ecomm.com` / `admin123`
- **6 categories**: Electronics, Clothing, Home, Sports, Books, Accessories
- **24+ products** with variants, ratings, images

## 5. Start Development Servers

Open two terminals:

```bash
# Terminal 1: Backend (port 4000)
cd backend
npm run dev

# Terminal 2: Frontend (port 3000)
cd frontend
npm run dev
```

## 6. Open Browser

Navigate to: **http://localhost:3000**

You should see:
1. Three.js intro animation (3-5 seconds)
2. Home page with featured products
3. Interactive UI with animations on every element

## 7. Test the Flow

1. **Browse products**: Click "Shop Now" or navigate to /products
2. **View product**: Click any product card → detailed view with 3D viewer
3. **Add to cart**: Select options → click "Add to Cart"
4. **Checkout**: Login → go to cart → click "Checkout"
5. **Payment**: Use Stripe test card: `4242 4242 4242 4242`

## Stripe Test Cards

| Card | Behavior |
|------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 9995` | Declined |

Use any future expiry, any CVC, any postal code.

## Project Structure

```
new-project/
├── frontend/                 # Next.js 14 App
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   │   ├── layout.tsx   # Root layout
│   │   │   ├── page.tsx     # Home
│   │   │   ├── products/    # Product listing
│   │   │   ├── cart/        # Shopping cart
│   │   │   ├── checkout/    # Checkout flow
│   │   │   └── auth/        # Login/Signup
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Primitives (Button, Card, Input...)
│   │   │   ├── effects/     # Visual effects (Particles, Gradient...)
│   │   │   ├── layout/      # Navbar, Footer
│   │   │   ├── product/     # ProductCard, Gallery...
│   │   │   ├── cart/        # CartDrawer, CartItem...
│   │   │   ├── checkout/    # CheckoutProgress, Forms...
│   │   │   ├── auth/        # LoginForm, SignupForm...
│   │   │   └── three/       # IntroScene, ProductViewer3D
│   │   ├── stores/          # Zustand state management
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities & API client
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── server.ts        # Entry point
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── middleware/       # Auth, validation, errors
│   │   ├── schemas/         # Zod validation
│   │   ├── utils/           # Helpers
│   │   └── seeds/           # Seed data
│   └── package.json
│
└── docs/                     # Documentation
    ├── API.md               # API reference
    ├── SETUP.md             # This file
    └── ARCHITECTURE.md      # System design
```

## Common Issues

### MongoDB Connection Error
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** Ensure MongoDB is running. On macOS: `brew services start mongodb-community`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```
**Fix:** Kill the process using the port: `lsof -ti:4000 | xargs kill -9`

### Three.js Not Loading
**Fix:** Ensure `@react-three/fiber` and `@react-three/drei` are installed. Check browser console for WebGL errors.

### Stripe Webhook Not Working
**Fix:** Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:4000/api/webhook/stripe
```

## Useful Commands

```bash
# Backend
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run seed         # Seed database
npm run typecheck    # Check TypeScript types
npm run lint         # Run ESLint

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Production Deployment

See [ARCHITECTURE.md](ARCHITECTURE.md) for deployment topology and CI/CD pipeline.