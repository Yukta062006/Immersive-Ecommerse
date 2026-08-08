# Guest Cart Design

**Date:** 2026-08-08
**Status:** Draft — pending review

## 1. Objective

Allow guests (unauthenticated users) to browse the store and add, remove, and
update cart items without logging in. The guest cart persists in `localStorage`
so it survives page reloads. When a guest logs in or signs up, the guest cart is
merged into the authenticated Laravel cart automatically and the local guest
cart is cleared. Checkout remains authentication-required.

## 2. Requirements

- Guests can add items to cart via every existing entry point
  (`AddToCartButton`, `ProductCard` quick-add, `TrendingSection` quick-add,
  `QuickViewModal`) with no login required.
- Guest cart operations (add / remove / update quantity / clear) work
  entirely client-side and persist to `localStorage`.
- Guest cart renders identically in the `CartDrawer`, cart page, and navbar
  badge using the existing components with no changes to their props.
- On login **and** signup, guest items merge into the user's server cart via
  the existing `POST /cart` endpoint (one request per guest item). Duplicate
  variants are quantity-bumped by the existing backend logic.
- After a successful merge, `localStorage` guest cart is cleared and the cart
  store reloads from the server (authoritative totals/prices).
- Invalid guest items (deleted/inactive product or variant — server returns
  404/422) are skipped; valid items merge; a toast summarizes what was skipped.
- Checkout stays behind `isAuthenticated` (no change).

## 3. Current Architecture (verified)

### Backend (`laravel-backend`)
- `CartController` under `auth:sanctum`: `GET /cart`, `POST /cart`,
  `PATCH /cart/{id}`, `DELETE /cart/{id}`, `DELETE /cart`.
- `store()` bumps quantity when the same `variant_id` already exists in the
  cart, otherwise creates a new `cart_item` row.
- `cartPayload()` returns `{ _id, items, total }` where each item is
  `{ _id, product: ProductResource, variant: <scalar variant id>, quantity, price }`.
  `variant` is a scalar id — frontend `transformCart()` maps it via
  `item.variant?.toString()`.
- No guest support exists. All `/cart` routes 401 for guests.

### Frontend (`frontend`)
- `useCartStore` (zustand) holds `cart: Cart`, `isLoading`, `isOpen`, promo
  state, and the methods `addItem / removeItem / updateQuantity / clearCart /
  loadCart / toggleCart / openCart / closeCart / applyPromo / removePromo`.
- **Every cart mutation currently hits the authenticated API.** `loadCart`
  (`GET /cart`) is defined but never invoked anywhere — the cart starts empty
  on every page load until the user adds something.
- `transformCart(backendCart)` maps backend payload → frontend `Cart`
  (`_id → id`, computes `itemCount`, `total`). The frontend `CartItem.variant`
  is a full `ProductVariant` object (used by `CartItem.tsx` for size/color/
  images/salePrice), but the backend only sends a scalar variant id, so
  `transformCart` fabricates a minimal variant `{ id, name, sku: '', price:
  item.price, stock, images: [] }`. **Size/color are therefore not displayed
  in the cart drawer today** (they're blank) — both for guests and for
  authenticated users.
- `CartItem.tsx` renders `item.variant.images[0]?.url || item.product.images[0]?.url`,
  `item.variant.size`, `item.variant.color`, and
  `item.variant.salePrice || item.variant.price`. It does NOT require any
  cart-item-level API calls; it just calls `removeItem(item.id)` /
  `updateQuantity(item.id, qty)`.
- `useAuthStore` has `login / signup / logout / loadUser`. `login` and `signup`
  both set tokens + user and set `isAuthenticated: true`. `AuthInitializer`
  (in `Providers`) calls `loadUser()` on mount. `login`/`signup` are called
  from `LoginForm.tsx` / `SignupForm.tsx`, which then `router.push(redirect)`.
- API client (`src/lib/api.ts`): axios instance reads `accessToken` from
  localStorage in a request interceptor. Guests send no Authorization header.
  CSRF header attached to non-GET requests. `withCredentials: true`.

## 4. Approach (approved by user)

**All frontend, no backend changes.** Guest cart is a persisted client-side
state; merge reuses `POST /cart` per item. Product snapshots are passed into
`addItem` from call sites (each call site already has the full `Product` and
selected `ProductVariant` in hand).

## 5. Design

### 5.1 Guest cart storage

A dedicated localStorage key, `immersive_guest_cart`, holding a serialized
guest cart with **minimal fields only** (per user decision): the fields
required to render the drawer and to re-submit items on merge. No full
`Product`/`ProductVariant` objects are stored.

```ts
interface GuestCartItem {
  productId: string;
  variantId: string;      // also the identity key within the guest cart
  quantity: number;
  name: string;           // product name
  image: string;          // product image URL (fallback '/placeholder.svg')
  price: number;          // effective (sale) unit price
  color?: string;
  size?: string;
}

interface GuestCartState {
  items: GuestCartItem[];
}
```

- **Identity:** items are keyed by `variantId` (a variant appears at most once
  per cart, matching the backend bump behavior).
- **Rendering:** the drawer (`CartItem.tsx`) only reads `name`, `image`,
  `price`, `color`, `size`, `quantity` — all present here. To reuse `CartItem`
  unchanged, the store builds a thin `Cart` in-memory whose `item.variant`
  carries these display fields (`variant.id = variantId`, `variant.price =
  price`, `variant.color = color`, `variant.size = size`,
  `variant.images[0].url = image`, `variant.salePrice` omitted — `price` is
  already the effective sale price).
- **Merge:** `productId` + `variantId` + `quantity` are exactly the fields
  `POST /cart` needs.
- Helpers in the store (or a small `lib/guestCart.ts`) provide
  `loadGuestCart()`, `saveGuestCart(items)`, `clearGuestCart()`.
- Guests are not assigned a cart `id`; a pseudo-id `guest` is used so the
  store's `Cart.id` remains a string.

### 5.2 Store branch: guest vs authenticated

`useCartStore` reads `useAuthStore.getState().isAuthenticated` at the top of
each mutating action:

- **Authenticated:** existing behavior (optimistic local update → API call →
  replace with `transformCart(server response)`).
- **Guest:** mutate the in-memory cart synchronously, then persist items to
  localStorage. No API calls. Errors cannot occur (snapshot data is present),
  so no rollback needed.

#### `addItem(productId, variantId, quantity = 1, product, variant)`

Signature extended with optional `product: Product` and `variant:
ProductVariant` snapshots, passed by call sites. The store extracts the
minimal render/merge fields from these snapshots for the guest cart:

```ts
{
  productId, variantId, quantity,
  name: product.name,
  image: product.images[0]?.url || '/placeholder.svg',
  price: variant.salePrice || variant.price,
  color: variant.color,
  size: variant.size,
}
```

- **Guest path:** look up existing item by `variantId`; if present, bump
  quantity (matching backend semantics); else append the new minimal item.
  Recompute `total`/`itemCount`. Persist. Open the drawer (existing behavior).
- **Authenticated path:** unchanged, ignores the extra snapshot params.

#### `removeItem(itemId)`, `updateQuantity(itemId, quantity)`, `clearCart()`

- **Guest path:** filter/map/clear the in-memory items by `variant.id`,
  recompute totals, persist to localStorage. (Drawer uses `item.variant.id`
  as the identity for guest items.)
- **Authenticated path:** unchanged.

#### `loadCart()`

- **Guest path:** hydrate the store from `localStorage` guest cart if present.
- **Authenticated path:** unchanged (`GET /cart`).

### 5.3 Guest item identity for remove/update

`CartItem.tsx` passes `item.id` to `removeItem`/`updateQuantity`. For guest
items we set `id = variantId` (variant ids are unique strings). For
authenticated items `id` remains the server cart-item `_id`. The store branches
on auth mode, so the two id namespaces never collide.

### 5.4 Merge on login/signup (fault tolerant)

New store method `mergeGuestCart()`:

1. Read guest items from localStorage; if empty, no-op.
2. For each guest item, `POST /cart { productId, variantId, quantity }`
   (reuses existing endpoint; backend bumps duplicates).
   - Run sequentially to avoid interleaving the server's bump logic.
3. Track two counters per request:
   - 2xx → `merged += 1`.
   - 404 (product or variant missing/deleted/inactive), 422, or any other
     error → `skipped += 1`. **Never abort the loop on a single failure.**
4. After all requests: `clearGuestCart()` and call `loadCart()` to pull the
   authoritative server cart (fresh totals/prices from the DB).
5. Show **one summary toast**:
   - All merged: success, e.g. `Moved {merged} item(s) to your cart`.
   - Some/all skipped: e.g. `Merged {merged} item(s). {skipped} item(s)
     were unavailable and skipped.`
   - (`merged` and `skipped` are both always shown; the toast text branches
     on whether `skipped > 0`.)

**Trigger points:**
- `useAuthStore.login()` — after `isAuthenticated` set, fire
  `useCartStore.getState().mergeGuestCart()` (fire-and-forget promise;
  `LoginForm` already awaits `login` and shows the toast via the store).
- `useAuthStore.signup()` — same.
- `AuthInitializer` handles the reload case: on mount it runs `loadUser()`
  which sets `isAuthenticated` for a returning session. Because
  `mergeGuestCart` is a no-op when localStorage is empty, the normal
  post-login merge is safe, and a returning session (guest cart already
  merged/cleared) won't double-merge.

### 5.5 App start hydration

Add a `useEffect` in `AuthInitializer` (or a new `CartInitializer`) that, on
mount, calls `loadCart()` after auth state is resolved:
- If authenticated → `GET /cart` (loads server cart on refresh; fixes the
  existing gap where `loadCart` was never called).
- If guest → hydrate from localStorage.

This makes the navbar badge and drawer correct immediately on page load for
both guests and returning users.

### 5.6 Logout

On `logout()`, reset cart state to empty and clear guest localStorage, so the
next guest session starts clean. (Server cart for that user is untouched —
it remains on the server for their next login.)

## 6. Edge Cases

| Case | Behavior |
| --- | --- |
| Guest adds same variant twice | Quantity bumped (matches backend). |
| Guest clears cart | localStorage guest cart emptied; drawer shows empty state. |
| Product deleted/inactive before merge | `POST /cart` returns 404; item skipped; merge continues; single summary toast. |
| Product price changed before merge | Server cart recomputes from DB on `loadCart()`; totals authoritative. |
| Merge partially fails | Valid items merge; failed items skipped; loop continues; guest cart cleared; one summary toast. |
| All merge items fail | Every item skipped; guest cart cleared (nothing addable); toast reports 0 merged / N skipped. |
| Refresh mid-session (guest) | Cart rehydrated from localStorage on mount. |
| Returning logged-in user refresh | `loadCart()` fetches server cart (previously empty cart on refresh). |
| Logout | Cart UI cleared; guest storage cleared. |
| SSR / no window | All localStorage access guarded by `typeof window` check (existing pattern). |

## 7. Files Touched (all frontend)

- `frontend/src/stores/useCartStore.ts` — auth-mode branching, guest
  persistence helpers (minimal-field items), `addItem` snapshot params,
  `mergeGuestCart` (fault tolerant).
- `frontend/src/stores/useAuthStore.ts` — call `mergeGuestCart()` in
  `login`/`signup`; reset cart + clear guest storage in `logout`.
- `frontend/src/components/providers/AuthInitializer.tsx` — call `loadCart()`
  after auth resolves.
- `frontend/src/components/product/AddToCartButton.tsx` — accept optional
  `product`/`variant` props, forward to `addItem`.
- `frontend/src/components/product/ProductCard.tsx` — pass `product` +
  `defaultVariant` snapshots to `addItem`.
- `frontend/src/components/product/TrendingSection.tsx` — pass `product` +
  `variants[0]` snapshot.
- `frontend/src/components/product/QuickViewModal.tsx` — pass `product` +
  selected `variant`.
- `frontend/src/app/products/[id]/page.tsx` — pass `product` + selected
  `variant` to `AddToCartButton`.

No backend changes. No changes to `CartDrawer`, `CartItem`, `CartSummary`,
cart page, checkout page, or `lib/api.ts`.

## 8. Out of Scope

- Size/color display in cart items for **authenticated** users (pre-existing
  gap caused by the backend sending scalar variant ids). Guests DO see
  size/color because their snapshots carry those fields.
- Guest checkout.
- Server-side guest carts (session/device tokens).
- Price re-validation at add time (merge re-validates at login).

## 9. Verification Plan

1. `npx tsc --noEmit` clean.
2. `npx next build` success.
3. Manual: as guest, add items from product page, ProductCard quick-add,
   TrendingSection, QuickViewModal; verify drawer renders, badge updates,
   refresh persists.
4. Manual: guest remove/update/clear each persist correctly.
5. Manual: login with an account — verify guest items appear in server cart,
   guest localStorage cleared, **single** summary toast shown; verify existing
   server cart items were quantity-merged.
6. Manual: signup path same as login.
7. Manual: logout clears UI cart.
8. Manual: login with a guest cart containing a bogus variant id (via
   devtools) — verify that item is skipped, valid items still merge, single
   summary toast reports merged vs skipped counts, no crash.
9. **Full flow (required by user):** guest adds items → login → merge →
   refresh (server cart persists) → logout (cart clears) → report results.
