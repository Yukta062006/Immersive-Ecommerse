'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const brands = [
  'Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'Puma',
  'New Balance', 'Under Armour', 'Jordan', "Levi's",
  'North Face', 'Patagonia', 'Ray-Ban', 'Oakley',
];

export default function BrandTicker() {
  return (
    <section className="py-8 border-y border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="flex items-center">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...brands, ...brands].map((brand, i) => (
            <Link
              key={`${brand}-${i}`}
              href={`/products?brand=${encodeURIComponent(brand)}`}
              className="text-lg font-semibold text-gray-300 dark:text-zinc-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              {brand}
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
