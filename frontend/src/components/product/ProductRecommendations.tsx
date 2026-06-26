'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import RatingStars from '@/components/ui/RatingStars';
import PriceTag from '@/components/ui/PriceTag';

interface ProductRecommendationsProps {
  products: Product[];
  title?: string;
}

export default function ProductRecommendations({
  products,
  title = 'You May Also Like',
}: ProductRecommendationsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <Link href="/products" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/products/${product.id}`} className="block group">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-zinc-800 mb-2">
                <Image
                  src={product.images[0]?.url || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {product.salePrice && (
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                    Sale
                  </span>
                )}
              </div>
              <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <RatingStars rating={product.averageRating} size="sm" animated={false} />
                <span className="text-xs text-gray-400 dark:text-gray-500">({product.reviewCount})</span>
              </div>
              <PriceTag price={product.price} salePrice={product.salePrice} size="sm" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
