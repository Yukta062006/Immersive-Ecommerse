'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

function Star({
  filled,
  half,
  size,
  animated,
  index,
}: {
  filled: boolean;
  half: boolean;
  size: string;
  animated: boolean;
  index: number;
}) {
  return (
    <motion.svg
      className={cn(size, 'inline-block')}
      viewBox="0 0 24 24"
      initial={animated ? { scale: 0, rotate: -180 } : false}
      animate={animated ? { scale: 1, rotate: 0 } : false}
      transition={
        animated
          ? { delay: index * 0.1, type: 'spring', stiffness: 260, damping: 20 }
          : undefined
      }
    >
      <defs>
        <linearGradient id={`half-${index}`}>
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="50%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={
          filled ? '#facc15' : half ? `url(#half-${index})` : '#e5e7eb'
        }
        stroke={filled || half ? '#facc15' : '#d1d5db'}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

export default function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  animated = true,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            filled={filled}
            half={half}
            size={sizeMap[size]}
            animated={animated}
            index={i}
          />
        );
      })}
    </div>
  );
}
