'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/types/cart';
import { useCartStore } from '@/stores/useCartStore';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();
  const price = item.variant.salePrice || item.variant.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex gap-4 p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl"
    >
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-700 flex-shrink-0">
        <Image
          src={item.variant.images[0]?.url || item.product.images[0]?.url || '/placeholder.svg'}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {item.product.name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {item.variant.size && `Size: ${item.variant.size}`}
          {item.variant.size && item.variant.color && ' · '}
          {item.variant.color && `Color: ${item.variant.color}`}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="w-7 h-7 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              -
            </motion.button>
            <motion.span
              key={item.quantity}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="text-sm font-medium w-6 text-center text-gray-900 dark:text-white"
            >
              {item.quantity}
            </motion.span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 rounded-full border border-gray-300 dark:border-zinc-600 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              +
            </motion.button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(price * item.quantity)}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeItem(item.id)}
              aria-label="Remove item"
              className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
