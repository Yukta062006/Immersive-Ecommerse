'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/useCartStore';
import CartItem from './CartItem';
import CartSummary from './CartSummary';
import Link from 'next/link';

export default function CartDrawer() {
  const { cart, isOpen, closeCart } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Shopping Cart ({cart.itemCount})
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                aria-label="Close cart"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {cart.items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Your cart is empty</p>
                    <Link
                      href="/products"
                      onClick={closeCart}
                      className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      Continue Shopping
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </motion.div>
                ) : (
                  cart.items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Summary */}
            {cart.items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-zinc-800 p-6">
                <CartSummary />
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full mt-4 py-3 bg-indigo-600 text-white text-center font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
