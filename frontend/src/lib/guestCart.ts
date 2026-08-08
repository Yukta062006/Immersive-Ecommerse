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
