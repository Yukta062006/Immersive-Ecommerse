'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stats = [
  { value: 50000, suffix: '+', label: 'Happy Customers' },
  { value: 10000, suffix: '+', label: 'Products Sold' },
  { value: 49, suffix: '', decimals: 1, label: 'Average Rating' },
  { value: 24, suffix: '/7', label: 'Customer Support' },
];

export default function StatsBar() {
  return (
    <section className="py-12 px-4 bg-indigo-600">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-white">
                {i === 2 ? (
                  <AnimatedCounter target={49} suffix="" duration={1500} />
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
                {i === 2 && <span className="text-white/80 text-2xl">.9</span>}
              </div>
              <div className="text-indigo-200 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
