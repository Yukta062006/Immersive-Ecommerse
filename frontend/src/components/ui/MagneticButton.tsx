'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}

export default function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.3,
}: MagneticButtonProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    e.currentTarget.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translate(0px, 0px)';
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}
