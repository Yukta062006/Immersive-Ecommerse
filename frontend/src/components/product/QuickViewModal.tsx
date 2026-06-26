'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import RatingStars from '@/components/ui/RatingStars';
import PriceTag from '@/components/ui/PriceTag';
import { useCartStore } from '@/stores/useCartStore';
import { useUIStore } from '@/stores/useUIStore';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useUIStore((s) => s.addToast);

  if (!product) return null;

  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[];

  const selectedVariant = product.variants.find(
    (v) =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize || v.size === selectedSize)
  );

  const handleAddToCart = () => {
    const variantId = selectedVariant?.id || product.variants[0]?.id;
    if (variantId) {
      addItem(product.id, variantId);
      addToast({ type: 'success', message: `${product.name} added to cart` });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 sm:w-full sm:max-w-2xl sm:max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close quick view"
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col sm:flex-row overflow-auto">
              {/* Image */}
              <div className="relative w-full sm:w-1/2 aspect-square bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
                <Image
                  src={product.images[0]?.url || '/placeholder.svg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
                {product.salePrice && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                    Sale
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 p-6 space-y-4">
                <div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{product.category}</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{product.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <RatingStars rating={product.averageRating} size="sm" animated={false} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.averageRating} ({product.reviewCount} reviews)
                  </span>
                </div>

                <PriceTag price={product.price} salePrice={product.salePrice} size="lg" />

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{product.description}</p>

                {/* Colors */}
                {colors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</p>
                    <div className="flex gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color === selectedColor ? null : color)}
                          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                            selectedColor === color
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                              : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {sizes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</p>
                    <div className="flex gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                          className={`w-10 h-10 text-sm rounded-lg border transition-colors ${
                            selectedSize === size
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium'
                              : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock */}
                {selectedVariant && (
                  <p className="text-sm">
                    {selectedVariant.stock > 0 ? (
                      <span className="text-green-600 dark:text-green-400">In stock ({selectedVariant.stock} available)</span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400">Out of stock</span>
                    )}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant || selectedVariant.stock === 0}
                    className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    onClick={onClose}
                    className="px-4 py-3 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
