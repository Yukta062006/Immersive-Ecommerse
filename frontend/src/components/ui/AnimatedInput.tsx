'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  required?: boolean;
}

export default function AnimatedInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  className,
  required,
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className={cn('relative', className)}>
      <motion.label
        className={cn(
          'absolute left-3 pointer-events-none transition-colors',
          isActive
            ? 'text-indigo-500 dark:text-indigo-400 text-xs top-1'
            : 'text-gray-400 dark:text-gray-500 top-3.5 text-sm'
        )}
        animate={{
          y: isActive ? -8 : 0,
          scale: isActive ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-0.5">*</span>}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          'w-full px-3 pt-5 pb-2 text-sm rounded-xl border-2 bg-transparent outline-none transition-colors',
          error
            ? 'border-red-500 focus:border-red-500'
            : focused
            ? 'border-indigo-500'
            : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
        )}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-0.5 bg-indigo-500 rounded-full"
        initial={{ width: 0, x: '-50%' }}
        animate={focused ? { width: '96%', x: '-50%' } : { width: 0, x: '-50%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
             className="text-red-500 dark:text-red-400 text-xs mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
