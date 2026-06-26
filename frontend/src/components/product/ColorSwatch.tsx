'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ColorSwatchProps {
  colors: { name: string; hex: string }[];
  selected: string | null;
  onSelect: (color: string) => void;
}

export default function ColorSwatch({ colors, selected, onSelect }: ColorSwatchProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Color{selected ? `: ${selected}` : ''}
      </h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color, index) => (
          <motion.button
            key={`${color.name}-${color.hex}-${index}`}
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            onClick={() => onSelect(color.name)}
            className={cn(
              'relative w-10 h-10 rounded-full border-2 transition-all',
              selected === color.name
                ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800 ring-offset-2 dark:ring-offset-zinc-900'
                : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {selected === color.name && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  className={cn(
                    'w-4 h-4',
                    color.hex === '#ffffff' || color.hex === '#fbbf24'
                      ? 'text-gray-900'
                      : 'text-white'
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
