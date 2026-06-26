'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface LookbookItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  href: string;
  span: 'normal' | 'wide' | 'tall';
}

const lookbookItems: LookbookItem[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
    title: 'Summer Essentials',
    subtitle: 'Lightweight styles for warm days',
    href: '/products?category=Footwear',
    span: 'wide',
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    title: 'Tech Accessories',
    subtitle: 'Smart gadgets for everyday',
    href: '/products?category=Accessories',
    span: 'normal',
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=800&fit=crop',
    title: 'Outerwear Collection',
    subtitle: 'Stay warm in style',
    href: '/products?category=Outerwear',
    span: 'tall',
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    title: 'Audio Gear',
    subtitle: 'Premium sound experience',
    href: '/products?category=Electronics',
    span: 'normal',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    title: 'New Arrivals',
    subtitle: 'Fresh drops this week',
    href: '/products?sort=newest',
    span: 'normal',
  },
];

export default function Lookbook() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="py-16 px-4 bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Lookbook</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Curated style inspiration</p>
          </div>
          <Link href="/products" className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:text-indigo-700 dark:hover:text-indigo-300">
            Shop All
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[240px]">
          {lookbookItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl overflow-hidden cursor-pointer group ${
                item.span === 'wide' ? 'col-span-2' : ''
              } ${item.span === 'tall' ? 'row-span-2' : ''}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link href={item.href} className="block w-full h-full">
                <div className="relative w-full h-full">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <motion.div
                      initial={false}
                      animate={hoveredId === item.id ? { y: 0, opacity: 1 } : { y: 10, opacity: 0.9 }}
                    >
                      <h3 className="text-white font-semibold text-lg md:text-xl">{item.title}</h3>
                      <p className="text-white/70 text-sm mt-1">{item.subtitle}</p>
                    </motion.div>

                    <motion.div
                      initial={false}
                      animate={hoveredId === item.id ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ delay: 0.1 }}
                      className="mt-3"
                    >
                      <span className="inline-flex items-center gap-1 text-white text-sm font-medium">
                        Shop Now
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
