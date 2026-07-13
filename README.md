<div align="center">

# 🛍️ Immersive E-Commerce

**A visually rich, full-stack e-commerce platform with 3D product previews, fluid animations, and a production-grade backend.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![Three.js](https://img.shields.io/badge/Three.js-0.184-black?logo=threedotjs)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-02042B)](https://razorpay.com)

</div>

---

## ✨ What Makes It Immersive

- **3D intro scene** — Three.js/React Three Fiber animated entry on first visit (session-cached)
- **3D product viewer** — Rotate and inspect products in real time with hotspot annotations
- **Fluid motion** — Framer Motion page transitions, GSAP scroll parallax, Canvas 2D ambient backgrounds
- **Dark / light mode** — Flash-free system-preference detection via `next-themes`
- **Magnetic & glass UI** — Magnetic buttons, glassmorphism cards, stagger reveals, scroll-triggered animations
- **Full checkout** — 3-step flow with Razorpay payment integration and webhook verification

---

## 🖥️ Pages

| Route | Description |
|---|---|
| `/` | Animated landing — 3D intro, hero, brand ticker, categories, trending, lookbook, testimonials |
| `/products` | Product listing with filters (category, price, color, brand, sort) |
| `/products/[id]` | Product detail — image gallery, 3D viewer, color swatches, size selector, reviews |
| `/cart` | Cart with quantity controls, summary, and promo code input |
| `/checkout` | 3-step checkout: Shipping → Payment (Razorpay) → Confirmation |
| `/auth/login` | Login with email/password + Google & GitHub OAuth |
| `/auth/signup` | Registration form |
| `/account` | User account and order history |
| `/docs/[slug]` | Documentation pages (dynamic route, 10 articles) |

---

## 🏗️ Architecture

```
Immersive-Ecommerse/
├── frontend/                    # Next.js 16 App Router
│   └── src/
│       ├── app/                 # Pages & layouts
│       │   ├── page.tsx         # Home (3D intro, hero, sections)
│       │   ├── products/        # Listing + detail pages
│       │   ├── cart/            # Cart page
│       │   ├── checkout/        # 3-step checkout
│       │   ├── auth/            # Login & signup
│       │   ├── account/         # User dashboard
│       │   └── docs/[slug]/     # Docs dynamic route
│       ├── components/
│       │   ├── three/           # Three.js — IntroScene, ProductViewer3D, ProductModel, Hotspot
│       │   ├── effects/         # AmbientBackground, ParallaxSection
│       │   ├── product/         # ProductCard, Grid, Filters, Gallery, Reviews, QuickView
│       │   ├── cart/            # CartDrawer, CartItem, CartSummary
│       │   ├── checkout/        # CheckoutProgress, ShippingForm, PaymentForm
│       │   ├── auth/            # LoginForm, SignupForm
│       │   ├── layout/          # Navbar, Footer, PageTransition
│       │   └── ui/              # AnimatedButton, GlassCard, MagneticButton, Toast, RatingStars…
│       ├── stores/              # Zustand — useAuthStore, useCartStore, useUIStore, useWishlistStore
│       ├── hooks/               # useAuth, useScrollReveal, useReducedMotion
│       ├── lib/                 # api.ts (axios), queryClient.ts, utils.ts
│       └── types/               # Product, Cart, Order, User TypeScript types
│
├── backend/                     # Express + TypeScript API
│   └── src/
│       ├── controllers/         # auth, cart, checkout, oauth, product, webhook
│       ├── models/              # User, Product, Category, Cart, Order (Mongoose)
│       ├── routes/              # auth, oauth, products, cart, checkout, orders, webhooks
│       ├── middleware/          # JWT auth, rate limit, zod validation, error handler
│       ├── schemas/             # Zod validation schemas
│       ├── lib/                 # mongoose.ts, razorpay.ts
│       ├── utils/               # ApiError, asyncHandler, jwt helpers
│       └── seeds/               # Database seeder
│
└── docs/                        # API.md, ARCHITECTURE.md, SETUP.md
```

---

## ⚙️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16 | App Router, SSR, SSG |
| [React](https://react.dev) | 19 | UI framework |
| [TypeScript](https://typescriptlang.org) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling |
| [Three.js](https://threejs.org) + [@react-three/fiber](https://r3f.docs.pmnd.rs) | 0.184 / 9 | 3D intro & product viewer |
| [@react-three/drei](https://github.com/pmndrs/drei) | 10 | Three.js helpers (hotspots, controls) |
| [Framer Motion](https://www.framer.com/motion/) | 12 | Page transitions, micro-interactions |
| [GSAP](https://gsap.com) | 3 | Scroll parallax, scroll triggers |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | Client state (auth, cart, UI, wishlist) |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state, caching, background refetch |
| [Axios](https://axios-http.com) | 1 | HTTP client with auto token refresh |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4 | Dark/light mode without flash |
| [Lucide React](https://lucide.dev) | 1 | Icon set |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| [Express](https://expressjs.com) | 4 | REST API server |
| [TypeScript](https://typescriptlang.org) | 5 | Type safety |
| [MongoDB Atlas](https://mongodb.com) + [Mongoose](https://mongoosejs.com) | 8 | Database + ODM |
| [Razorpay](https://razorpay.com) | 2 | Payment processing + webhooks |
| [JWT](https://jwt.io) (jsonwebtoken) | 9 | Access + refresh tokens in httpOnly cookies |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2 | Password hashing |
| [Zod](https://zod.dev) | 3 | Runtime request validation |
| [Helmet](https://helmetjs.github.io) | 7 | Security headers |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | 7 | Per-route rate limiting |
| [tsx](https://github.com/privatenumber/tsx) | 4 | TypeScript execution in dev |

---

## 🎬 Animation System

Three independent animation layers work together for the immersive experience:

| Layer | Technology | Used For |
|---|---|---|
| 3D Scenes | Three.js + React Three Fiber | Intro animation, product 3D viewer |
| Page & UI motion | Framer Motion | Page transitions, hover, scroll reveals |
| Scroll effects | GSAP ScrollTrigger | Parallax, horizontal scroll, section reveals |
| Ambient FX | Canvas 2D | Particle fields, mesh gradients, ambient glow |

### 3D Intro Timeline (first visit only)
```
0–200ms     Skeleton placeholder visible
200–1500ms  Brand text scales in (spring physics)
500–2500ms  Products orbit in from edges
800–2000ms  Particles fade in
1000–1800ms Orbital rings appear
2500–3000ms Converge & pulse
3000–4000ms Camera zoom + canvas fade out
4000ms+     Page content reveals with stagger
```

> Stored in `sessionStorage` so the intro only plays once per session.

---

## 🗄️ Database Schema

```
User       — email, name, passwordHash, role, oauthProvider, oauthId, createdAt
Product    — name, slug, description, price, compareAtPrice, category (ref),
             images[], variants[{ sku, price, stock, options }],
             ratings{ average, count }, tags[], featured, stock, status
Category   — name, slug, parent (self-ref tree)
Cart       — user (1:1 unique), items[{ product, variant, quantity }]
Order      — user, items[], status, paymentIntentId,
             shipping{ address }, totals{ subtotal, tax, shipping, total }
```

### Indexes
```typescript
// Product — compound for filter combos
{ status: 1, category: 1, price: 1 }
{ status: 1, 'ratings.average': -1 }
{ name: 'text', description: 'text', tags: 'text' }  // full-text search

{ user: 1 }            // Cart — unique per user
{ user: 1, createdAt: -1 }  // Order history
{ paymentIntentId: 1 } // Order — payment lookup
{ email: 1 }           // User — unique
```

---

## 🔐 Security

| Concern | Solution |
|---|---|
| Auth tokens | httpOnly cookies, 15-min access + 7-day refresh |
| OAuth | PKCE flow, state param signed with `OAUTH_STATE_SECRET` |
| Passwords | bcrypt with salt rounds |
| API abuse | Per-endpoint rate limits (login: 5/15min, signup: 3/hr, general: 60/min) |
| Request validation | Zod schemas on all incoming bodies |
| Security headers | Helmet middleware |
| CSRF | SameSite=Lax cookies + x-csrf-token header |
| Payments | Razorpay signature verification on every webhook |

---

## 💳 Payment Flow (Razorpay)

```
1. User clicks "Pay Now"
2. POST /api/checkout/create-intent
   → Calculate subtotal, discounts, tax, shipping
   → Create Razorpay Order
   → Create Order in DB (status: pending)
   → Return { razorpayOrderId, amount, currency }
3. Razorpay checkout opens (in-browser SDK)
4. User completes payment
5. POST /api/checkout/confirm
   → Verify payment signature (HMAC-SHA256)
   → Update order → confirmed
   → Decrement product stock
   → Clear cart
6. User sees confirmation page
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB (local) or [MongoDB Atlas](https://cloud.mongodb.com) (free tier)
- Razorpay test keys from [dashboard.razorpay.com](https://dashboard.razorpay.com/app/keys)
- Google + GitHub OAuth apps (optional, for social login)

### 1. Clone

```bash
git clone https://github.com/navin-shanke/Immersive-Ecommerse.git
cd Immersive-Ecommerse
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed      # seed sample products & categories
npm run dev       # → http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
npm run dev       # → http://localhost:3000
```

---

## 🔧 Environment Variables

### `backend/.env`

```env
PORT=4000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/immersive-ecommerce

JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Razorpay — https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Google OAuth — https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth — https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

OAUTH_STATE_SECRET=random-signing-string
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 📡 API Quick Reference

Base URL: `http://localhost:4000/api`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register with email + password |
| POST | `/auth/login` | Login — sets httpOnly cookies |
| POST | `/auth/logout` | Clear session cookies |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Current user (requires auth) |
| GET | `/auth/google` | Google OAuth redirect |
| GET | `/auth/github` | GitHub OAuth redirect |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/products` | List with filter, sort, paginate |
| GET | `/products/:id` | Product detail |
| GET | `/products/:id/related` | Related products |
| GET | `/products/categories` | All categories |
| GET | `/products/search?q=` | Full-text search |

### Cart (auth required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get cart |
| POST | `/cart` | Add item |
| PATCH | `/cart/:itemId` | Update quantity |
| DELETE | `/cart/:itemId` | Remove item |
| DELETE | `/cart` | Clear cart |

### Checkout & Orders (auth required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/checkout/create-intent` | Create Razorpay order |
| POST | `/checkout/confirm` | Verify + confirm payment |
| GET | `/orders` | Order history |
| GET | `/orders/:id` | Order detail |
| POST | `/webhook/razorpay` | Payment webhook (signature-verified) |
| GET | `/health` | Health check |

> Full reference in [`docs/API.md`](docs/API.md)

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend && vercel --prod
# Set NEXT_PUBLIC_API_URL in Vercel dashboard
```

### Backend → Railway / Render

Connect your GitHub repo and set all `backend/.env` variables in the platform dashboard.

### Database → MongoDB Atlas

Create a free M0 cluster, whitelist your backend IP, and paste the connection string as `MONGODB_URI`.

---

## 🎨 Design Tokens

```css
/* Light */
--primary:    #4f46e5   /* Indigo 600 */
--background: #ffffff
--muted:      #f9fafb
--border:     #e5e7eb

/* Dark */
--primary:    #6366f1   /* Indigo 500 */
--background: #0a0a0a
--muted:      #18181b
--border:     #27272a
```

**Typography:** Geist Sans (body), Geist Mono (code) — Next.js built-in font optimization

---

## 📄 License

MIT © [navin-shanke](https://github.com/navin-shanke)
