import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  isSearchOpen: boolean;
  searchQuery: string;
  isMobileMenuOpen: boolean;
  cursorVariant: string;
  reducedMotion: boolean;
  toasts: Toast[];
  toggleTheme: () => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  setCursorVariant: (variant: string) => void;
  setReducedMotion: (reduced: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

let toastId = 0;

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  isSearchOpen: false,
  searchQuery: '',
  isMobileMenuOpen: false,
  cursorVariant: 'default',
  reducedMotion: false,
  toasts: [],

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  setReducedMotion: (reduced) => set({ reducedMotion: reduced }),

  addToast: (toast) => {
    const id = `toast-${++toastId}`;
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
