import { create } from 'zustand';
import { CartItem, Cart } from '@/types/cart';
import api from '@/lib/api';
import { useUIStore } from '@/stores/useUIStore';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  isOpen: boolean;
  promoCode: string | null;
  promoDiscount: number;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
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

export const useCartStore = create<CartState>((set, get) => ({
  cart: emptyCart,
  isLoading: false,
  isOpen: false,
  promoCode: null,
  promoDiscount: 0,

  addItem: async (productId, variantId, quantity = 1) => {
    const prevCart = get().cart;
    const existingItem = prevCart.items.find(
      (item) => item.variant.id === variantId
    );

    if (existingItem) {
      const updatedItems = prevCart.items.map((item) =>
        item.variant.id === variantId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      const total = updatedItems.reduce(
        (sum, item) => sum + (item.variant.salePrice || item.variant.price) * item.quantity,
        0
      );
      set({
        cart: {
          ...prevCart,
          items: updatedItems,
          total,
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
    const updatedItems = prevCart.items.filter((item) => item.id !== itemId);
    const total = updatedItems.reduce(
      (sum, item) => sum + (item.variant.salePrice || item.variant.price) * item.quantity,
      0
    );
    set({
      cart: {
        ...prevCart,
        items: updatedItems,
        total,
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
    if (quantity <= 0) {
      return get().removeItem(itemId);
    }

    const updatedItems = prevCart.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    const total = updatedItems.reduce(
      (sum, item) => sum + (item.variant.salePrice || item.variant.price) * item.quantity,
      0
    );
    set({
      cart: {
        ...prevCart,
        items: updatedItems,
        total,
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
    set({ cart: emptyCart });

    try {
      await api.delete('/cart');
    } catch {
      set({ cart: prevCart });
    }
  },

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ cart: transformCart(data.data.cart), isLoading: false });
    } catch {
      set({ cart: emptyCart, isLoading: false });
    }
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  applyPromo: (code, discount) => set({ promoCode: code, promoDiscount: discount }),
  removePromo: () => set({ promoCode: null, promoDiscount: 0 }),
}));
