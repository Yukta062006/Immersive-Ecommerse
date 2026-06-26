'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/useCartStore';
import { useUIStore } from '@/stores/useUIStore';

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  variantId,
  disabled = false,
}: AddToCartButtonProps) {
  const [state, setState] = useState<'idle' | 'adding' | 'success'>('idle');
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useUIStore((s) => s.addToast);

  const handleClick = async () => {
    if (state !== 'idle' || disabled) return;
    setState('adding');

    try {
      await addItem(productId, variantId);
      setState('success');
      addToast({ type: 'success', message: 'Added to cart!' });
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('idle');
      addToast({ type: 'error', message: 'Failed to add to cart' });
    }
  };

  return (
    <motion.button
      whileHover={state === 'idle' ? { scale: 1.03 } : undefined}
      whileTap={state === 'idle' ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      className="relative w-full py-3 px-6 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundColor:
            state === 'success' ? '#22c55e' : state === 'adding' ? '#4f46e5' : '#1f2937',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Ripple effect */}
      <AnimatePresence>
        {state === 'adding' && (
          <motion.div
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full"
          />
        )}
      </AnimatePresence>

      <span className="relative z-10 flex items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Cart
            </motion.span>
          )}
          {state === 'adding' && (
            <motion.span
              key="adding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              Adding...
            </motion.span>
          )}
          {state === 'success' && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Added!
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
