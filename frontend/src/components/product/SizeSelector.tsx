'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
  selected: string | null;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ sizes, selected, onSelect }: SizeSelectorProps) {
  const instanceId = useId();

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Size</h3>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <motion.button
            key={size}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => onSelect(size)}
            className={cn(
              'relative px-4 py-2 text-sm font-medium rounded-full border-2 transition-colors',
              selected === size
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600'
            )}
          >
            {selected === size && (
              <motion.div
                layoutId={`size-indicator-${instanceId}`}
                className="absolute inset-0 bg-indigo-500 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{size}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
