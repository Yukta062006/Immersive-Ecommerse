'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export default function StaggerList({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(className)}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={item}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={item}>{children}</motion.div>
      }
    </motion.div>
  );
}
