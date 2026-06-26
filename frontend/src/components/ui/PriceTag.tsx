'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  salePrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export default function PriceTag({
  price,
  salePrice,
  size = 'md',
  className,
}: PriceTagProps) {
  const hasDiscount = salePrice && salePrice < price;

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-bold text-gray-900 dark:text-white', sizeClasses[size])}>
        {formatPrice(hasDiscount ? salePrice! : price)}
      </span>
      <AnimatePresence>
        {hasDiscount && (
          <>
            <span className={cn('text-gray-400 dark:text-gray-500 line-through', sizeClasses[size === 'lg' ? 'md' : 'sm'])}>
              {formatPrice(price)}
            </span>
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            >
              -{Math.round(((price - salePrice!) / price) * 100)}%
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
