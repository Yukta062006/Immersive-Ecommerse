'use client';

import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  count?: number;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-gray-200 dark:bg-zinc-800', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  );
}

export default function SkeletonCard({ className, count = 1 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm', className)}>
          <Skeleton className="h-48 w-full rounded-xl mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}
