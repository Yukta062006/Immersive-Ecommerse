# System Architecture — Immersive E-Commerce

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (Vercel Edge)                     │
│                  Static Assets + ISR Cache                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Next.js 14 (Port 3000)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  App Router                                             │ │
│  │  ├─ Middleware (auth check, geolocation, A/B test)      │ │
│  │  ├─ Server Components (SSR/SSG for SEO pages)          │ │
│  │  ├─ 'use client' (animated views, Three.js, GSAP)      │ │
│  │  └─ Streaming Suspense boundaries                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Animation Layer                                        │ │
│  │  ├─ Three.js (3D intro, product viewer)                │ │
│  │  ├─ Framer Motion (page transitions, micro-interactions)│ │
│  │  ├─ GSAP ScrollTrigger (parallax, scroll reveals)      │ │
│  │  └─ Canvas 2D (particles, gradients)                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API (localhost)
┌──────────────────────────▼──────────────────────────────────┐
│                   Express API (Port 4000)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Middleware Pipeline                                     │ │
│  │  express.json → cors → helmet → rateLimiter →           │ │
│  │  validate(zod) → authenticateJWT → controller           │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Controllers                                            │ │
│  │  ├─ Auth (signup, login, logout, refresh, me)          │ │
│  │  ├─ Products (list, detail, related, categories, search)│ │
│  │  ├─ Cart (get, add, update, remove, clear)             │ │
│  │  ├─ Checkout (create-intent, confirm)                  │ │
│  │  └─ Webhook (Stripe events)                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────┬──────────────────────────┬──────────────────────┘
            │                          │
┌───────────▼──────────┐  ┌────────────▼────────────────────┐
│     MongoDB Atlas     │  │          Stripe API              │
│  ┌──────────────────┐ │  │  ┌────────────────────────────┐ │
│  │  Mongoose ODM     │ │  │  │  PaymentIntents            │ │
│  │  ├─ User          │ │  │  │  Webhooks                  │ │
│  │  ├─ Product       │ │  │  │  Customer Portal           │ │
│  │  ├─ Category      │ │  │  └────────────────────────────┘ │
│  │  ├─ Cart          │ │  └─────────────────────────────────┘
│  │  └─ Order         │ │
│  └──────────────────┘ │
└───────────────────────┘
```

## Request Flow

### Page Load (SSR)
```
Browser → GET /products?category=shoes
  → Next.js Middleware (auth, geolocation)
  → Server Component (fetch products via internal API)
  → HTML shell with SEO metadata + Open Graph
  → Streaming: Suspense boundary for animated content
  → Client Hydration (React, Framer Motion, GSAP)
```

### Authenticated Action (Add to Cart)
```
User clicks "Add to Cart"
  → Zustand store (optimistic update, UI updates instantly)
  → POST /api/cart { productId, quantity }
  → Express middleware (JWT verify, rate limit, validate)
  → Mongoose Cart.findOneAndUpdate (upsert)
  → Return { cart, itemCount }
  → Zustand confirm optimistic state (or rollback on error)
  → Animated badge update
```

### Payment Flow
```
Checkout page
  → POST /api/checkout/create-intent
  → Calculate price (subtotal, discounts, tax, shipping)
  → Create Stripe PaymentIntent
  → Create Order document (status: 'pending')
  → Return { clientSecret, orderId }
  → Stripe Elements (card input)
  → Stripe confirms payment
  → POST /api/checkout/confirm
  → Verify paymentIntent status
  → Update order to 'confirmed'
  → Decrement product stock
  → Clear user's cart
  → Send confirmation email
```

## Data Flow

### State Management
```
┌─────────────────────────────────────────────────────────────┐
│                    State Architecture                        │
├─────────────────┬───────────────┬───────────────────────────┤
│ Zustand          │ TanStack Query │ Component State           │
│ (Client)         │ (Server Cache) │ (Local)                   │
├─────────────────┼───────────────┼───────────────────────────┤
│ useAuthStore     │ products      │ form inputs               │
│ useCartStore     │ categories    │ modal open/close          │
│ useUIStore       │ cart          │ 3D scene state            │
│ (theme, cursor)  │ orders        │ animation controls        │
└─────────────────┴───────────────┴───────────────────────────┘
```

### Cache Strategy
```
TanStack Query:
  staleTime: 30s (data considered fresh)
  gcTime: 5min (garbage collect unused)
  refetchOnWindowFocus: true

Zustand:
  useAuthStore: in-memory (tokens in httpOnly cookies)
  useCartStore: localStorage persistence + server sync
  useUIStore: in-memory only
```

## Security Architecture

### Authentication Flow
```
1. Login → bcrypt.compare() → jwt.sign(accessToken, 15min) + jwt.sign(refreshToken, 7d)
2. Set httpOnly cookies (accessToken, refreshToken)
3. Subsequent requests: Cookie → jwt.verify() → attach userId to req.user
4. Token refresh: refreshToken cookie → verify → issue new accessToken
5. Auto-refresh: Client refreshes 1 minute before expiry
```

### CSRF Protection
- SameSite=Lax cookies
- Custom x-csrf-token header for state-changing operations
- Stripe webhook signature verification

### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/auth/login | 5 | 15 min |
| /api/auth/signup | 3 | 1 hour |
| /api/cart/* | 100 | 1 min |
| /api/checkout/* | 10 | 1 min |
| General | 60 | 1 min |

## Animation Architecture

### Layer Stack
```
┌─────────────────────────────────────────────────────────────┐
│                    Animation Layers                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Technology      │ Use Cases       │ Performance             │
├─────────────────┼─────────────────┼─────────────────────────┤
│ Three.js/R3F    │ 3D intro,       │ GPU-accelerated,        │
│                 │ product viewer  │ lazy-loaded             │
├─────────────────┼─────────────────┼─────────────────────────┤
│ Framer Motion   │ Page transitions│ Spring physics,         │
│                 │ micro-interact  │ AnimatePresence         │
├─────────────────┼─────────────────┼─────────────────────────┤
│ GSAP            │ Scroll effects  │ ScrollTrigger,          │
│                 │ parallax        │ horizontal scroll       │
├─────────────────┼─────────────────┼─────────────────────────┤
│ Canvas 2D       │ Background FX   │ Particle field,         │
│                 │                 │ mesh gradient           │
└─────────────────┴─────────────────┴─────────────────────────┘
```

### Performance Strategy
- **Lazy Three.js**: Dynamic import, SSR disabled
- **GPU acceleration**: will-change, transform3d for composite layers
- **Reduced motion**: prefers-reduced-motion respected
- **Visibility culling**: Pause animations when tab hidden
- **Frame budget**: 16.67ms per frame max

### Intro Animation Timeline
```
0-200ms:    Skeleton placeholder visible
200-1500ms: Brand text scales in (spring)
500-2500ms: Products orbit from edges
800-2000ms: Particles fade in
1000-1800ms: Orbital rings appear
2500-3000ms: Converge & pulse
3000-4000ms: Camera zoom + canvas fade out
4000ms+:    Page content reveals
```

## Deployment Topology

### Development
```
localhost:3000 (Next.js) → localhost:4000 (Express) → localhost:27017 (MongoDB)
```

### Production
```
┌─────────────────────────────────────────────────────────────┐
│                    Production Stack                          │
├─────────────────────────────────────────────────────────────┤
│  Frontend: Vercel (auto-deploy from main branch)           │
│  Backend: Railway / Render (Docker container)               │
│  Database: MongoDB Atlas M10+ (replica set)                │
│  CDN: Vercel Edge Network                                   │
│  Monitoring: Vercel Analytics + Sentry                      │
└─────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline
```
Push to main
  → GitHub Actions
  ├─ lint (ESLint + Prettier)
  ├─ typecheck (tsc --noEmit)
  ├─ test (Vitest unit + Cypress E2E)
  ├─ build (Next.js + Express bundle)
  └─ deploy
       ├─ Frontend → Vercel (auto)
       └─ Backend → Railway (auto)
```

## Database Design

### Relationships
```
User (1) ──── (N) Cart ──── (N) CartItem ──── (N) Product
User (1) ──── (N) Order ──── (N) OrderItem ──── (N) Product
User (N) ──── (N) Product (wishlist)
Category (1) ──── (N) Category (subcategories, self-ref)
Category (1) ──── (N) Product
```

### Indexes
```typescript
// Product (compound for filter combinations)
{ status: 1, category: 1, price: 1 }
{ status: 1, 'ratings.average': -1 }
{ name: 'text', description: 'text', tags: 'text' }

// Cart
{ user: 1 } (unique)

// Order
{ user: 1, createdAt: -1 }
{ paymentIntentId: 1 }

// User
{ email: 1 } (unique)
```

## Error Handling

### API Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { "field": "email" }
  }
}
```

### Frontend Error Boundaries
```tsx
<ErrorBoundary fallback={<PageError />}>
  <Suspense fallback={<SkeletonPage />}>
    <ProductPage />
  </Suspense>
</ErrorBoundary>
```

### Retry Logic
- Network failures: exponential backoff (1s, 2s, 4s)
- 401 errors: auto-refresh token, retry once
- 429 errors: respect Retry-After header
- 5xx errors: toast notification, manual retry

## Monitoring & Observability

### Frontend
- Vercel Analytics (Web Vitals)
- Sentry (client-side errors)
- Console logging (dev only)

### Backend
- Sentry (server-side errors)
- PM2 cluster mode
- Health check endpoint: GET /health

### Database
- MongoDB Atlas monitoring
- Slow query log (>100ms)
- Connection pool metrics