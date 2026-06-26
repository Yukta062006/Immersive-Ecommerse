'use client';

import { useEffect, useRef, useMemo } from 'react';

export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const stableOptions = useMemo(() => options, [JSON.stringify(options)]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, ...stableOptions }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stableOptions]);

  return ref;
}
