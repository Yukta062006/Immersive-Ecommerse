'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FeaturedBanner() {
  return (
    <section className="px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 py-16 px-8 md:px-16 text-center">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full mb-4"
            >
              Limited Time Offer
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-white mb-4"
            >
              Up to 40% Off
              <br />
              Summer Collection
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-indigo-100 text-lg mb-8 max-w-lg mx-auto"
            >
              Don&apos;t miss out on our biggest sale of the season. Premium quality at unbeatable prices.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/products?sale=true"
                className="px-8 py-3.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Shop the Sale
              </Link>
              <Link
                href="/products"
                className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                View All Products
              </Link>
            </motion.div>

            {/* Countdown placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mt-10"
            >
              {[
                { value: '02', label: 'Days' },
                { value: '14', label: 'Hours' },
                { value: '36', label: 'Mins' },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{item.value}</span>
                    </div>
                    <span className="text-xs text-indigo-200 mt-1 block">{item.label}</span>
                  </div>
                  {i < 2 && <span className="text-2xl text-white/40 font-light">:</span>}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
