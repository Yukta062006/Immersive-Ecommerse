# API Reference — Immersive E-Commerce

Base URL: `http://localhost:4000/api`

## Authentication

All authenticated endpoints require either:
- `Authorization: Bearer <token>` header
- `accessToken` httpOnly cookie (set automatically on login)

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 24, "total": 100, "totalPages": 5 }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { "field": "email", "reason": "Invalid format" }
  }
}
```

---

## Auth Endpoints

### POST `/auth/signup`

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6650a1b2c3d4e5f6a7b8c9d0",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Cookies Set:**
- `accessToken`: httpOnly, Secure, SameSite=Lax, MaxAge=15min
- `refreshToken`: httpOnly, Secure, SameSite=Lax, MaxAge=7d, path=/api/auth/refresh

---

### POST `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "avatar": "...",
      "addresses": [...]
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Rate Limit:** 5 requests / 15 minutes per IP

---

### POST `/auth/logout`

Clears authentication cookies.

**Response (200):**
```json
{ "success": true, "data": null }
```

---

### POST `/auth/refresh`

Refresh access token using refreshToken cookie.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### GET `/auth/me`

Get current authenticated user.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "wishlist": ["productId1"],
      "addresses": [...]
    }
  }
}
```

---

## Product Endpoints

### GET `/products`

List products with filtering.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — | Full-text search |
| `category` | string | — | Category slug |
| `minPrice` | number | — | Min price (cents) |
| `maxPrice` | number | — | Max price (cents) |
| `minRating` | number | — | Min average rating |
| `sort` | string | `newest` | `price-asc`, `price-desc`, `rating`, `newest`, `popular` |
| `page` | number | `1` | Page number |
| `limit` | number | `24` | Items per page (max 48) |
| `featured` | boolean | — | Featured only |

**Example:**
```
GET /api/products?category=electronics&minPrice=10000&sort=price-asc&page=2
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "Wireless Headphones Pro",
        "slug": "wireless-headphones-pro-abc123",
        "price": 7999,
        "compareAtPrice": 9999,
        "images": [{ "url": "...", "alt": "...", "width": 800, "height": 800 }],
        "category": { "_id": "...", "name": "Headphones", "slug": "headphones" },
        "ratings": { "average": 4.5, "count": 234 },
        "stock": 45,
        "isOnSale": true,
        "discountPercent": 20,
        "inStock": true
      }
    ],
    "total": 120,
    "page": 2,
    "totalPages": 5
  }
}
```

---

### GET `/products/:id`

Get single product by ID or slug.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "...",
      "name": "Wireless Headphones Pro",
      "slug": "wireless-headphones-pro-abc123",
      "description": "Premium wireless headphones...",
      "longDescription": "Full description...",
      "price": 7999,
      "compareAtPrice": 9999,
      "sku": "WHP-001",
      "images": [...],
      "variants": [
        {
          "_id": "...",
          "name": "Black / One Size",
          "sku": "WHP-001-BLK",
          "price": 7999,
          "stock": 30,
          "options": { "color": "Black", "size": "One Size" }
        }
      ],
      "category": { "_id": "...", "name": "Headphones", "slug": "headphones" },
      "ratings": {
        "average": 4.5,
        "count": 234,
        "distribution": { "1": 5, "2": 10, "3": 30, "4": 80, "5": 109 }
      },
      "tags": ["wireless", "bluetooth"],
      "stock": 45,
      "seoTitle": "Wireless Headphones Pro",
      "seoDescription": "Premium wireless headphones..."
    }
  }
}
```

---

### GET `/products/:id/related`

**Query:** `?limit=8`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      { "_id": "...", "name": "...", "price": 4999, "images": [...], "ratings": {...} }
    ]
  }
}
```

---

### GET `/categories`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "_id": "...",
        "name": "Electronics",
        "slug": "electronics",
        "image": "https://...",
        "productCount": 156,
        "subcategories": [
          { "_id": "...", "name": "Laptops", "slug": "laptops", "productCount": 45 }
        ]
      }
    ]
  }
}
```

---

### GET `/search`

**Query:** `?q=wireless&limit=10`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": ["wireless headphones", "wireless mouse"],
    "products": [
      { "_id": "...", "name": "...", "slug": "...", "price": 7999, "thumbnail": "..." }
    ]
  }
}
```

---

## Cart Endpoints

All cart endpoints require authentication.

### GET `/cart`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "...",
      "items": [
        {
          "_id": "cartItem123",
          "product": {
            "_id": "...",
            "name": "Wireless Headphones Pro",
            "images": [{ "url": "..." }],
            "stock": 45,
            "inStock": true
          },
          "variant": { "_id": "...", "name": "Black / One Size" },
          "quantity": 2,
          "price": 7999
        }
      ],
      "itemCount": 2,
      "subtotal": 15998
    }
  }
}
```

---

### POST `/cart`

**Request:**
```json
{
  "productId": "6650a1b2c3d4e5f6a7b8c9d0",
  "variantId": "6650a1b2c3d4e5f6a7b8c9d1",
  "quantity": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cart": { ... },
    "itemCount": 3
  }
}
```

---

### PATCH `/cart/:itemId`

**Request:**
```json
{ "quantity": 3 }
```

---

### DELETE `/cart/:itemId`

---

### DELETE `/cart`

Clear entire cart.

---

## Checkout Endpoints

### POST `/checkout/create-intent`

**Request:**
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "line1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  },
  "shippingMethod": "standard",
  "promoCodes": ["SUMMER20"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_..._secret_...",
    "orderId": "...",
    "orderSummary": {
      "subtotal": 15998,
      "discounts": [{ "code": "SUMMER20", "amount": 3200 }],
      "tax": 1024,
      "shipping": 0,
      "total": 13822
    }
  }
}
```

---

### POST `/checkout/confirm`

**Request:**
```json
{
  "orderId": "...",
  "paymentIntentId": "pi_..."
}
```

---

### POST `/webhook/stripe`

Stripe webhook handler (no auth — signature verification).

**Events handled:**
- `payment_intent.succeeded` — Confirm order, decrement stock, clear cart
- `payment_intent.payment_failed` — Mark order as failed

---

### GET `/orders`

**Query:** `?page=1&limit=10&status=confirmed`

---

### GET `/orders/:id`

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 | 15 min |
| `/api/auth/signup` | 3 | 1 hour |
| `/api/cart/*` | 100 | 1 min |
| `/api/checkout/*` | 10 | 1 min |
| General API | 60 | 1 min |

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `AUTH_REQUIRED` | 401 | No authentication |
| `AUTH_EXPIRED` | 401 | Token expired |
| `AUTH_INVALID` | 401 | Invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `STOCK_INSUFFICIENT` | 409 | Out of stock |
| `PAYMENT_FAILED` | 402 | Payment failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |