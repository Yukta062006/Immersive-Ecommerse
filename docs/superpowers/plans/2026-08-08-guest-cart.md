# Guest Cart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow guests to build a cart persisted in localStorage (add/remove/update/clear without auth), auto-merge it into the authenticated Laravel cart on login and signup, and keep checkout auth-only.

**Architecture:** Frontend-only. `useCartStore` branches on auth state: guests mutate an in-memory cart + persist a minimal item list (`productId, variantId, quantity, name, image, price, color, size`) to localStorage; authenticated users keep the existing API flow. `mergeGuestCart()` POSTs each guest item to the existing `POST /cart` endpoint sequentially, skips failures, then reloads the server cart and shows one summary toast. Call sites pass product/variant snapshots so guests can render the drawer without network calls.

**Tech Stack:** Next.js 16.2.9, React 19, Zustand 5.0.14, axios. No backend changes. No test framework — verification is `tsc --noEmit`, `next build`, and manual browser flows against the live servers (`php artisan serve` on :4000, Next dev on :3000).

## Global Constraints

- All changes are frontend-only. Do **not** modify `laravel-backend/**`.
- Do **not** modify `lib/api.ts`, `CartDrawer.tsx`, `CartItem.tsx`, `CartSummary.tsx`, `checkout/page.tsx`, or `app/cart/page.tsx`.
- Guest items in localStorage are **minimal** — never store full `Product`/`ProductVariant` objects.
- Guest cart item identity is `variantId` (a variant appears at most once; re-adding bumps quantity, matching backend semantics).
- Every localStorage access is guarded with `typeof window === 'undefined'` (SSR safety).
- `mergeGuestCart()` must be fault tolerant: never abort the loop on a single failure; count merged vs skipped; show exactly one summary toast.
- Run commands from `frontend/` unless the task says otherwise.
- Commit after each task.

---

### Task 1: Guest cart storage module

**Files:**
- Create: `frontend/src/lib/guestCart.ts`

**Interfaces:**
- Consumes: types `Product`, `ProductVariant` from `@/types/product`; types `Cart`, `CartItem` from `@/types/cart`.
- Produces:
  - `export interface GuestCartItem { productId: string; variantId: string; quantity: number; name: string; image: string; price: number; color?: string; size?: string }`
  - `export function loadGuestCart(): GuestCartItem[]`
  - `export function saveGuestCart(items: GuestCartItem[]): void`
  - `export function clearGuestCart(): void`
  - `export function buildCartFromGuestItems(items: GuestCartItem[]): Cart`

- [ ] **Step 1: Write the module**

Create `frontend/src/lib/guestCart.ts`:

```ts
import { Cart, CartItem } from '@/types/cart';
import { Product, ProductVariant } from '@/types/product';

export interface GuestCartItem {
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  image: string;
  price: number;
  color?: string;
  size?: string;
}

const GUEST_CART_KEY = 'immersive_guest_cart';

export function loadGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // storage full / unavailable — ignore
  }
}

export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // ignore
  }
}

function makeProduct(item: GuestCartItem): Product {
  const image: Product['images'][0] = {
    id: '',
    url: item.image,
    alt: item.name,
    width: 800,
    height: 800,
  };
  return {
    id: item.productId,
    name: item.name,
    slug: '',
    description: '',
    shortDescription: item.name,
    price: item.price,
    brand: '',
    category: '',
    tags: [],
    images: [image],
    variants: [],
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
    featured: false,
    createdAt: '',
    updatedAt: '',
  };
}

function makeVariant(item: GuestCartItem): ProductVariant {
  const image: ProductVariant['images'][0] = {
    id: '',
    url: item.image,
    alt: item.name,
    width: 800,
    height: 800,
  };
  return {
    id: item.variantId,
    name: item.name,
    sku: '',
    price: item.price,
    stock: item.quantity,
    size: item.size,
    color: item.color,
    images: [image],
  };
}

/**
 * Builds the frontend Cart shape (what CartDrawer/CartItem/CartSummary render)
 * from minimal guest items. item.id === variantId so remove/update work.
 */
export function buildCartFromGuestItems(items: GuestCartItem[]): Cart {
  const cartItems: CartItem[] = items.map((item) => ({
    id: item.variantId,
    product: makeProduct(item),
    variant: makeVariant(item),
    quantity: item.quantity,
  }));

  const total = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  return {
    id: 'guest',
    items: cartItems,
    total,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `guestCart.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/guestCart.ts
git commit -m "feat: add guest cart localStorage helpers"
```

---

### Task 2: Branch `useCartStore` on auth state

**Files:**
- Modify: `frontend/src/stores/useCartStore.ts` (full file rewrite below)

**Interfaces:**
- Consumes: `GuestCartItem`, `loadGuestCart`, `saveGuestCart`, `clearGuestCart`, `buildCartFromGuestItems` from `@/lib/guestCart`; `useAuthStore` from `@/stores/useAuthStore`; `Product`, `ProductVariant` from `@/types/product`.
- Produces: `addItem(productId, variantId, quantity?, product?, variant?)` — signature extended with optional snapshots; `mergeGuestCart(): Promise<void>`; `resetCart(): void`. `loadCart()` now hydrates guest cart from localStorage when unauthenticated.

- [ ] **Step 1: Rewrite the store**

Replace the full contents of `frontend/src/stores/useCartStore.ts`:

```ts
import { create } from 'zustand';
import { CartItem, Cart } from '@/types/cart';
import { Product, ProductVariant } from '@/types/product';
import api from '@/lib/api';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  GuestCartItem,
  loadGuestCart,
  saveGuestCart,
  clearGuestCart,
  buildCartFromGuestItems,
} from '@/lib/guestCart';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  isOpen: boolean;
  promoCode: string | null;
  promoDiscount: number;
  addItem: (
    productId: string,
    variantId: string,
    quantity?: number,
    product?: Product,
    variant?: ProductVariant
  ) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  resetCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
}

const emptyCart: Cart = { id: '', items: [], total: 0, itemCount: 0 };

/**
 * Transforms the backend cart response into the frontend Cart shape.
 * Handles _id → id mapping, computes itemCount, and creates minimal variant objects.
 */
function transformCart(backendCart: any): Cart {
  if (!backendCart) return emptyCart;

  const items: CartItem[] = (backendCart.items || []).map((item: any) => {
    const product = item.product || {};
    return {
      id: item._id?.toString() || item.id || '',
      product: {
        id: product._id?.toString() || product.id || '',
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || product.description || '',
        price: product.price || 0,
        brand: product.brand || '',
        category: product.category || '',
        tags: product.tags || [],
        images: (product.images || []).map((img: any) => ({
          id: img._id?.toString() || img.id || '',
          url: img.url || '',
          alt: img.alt || '',
          width: img.width || 800,
          height: img.height || 800,
        })),
        variants: product.variants || [],
        reviews: product.reviews || [],
        averageRating: product.ratings?.average || product.averageRating || 0,
        reviewCount: product.ratings?.count || product.reviewCount || 0,
        featured: product.featured || false,
        createdAt: product.createdAt || '',
        updatedAt: product.updatedAt || '',
      },
      variant: {
        id: item.variant?.toString() || '',
        name: product.name || '',
        sku: '',
        price: item.price || product.price || 0,
        stock: product.stock || 0,
        images: [],
      },
      quantity: item.quantity || 1,
    };
  });

  const total = backendCart.total ?? items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  return {
    id: backendCart._id?.toString() || backendCart.id || '',
    items,
    total,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function guestTotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + (item.variant.salePrice || item.variant.price) * item.quantity,
    0
  );
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: emptyCart,
  isLoading: false,
  isOpen: false,
  promoCode: null,
  promoDiscount: 0,

  addItem: async (productId, variantId, quantity = 1, product, variant) => {
    const prevCart = get().cart;

    if (!useAuthStore.getState().isAuthenticated) {
      const items = loadGuestCart();
      const existing = items.find((item) => item.variantId === variantId);
      const nextItems = existing
        ? items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [
            ...items,
            {
              productId,
              variantId,
              quantity,
              name: product?.name || '',
              image: product?.images?.[0]?.url || '/placeholder.svg',
              price: variant?.salePrice || variant?.price || 0,
              color: variant?.color,
              size: variant?.size,
            } as GuestCartItem,
          ];
      saveGuestCart(nextItems);
      set({ cart: buildCartFromGuestItems(nextItems), isOpen: true });
      return;
    }

    const existingItem = prevCart.items.find(
      (item) => item.variant.id === variantId
    );

    if (existingItem) {
      const updatedItems = prevCart.items.map((item) =>
        item.variant.id === variantId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      set({
        cart: {
          ...prevCart,
          items: updatedItems,
          total: guestTotal(updatedItems),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        },
        isOpen: true,
      });
    } else {
      set({
        cart: { ...prevCart, itemCount: prevCart.itemCount + quantity },
        isOpen: true,
      });
    }

    try {
      const { data } = await api.post('/cart', { productId, variantId, quantity });
      set({ cart: transformCart(data.data.cart) });
    } catch {
      set({ cart: prevCart });
      useUIStore.getState().addToast({ type: 'error', message: 'Failed to add item to cart' });
    }
  },

  removeItem: async (itemId) => {
    const prevCart = get().cart;

    if (!useAuthStore.getState().isAuthenticated) {
      const items = loadGuestCart().filter((item) => item.variantId !== itemId);
      saveGuestCart(items);
      set({ cart: buildCartFromGuestItems(items) });
      return;
    }

    const updatedItems = prevCart.items.filter((item) => item.id !== itemId);
    set({
      cart: {
        ...prevCart,
        items: updatedItems,
        total: guestTotal(updatedItems),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });

    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      set({ cart: transformCart(data.data.cart) });
    } catch {
      set({ cart: prevCart });
      useUIStore.getState().addToast({ type: 'error', message: 'Failed to remove item' });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const prevCart = get().cart;

    if (!useAuthStore.getState().isAuthenticated) {
      if (quantity <= 0) {
        return get().removeItem(itemId);
      }
      const items = loadGuestCart().map((item) =>
        item.variantId === itemId ? { ...item, quantity } : item
      );
      saveGuestCart(items);
      set({ cart: buildCartFromGuestItems(items) });
      return;
    }

    if (quantity <= 0) {
      return get().removeItem(itemId);
    }

    const updatedItems = prevCart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({
      cart: {
        ...prevCart,
        items: updatedItems,
        total: guestTotal(updatedItems),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    });

    try {
      const { data } = await api.patch(`/cart/${itemId}`, { quantity });
      set({ cart: transformCart(data.data.cart) });
    } catch {
      set({ cart: prevCart });
      useUIStore.getState().addToast({ type: 'error', message: 'Failed to update quantity' });
    }
  },

  clearCart: async () => {
    const prevCart = get().cart;

    if (!useAuthStore.getState().isAuthenticated) {
      clearGuestCart();
      set({ cart: emptyCart });
      return;
    }

    set({ cart: emptyCart });
    try {
      await api.delete('/cart');
    } catch {
      set({ cart: prevCart });
    }
  },

  loadCart: async () => {
    set({ isLoading: true });
    if (!useAuthStore.getState().isAuthenticated) {
      set({ cart: buildCartFromGuestItems(loadGuestCart()), isLoading: false });
      return;
    }
    try {
      const { data } = await api.get('/cart');
      set({ cart: transformCart(data.data.cart), isLoading: false });
    } catch {
      set({ cart: emptyCart, isLoading: false });
    }
  },

  mergeGuestCart: async () => {
    const items = loadGuestCart();
    if (items.length === 0) return;

    let merged = 0;
    let skipped = 0;

    for (const item of items) {
      try {
        await api.post('/cart', {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
        merged += 1;
      } catch {
        skipped += 1;
      }
    }

    clearGuestCart();
    await get().loadCart();

    const toast = skipped > 0
      ? {
          type: 'warning' as const,
          message: `Merged ${merged} item(s). ${skipped} item(s) were unavailable and skipped.`,
        }
      : {
          type: 'success' as const,
          message: `Moved ${merged} item(s) to your cart.`,
        };
    useUIStore.getState().addToast(toast);
  },

  resetCart: () => {
    clearGuestCart();
    set({ cart: emptyCart });
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  applyPromo: (code, discount) => set({ promoCode: code, promoDiscount: discount }),
  removePromo: () => set({ promoCode: null, promoDiscount: 0 }),
}));
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/stores/useCartStore.ts
git commit -m "feat: branch cart store on auth state with guest localStorage mode"
```

---

### Task 3: Wire merge + reset into auth store

**Files:**
- Modify: `frontend/src/stores/useAuthStore.ts`

**Interfaces:**
- Consumes: `useCartStore` from `@/stores/useCartStore`.
- Produces: no new exports. `login()` and `signup()` now merge the guest cart after auth succeeds; `logout()` resets the cart UI and clears guest storage.

- [ ] **Step 1: Add the cart-store import**

Add after the `api` import (line 3) in `frontend/src/stores/useAuthStore.ts`:

```ts
import { useCartStore } from '@/stores/useCartStore';
```

- [ ] **Step 2: Merge on login**

In `login: async (email, password) => { ... }`, append after the existing `set({ user, isAuthenticated: true, isMockAuth: false });` line:

```ts
    await useCartStore.getState().mergeGuestCart();
```

- [ ] **Step 3: Merge on signup**

In `signup: async (name, email, password) => { ... }`, append after the existing `set({ user, isAuthenticated: true, isMockAuth: false });` line:

```ts
    await useCartStore.getState().mergeGuestCart();
```

- [ ] **Step 4: Reset on logout**

In `logout: () => { ... }`, after the existing `set({ user: null, isAuthenticated: false, isMockAuth: false });` line add:

```ts
    useCartStore.getState().resetCart();
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/stores/useAuthStore.ts
git commit -m "feat: merge guest cart on login/signup and reset on logout"
```

---

### Task 4: Hydrate cart on app start

**Files:**
- Modify: `frontend/src/components/providers/AuthInitializer.tsx`

**Interfaces:**
- Consumes: `useCartStore` from `@/stores/useCartStore`.
- Produces: `loadCart()` is invoked after auth resolves on mount (fixes the existing gap where the cart always started empty).

- [ ] **Step 1: Add import and call loadCart**

Replace the full contents of `frontend/src/components/providers/AuthInitializer.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';

export default function AuthInitializer() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    async function init() {
      await loadUser();
      await useCartStore.getState().loadCart();
    }
    init();
  }, [loadUser]);

  return null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/providers/AuthInitializer.tsx
git commit -m "feat: load cart on app start after auth resolves"
```

---

### Task 5: Pass product/variant snapshots at all add-to-cart call sites

**Files:**
- Modify: `frontend/src/components/product/AddToCartButton.tsx`
- Modify: `frontend/src/app/products/[id]/page.tsx`
- Modify: `frontend/src/components/product/ProductCard.tsx`
- Modify: `frontend/src/components/product/TrendingSection.tsx`
- Modify: `frontend/src/components/product/QuickViewModal.tsx`

**Interfaces:**
- Consumes: `addItem(productId, variantId, quantity, product, variant)` from Task 2.
- Produces: all four entry points pass the product + selected variant snapshots so guest adds render correctly.

- [ ] **Step 1: Extend AddToCartButton props and forward snapshots**

In `frontend/src/components/product/AddToCartButton.tsx`:

1. Add imports after line 3:

```ts
import { Product, ProductVariant } from '@/types/product';
```

2. Extend the props interface (replace the existing `interface AddToCartButtonProps { ... }`):

```ts
interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  disabled?: boolean;
  product?: Product;
  variant?: ProductVariant;
}
```

3. Extend the destructure in the function signature:

```ts
export default function AddToCartButton({
  productId,
  variantId,
  disabled = false,
  product,
  variant,
}: AddToCartButtonProps) {
```

4. Change the `addItem` call at line 28:

```ts
      await addItem(productId, variantId, 1, product, variant);
```

- [ ] **Step 2: Pass snapshots from product detail page**

In `frontend/src/app/products/[id]/page.tsx`, replace the `<AddToCartButton ... />` block (lines 379-383):

```tsx
            <AddToCartButton
              productId={product.id}
              variantId={selectedVariant?.id || product.variants[0]?.id || ''}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              product={product}
              variant={selectedVariant || product.variants[0]}
            />
```

- [ ] **Step 3: Pass snapshots from ProductCard**

In `frontend/src/components/product/ProductCard.tsx`, replace the `addItem(product.id, defaultVariant.id);` call (line 36) in `handleQuickAdd`:

```ts
      addItem(product.id, defaultVariant.id, 1, product, defaultVariant);
```

- [ ] **Step 4: Pass snapshots from TrendingSection**

In `frontend/src/components/product/TrendingSection.tsx`, replace the `addItem(product.id, variant.id);` call (line 103) in `handleQuickAdd`:

```ts
      addItem(product.id, variant.id, 1, product, variant);
```

- [ ] **Step 5: Pass snapshots from QuickViewModal**

In `frontend/src/components/product/QuickViewModal.tsx`, replace the `addItem(product.id, variantId);` call (line 38) in `handleAddToCart`:

```ts
      addItem(product.id, variantId, 1, product, selectedVariant || product.variants[0]);
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Build**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/product/AddToCartButton.tsx frontend/src/app/products/[id]/page.tsx frontend/src/components/product/ProductCard.tsx frontend/src/components/product/TrendingSection.tsx frontend/src/components/product/QuickViewModal.tsx
git commit -m "feat: pass product/variant snapshots to addItem at all call sites"
```

---

### Task 6: Verify the full guest → login → merge → refresh → logout flow

**Prereqs:** Backend running (`php artisan serve` on :4000 in `laravel-backend/`) and frontend dev server running (`npm run dev` on :3000). Have a test account ready (e.g. sign one up during the flow).

**Files:** none (verification only)

- [ ] **Step 1: Guest add + persist**

1. In an incognito/private window, open `http://localhost:3000`.
2. Navigate to a product page, select a size/color, click **Add to Cart**. Verify the drawer opens, shows the item with name, image, price, size, color, and the navbar badge shows the correct count.
3. Use a ProductCard **Quick Add** and a **TrendingSection** quick-add; verify they appear too. Duplicate the same variant and verify quantity bumps (not a duplicate row).
4. Reload the page. Verify the cart items, badge, and totals persist.
5. Open DevTools → Application → Local Storage → `immersive_guest_cart`. Verify the stored array contains only minimal fields (`productId, variantId, quantity, name, image, price, color, size`) — no nested product/variant objects.

- [ ] **Step 2: Guest remove/update/clear**

1. In the drawer, increment a quantity — verify it updates and persists after reload.
2. Decrement to zero — verify the row is removed.
3. Add an item, then remove it with the trash icon — verify removal.
4. Verify each change is reflected in the `immersive_guest_cart` localStorage value and the cart total.

- [ ] **Step 3: Login → merge**

1. With guest items still present, click **Checkout** (verify you are redirected to `/auth/login`).
2. Log in with the test account. Verify:
   - A **single** summary toast appears (success "Moved N item(s) to your cart." or mixed "Merged N item(s). M item(s) were unavailable and skipped.").
   - The cart drawer now shows the server cart with the merged items and correct totals.
   - `immersive_guest_cart` is removed from localStorage.
3. Repeat once by adding a guest item to an account that already has server items of the same variant — verify quantities merge/bump rather than duplicate.

- [ ] **Step 4: Merge fault tolerance**

1. As a guest, add a valid item. Then via DevTools console, inject a bogus entry into `immersive_guest_cart`:

```js
const items = JSON.parse(localStorage.getItem('immersive_guest_cart') || '[]');
items.push({ productId: 'nonexistent', variantId: 'nonexistent', quantity: 1, name: 'Ghost', image: '/placeholder.svg', price: 9.99 });
localStorage.setItem('immersive_guest_cart', JSON.stringify(items));
```

2. Reload (guest cart should now show the ghost item). Log in.
3. Verify: the valid item merges, the ghost item is skipped, exactly one warning toast shows both counts, no crash, and `immersive_guest_cart` is cleared.

- [ ] **Step 5: Signup → merge**

1. Log out. As a guest, add an item.
2. Go to signup and create a fresh account.
3. Verify the item merges, the summary toast appears, and `immersive_guest_cart` is cleared.

- [ ] **Step 6: Refresh while authenticated**

1. While logged in with a non-empty server cart, reload the page.
2. Verify the cart, badge, and totals load from the server (previously the cart started empty on reload — this confirms the Task 4 fix).

- [ ] **Step 7: Logout**

1. Log out.
2. Verify the cart UI clears (badge → 0, drawer empty) and no guest cart appears in localStorage.
3. Log back in — verify the server cart (items from Step 3) is still there (logout must not delete the server cart).

- [ ] **Step 8: Report results**

Report the outcome of every step above (pass/fail + observed behavior), especially: merge toast counts, localStorage minimal shape, fault-tolerance result, refresh persistence, and logout behavior. Only proceed to further work after the user reviews this report.

---

## Self-Review

- **Spec coverage:** Guest add/remove/update/clear (Task 1-2, 5), localStorage minimal persistence (Task 1), merge on login+signup (Task 3), fault-tolerant skip + single toast (Task 2 `mergeGuestCart`), checkout stays auth-required (unchanged, verified in Step 3.1), hydration fix (Task 4), logout reset (Task 3). ✓
- **Placeholder scan:** All steps contain exact code or exact commands. No TBD/TODO. ✓
- **Type consistency:** `addItem` signature `(productId, variantId, quantity?, product?, variant?)` matches across Task 2 (store) and Task 5 (call sites). `mergeGuestCart`, `resetCart`, `buildCartFromGuestItems`, `GuestCartItem` names match between Task 1, 2, 3. `guestTotal` used consistently for optimistic totals. ✓
