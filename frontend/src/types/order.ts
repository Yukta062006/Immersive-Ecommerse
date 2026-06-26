import { CartItem } from './cart';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentIntentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSession {
  orderId: string;
  clientSecret: string;
}
