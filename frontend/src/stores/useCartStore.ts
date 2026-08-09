import { create } from 'zustand';
import { CartItem, Cart } from '@/types/cart';
import { Product, ProductVariant, ProductReview } from '@/types/product';
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

interface BackendCartImage {
  _id?: string;
  id?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface BackendCartVariant {
  _id?: string;
  id?: string;
  name?: string;
  sku?: string;
  price?: number;
  stock?: number;
  color?: string;
  colorHex?: string;
  size?: string;
  images?: BackendCartImage[];
  options?: Record<string, string>;
}

interface BackendCartProduct {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: number;
  brand?: string;
  category?: string;
  tags?: string[];
  images?: BackendCartImage[];
  variants?: BackendCartVariant[];
  reviews?: ProductReview[];
  ratings?: { average?: number; count?: number };
  averageRating?: number;
  reviewCount?: number;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  stock?: number;
}

interface BackendCartItem {
  _id?: string;
  id?: string;
  product?: BackendCartProduct;
  variant?: string | { _id?: string; id?: string; price?: number; name?: string };
  price?: number;
  quantity?: number;
}

interface BackendCart {
  _id?: string;
  id?: string;
  items?: BackendCartItem[];
  total?: number;
}

/**
 * Transforms the backend cart response into the frontend Cart shape.
 * Handles _id → id mapping, computes itemCount, and creates minimal variant objects.
 */
function transformCart(backendCart: BackendCart): Cart {
  if (!backendCart) return emptyCart;

  const items: CartItem[] = (backendCart.items || []).map((item: BackendCartItem) => {
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
        images: (product.images || []).map((img: BackendCartImage) => ({
          id: img._id?.toString() || img.id || '',
          url: img.url || '',
          alt: img.alt || '',
          width: img.width || 800,
          height: img.height || 800,
        })),
        variants: (product.variants || []).map((v) => ({
          id: v._id?.toString() || v.id || '',
          name: v.name || '',
          sku: v.sku || '',
          price: v.price || 0,
          stock: v.stock || 0,
          size: v.size ?? v.options?.size,
          color: v.color ?? v.options?.color,
          colorHex: v.colorHex ?? undefined,
          images: (v.images || []).map((img) => ({
            id: img._id?.toString() || img.id || '',
            url: img.url || '',
            alt: img.alt || '',
            width: img.width || 800,
            height: img.height || 800,
          })),
        })),
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
