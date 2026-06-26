'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/stores/useCartStore';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';

export default function CartPage() {
  const cart = useCartStore((s) => s.cart);

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-gray-900 dark:text-white"
        >
          Shopping Cart
        </motion.h1>

        {cart.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
                <CartSummary />
                <Link
                  href="/checkout"
                  className="block w-full mt-4 py-3 bg-indigo-600 text-white text-center font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
