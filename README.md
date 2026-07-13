# E-Commerce Website

## 🛒 Immersive E-Commerce Store

A full-stack e-commerce website built with React (Next.js), Node.js (Express), and MongoDB. Features user authentication, product filtering, shopping cart, and Razorpay payment integration.

### 🔗 Live Demo
- **Frontend:** https://frontend-sage-one-9ek0484718.vercel.app
- **Backend API:** https://backend-lilac-seven-64.vercel.app/api

### ✨ Features
- 📦 65+ products across 6 categories (Electronics, Clothing, Home, Sports, Books, Accessories)
- 🔐 User authentication (signup, login, JWT tokens)
- 🛍️ Shopping cart with add/remove/update quantity
- 💳 Razorpay payment integration (test mode)
- 🔍 Product filtering by category, price, rating
- 📱 Fully responsive design
- 🌙 Dark mode support
- 🎨 Immersive animations (Framer Motion, Three.js intro)
- 🔑 OAuth ready (Google & GitHub - just add API keys)

### 🛠️ Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion, Three.js, Zustand
- **Backend:** Express.js, TypeScript, MongoDB (Mongoose), JWT, Razorpay SDK
- **Database:** MongoDB Atlas
- **Deployment:** Vercel (Frontend + Backend)

### 📁 Project Structure
```
├── frontend/          # Next.js frontend application
│   ├── src/app/       # Pages (App Router)
│   ├── src/components/# React components
│   ├── src/stores/    # Zustand state management
│   └── src/lib/       # API client, utilities
├── backend/           # Express.js API server
│   ├── src/controllers/  # Route handlers
│   ├── src/models/       # Mongoose models
│   ├── src/routes/       # API routes
│   ├── src/middleware/   # Auth, validation, rate limiting
│   └── src/config/       # Environment configuration
└── docs/              # Architecture documentation
```

### 🚀 How to Run Locally

1. **Prerequisites:** Node.js 18+, MongoDB (local or Atlas)

2. **Backend:**
```bash
cd backend
cp .env.example .env  # Edit with your credentials
npm install
npm run dev
```

3. **Frontend:**
```bash
cd frontend
cp .env.local.example .env.local  # Edit with your API URL
npm install
npm run dev
```

4. **Seed Database:**
```bash
cd backend
echo "yes" | npx tsx src/seeds/index.ts
```

### 🧪 Test Credentials
- **Admin Login:** admin@ecomm.com / admin123
- **Razorpay Test Payment:** UPI → `success@razorpay` | Card → `4111 1111 1111 1111`

### 📝 Internship Info
- **Organization:** CodSoft
- **Domain:** Web Development
- **Level:** Level 3
- **Task:** Task 1 - E-Commerce Website

---
*Built as part of CodSoft Web Development Internship*
