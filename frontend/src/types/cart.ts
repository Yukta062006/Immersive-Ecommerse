import { Product, ProductVariant } from './product';

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface AddToCartPayload {
  productId: string;
  variantId: string;
  quantity: number;
}
