import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleWishlist: (productId) => {
        const { items } = get();
        if (items.includes(productId)) {
          set({ items: items.filter((id) => id !== productId) });
        } else {
          set({ items: [...items, productId] });
        }
      },

      isInWishlist: (productId) => get().items.includes(productId),

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
