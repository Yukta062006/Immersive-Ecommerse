'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [stableOptions, setStableOptions] = useState<IntersectionObserverInit | undefined>(options);
  const optionsKey = JSON.stringify(options ?? null);
  const [prevOptionsKey, setPrevOptionsKey] = useState(optionsKey);

  if (optionsKey !== prevOptionsKey) {
    setPrevOptionsKey(optionsKey);
    setStableOptions(options);
  }

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
