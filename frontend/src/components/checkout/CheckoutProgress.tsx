'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CheckoutProgressProps {
  currentStep: number;
  steps: string[];
}

export default function CheckoutProgress({ currentStep, steps }: CheckoutProgressProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isCompleted || isActive
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-500 dark:text-gray-400'
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </motion.div>
              <span className={cn(
                'text-xs mt-2 font-medium',
                isActive ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
              )}>
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="h-full bg-indigo-500"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
