# Admin Dashboard Design

**Date:** 2026-08-08
**Status:** Approved
**Scope:** Production admin panel for the Immersive e-commerce platform — real Laravel data only, no mocks.

## 1. Objective

Build a production-quality admin dashboard at `/admin` with full management for orders and customers, dedicated analytics and settings pages, and a richer overview dashboard. Same visual identity as the storefront, real backend data only, proper empty states when data is unavailable.

Core modules to include in this push:

- Dashboard (aggregate overview)
- Products + Categories (existing — extend, do not break)
- Orders (list + detail + status management)
- Customers (list + detail, view-only)
- Analytics (dedicated page)
- Settings (structured store/profile/security settings)
- Authentication (existing login)

All data flows from Laravel endpoints. No mock data anywhere.

**Hard rule — server-side authority:** every admin metric derives from Laravel Eloquent queries against MySQL. React never computes a business metric (revenue, AOV, growth deltas, totals, top products, aggregations) that belongs on the server. The React layer renders only what an endpoint returns. The existing client-side dashboard aggregation (`/admin/page.tsx` deriving stats from 7 product queries) is **removed** and replaced by the aggregate `GET /admin/dashboard` endpoint.

## 2. Visual Design

### 2.1 Theme system (light + dark)
- Admin is **not** dark-only. A `ThemeToggle` in the top bar switches light/dark via `next-themes` (`ThemeProvider` + `useTheme`); the choice persists to `localStorage` and no flash on reload (`suppressHydrationWarning` on `<html>`).
- Both palettes defined as CSS variables in `globals.css` (Tailwind v4 CSS-variable friendly):
  - **Dark** (follows user-provided `immersive-admin.html` reference): `--bg-base:#0a0a0f`, `--bg-card:#12121a`, `--bg-card2:#16161f`, `--bg-sidebar:#0e0e16`, text `#f1f0ff` / `#9490b5` / `#5a5780`, border `rgba(255,255,255,0.07)`.
  - **Light**: zinc inverse — `#fafafa` bg, white cards, `zinc-900` text, `zinc-200` borders.
- **Existing admin chrome refactor in scope:** `AdminShell`, `ui.tsx` (Button/Card/StatusBadge/Spinner), `ProductForm`, dashboard/categories/products pages currently hard-code dark zinc/indigo. All move to theme-aware `bg-card` / `text-foreground` / `dark:` classes so the toggle works everywhere.

### 2.2 Accent and status colors
- **Accent:** storefront indigo (`indigo-600`/`indigo-500`) — single brand identity across storefront + admin (not the reference's purple).
- **Status mapping:** green `#22c55e` = delivered / paid / in-stock; orange `#f59e0b` = processing / low-stock; red `#ef4444` = cancelled / critical-stock; blue `#3b82f6` = pending / info; indigo = primary / active.

### 2.3 Layout
- **Sidebar:** fixed 200px (widens to 256px on xl), logo + "Immersive Store / Admin Panel" wordmark, grouped nav, active highlight, bottom: "View store" link, admin avatar + name/email, Log out. Mobile: slide-in drawer.
- **Grouped navigation:**
  - `OVERVIEW` → Dashboard
  - `CATALOG` → Products, Categories
  - `SALES` → Orders, Customers
  - `INSIGHTS` → Analytics
  - `CONFIGURATION` → Settings
- **Top bar:** sticky, hamburger (mobile), page title, right side = theme toggle + admin avatar.
- **Empty states:** every table/chart/list renders a themed empty state ("No orders yet", etc.) when the API returns `[]`.

## 3. Dashboard (`/admin`)

### 3.1 KPI stat cards (4, each with delta pill + click-through)
- Revenue (Δ vs prior month) → Analytics
- Orders (Δ vs prior month) → Orders
- Avg Order Value (Δ vs prior month) → Analytics
- Pending Orders (count) → `orders?status=pending`

### 3.2 Chart grid (2×2)
- Sales overview — 12-month revenue line
- Monthly orders — bar
- Revenue by category — doughnut
- Top-selling products — ranked bar (real `order_items` aggregation)

### 3.3 Lower row
- Recent Orders table (left, wider, 5 rows)
- Right column stack: Quick Actions card → Activity Timeline → Low Stock list

### 3.4 Quick Actions (navigation-only, no new backend)
- New Product → `/admin/products/new`
- Add Category → `/admin/categories`
- View Pending Orders → `/admin/orders?status=pending`
- View Low Stock → `/admin/products?stock=low`
- View Reports → `/admin/analytics`

### 3.5 Activity Timeline
- Last 6 order status changes: order ref, `from → to` transition, who/when. Powered by the new `order_status_histories` table.

## 4. Orders (`/admin/orders`)

### 4.1 List
- Filters: status tabs (all/pending/processing/shipped/delivered/cancelled), search (order number, customer name/email), date range.
- Sort: newest first (default), by total, by date.
- Pagination (server-side, default 10/page, max 50) with count footer pill.
- Table columns: order number, customer (avatar + name), date, status badge, total, view action.

### 4.2 Detail (`/admin/orders/[id]`)
- Header: order ref + status badge + **admin status updater** (pending → processing → shipped → delivered → cancelled; writes a history row; no downgrade lock).
- Status-change timeline.
- Items table: thumb, name, sku, options (color/size), qty, unit price, line total.
- Totals: subtotal, shipping, tax, discount, total.
- Customer summary card (name, email, order count) linking to the customer profile.
- Shipping card (address fields) + Payment card (method, currency, Razorpay IDs, paid_at, payment status).

## 5. Customers (`/admin/customers`)

### 5.1 List
- Search (name/email), pagination. Table: avatar, name, email, joined, order count, total spent (KPI pills in footer).

### 5.2 Detail (`/admin/customers/[id]`)
- View-only. Profile card (avatar, name, email, joined).
- KPI pills: total spent, order count, AOV, last order date.
- Order history table (link to each order).
- Most-purchased products (derived from `order_items`).

## 6. Analytics (`/admin/analytics`)

- **Range selector** 30/90/365/all days, passed to the API.
- Revenue & orders trend (line/bar).
- Revenue by category (doughnut).
- Customer growth (line).
- Order status distribution (bar/donut).
- Top products table.
- AOV trend (line).
- Real data only; empty states otherwise. Cached 60s.

## 7. Settings (`/admin/settings`)

- Structured groups: Store, Shipping, Tax & Currency, Profile, Security.
- Index loads current values; PUT saves by group.
- Store: store name, tagline, support email, currency code, address.
- Shipping: default method, flat rates.
- Profile: admin name/email.
- Security: change password (re-validates current password server-side; reuses `users` table).
- Success/failure toasts; no mock defaults where values absent.

## 8. Backend Architecture

### 8.1 New controllers (all behind `auth:sanctum` + `admin` middleware)
- `AdminDashboardController@index` — aggregate `GET /admin/dashboard`.
- `AdminOrderController` — `index` / `show` / `updateStatus`.
- `AdminCustomerController` — `index` / `show`.
- `AdminAnalyticsController@index` — `GET /admin/analytics?range=`.
- `AdminSettingsController` — `index` / `update`.
- Reuse middleware `EnsureUserIsAdmin`; route group `admin` in `routes/api.php`.

### 8.2 Resources
- `OrderResource`, `OrderItemResource`, `CustomerResource`, `AdminAnalyticsResource`.
- Consistent envelope: success `{ success, data }`; error `{ success, message, errors? }`. Empty collections → `[]`.

### 8.3 Data & queries
- Revenue = sum of `total` for non-cancelled orders.
- `revenueChart` groups by `created_at` over the last 12 months, zero-filled per month.
- `topProducts`: aggregate `order_items` by product name/sku with summed quantities (top 5).
- Customer stats: order count, total spent, AOV, last order date.
- Settings stored in a new `settings` (key/value) table via migration; `StoreSetting` model.
- Profile/password reuse the `users` table (no new tables).

### 8.4 Data source & seeding (real records, no mocks)

Every dashboard card, chart, and table is driven by actual database records produced by the development seeders. Counting/stats run server-side via Eloquent; the frontend only renders what APIs return. Add:

- `OrderFactory` (status, money columns, `shipping_address` array, `paid_at`, dates spread over the past 12 months, realistic LOW/high order values in INR) and `OrderItemFactory` (reuse real seeded products/variants, per-item `options`/`color`/`size`, `image_url` from product images).
- A `CustomerSeeder` (e.g. 25–40 seeded customer `User` accounts via `UserFactory`, `role='customer'`) — no passwords needed beyond a shared dev default.
- An `OrderSeeder` producing ~150–250 orders across those customers and 2–24 months of history with a **realistic status mix** (mostly `delivered`, some `pending`/`processing`/`shipped`, a few `cancelled`), items at seed-product prices, and consistent `order_status_histories` rows so the Activity Timeline and order-detail timelines have data.
- Register all new seeders in `DatabaseSeeder` (idempotent `updateOrCreate`/guarded creates so re-running is safe).

Constraints:

- Every dashboard chart series (`revenueChart`, `ordersChart`, `categoryChart`, `topProducts`), every stat, and every growth delta comes from an Eloquent aggregate over these rows — never an inline fabricated value.
- Empty states must still be reachable (e.g., a filter combo with no matches → `[]`), but normal navigation shows populated, realistic data driven by the seeded DB.

### 8.5 New migration: `order_status_histories`
Fields: `id`, `order_id` (FK, cascade), `from_status`, `to_status`, `changed_by` (nullable FK users), `created_at`. Written on every admin status update; powers dashboard Activity Timeline + order-detail timeline.

### 8.6 Order status model
- Enum: `['pending', 'processing', 'shipped', 'delivered', 'cancelled']` (matches `orders.status`).
- `updateStatus`: new status must be one of the enum; records a history row; timestamps updated.

### 8.7 Caching
- 60s cache for `dashboard` and `analytics` endpoints only.
- Orders/customers/settings uncached (always fresh).

### 8.8 Routes
```
GET   /admin/dashboard
GET   /admin/orders?id=&customer= &status= &search= &sort= &page=
GET   /admin/orders/{id}
PATCH /admin/orders/{id}/status           # { status }
GET   /admin/customers?search=&page=
GET   /admin/customers/{id}               # profile + order history + top products
GET   /admin/analytics?range=             # 30|90|365|all (default 30)
GET   /admin/settings
PUT   /admin/settings                     # grouped payload
```

## 9. Frontend Architecture

### 9.1 Dependencies
- Add `recharts` to `frontend/package.json`.
- `next-themes` already present.

### 9.2 New/changed files
- `frontend/src/app/theme-provider.tsx` (or reuse existing provider patterns) + `ThemeToggle`.
- Extend `frontend/src/lib/admin-api.ts` and `frontend/src/types/admin.ts` for orders, customers, analytics, settings, dashboard aggregate.
- New pages:
  - `/admin/orders` + `/admin/orders/[id]`
  - `/admin/customers` + `/admin/customers/[id]`
  - `/admin/analytics`
  - `/admin/settings`
- New shared components in `frontend/src/app/admin/_components/`:
  - `StatCard`, `ChartCard` (wrapper), `DataTable` (loading/empty states), `EmptyState`, `Avatar`, `SectionLabel`, `RangeSelect`.
- Expand `ui.tsx` with theme-aware `Card` (Header/Title/Subtitle/Footer/actions), refine `StatusBadge` for order statuses.
- Reusable chart hooks: `useAdminDashboard` (60s refetch), `useAdminOrders`, `useAdminOrder`, `useAdminCustomers`, `useAdminCustomer`, `useAdminAnalytics`, `useAdminSettings` — all via `@tanstack/react-query` with `queryKey` conventions.
- Recharts theme-aware colors via CSS variables / resolved theme token.

### 9.3 Client conventions
- All admin list/detail pages fetch live from the new endpoints.
- Loading spinners; error state with retry; empty states.
- Currency rendering via existing `formatPrice` (`en-IN`/`INR`).

## 10. Error Handling

- Backend: consistent `{ success: false, message, errors? }`; 401 → login redirect; 403 → access denied; 404 → not-found view; 500 → generic error card with retry.
- Frontend: React Query error handling on all admin queries; forms surface field errors; status update failures show inline error and rollback optimistic state.

## 11. Testing

- Laravel: Pest/PHPUnit feature tests for dashboard aggregation, order status transitions (incl. no-downgrade + history row), customer detail stats, analytics ranges, settings round-trip, auth/authorization (401/403). Seeder tests: fresh `db:seed` yields a non-empty dashboard aggregate and plausible order-status distribution.
- Frontend: type-check (`tsc`), `next build` passes; manual E2E (run seeders → real orders appear on dashboard/orders/customers; filter combos reach empty states).
- No mock data anywhere; every metric sourced from a query (React pages contain no business-metric computation — rendering/formatting only).

## 12. Out of Scope

- No customer account editing / blocking.
- No manual order creation in admin (Quick Actions stay navigation-only).
- No CSV export.
- No multi-currency conversion (INR only).