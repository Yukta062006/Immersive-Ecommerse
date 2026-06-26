'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductFilters as Filters } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  categories: string[];
  brands?: string[];
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Purple', hex: '#a855f7' },
];

export default function ProductFilters({
  filters,
  onFilterChange,
  categories,
  brands = [],
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (key: keyof Filters, value: unknown) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'sizes' | 'colors', value: string) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden mb-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </button>

      {/* Desktop: always visible */}
      <div className="hidden lg:block space-y-6">
        {/* Category */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleFilter('category', filters.category === cat ? undefined : cat)}
                className={cn(
                  'block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                  filters.category === cat
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        {brands.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Brand</h3>
            <div className="space-y-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleFilter('brand', filters.brand === brand ? undefined : brand)}
                  className={cn(
                    'block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                    filters.brand === brand
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  )}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => toggleFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => toggleFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Minimum Rating</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => toggleFilter('rating', filters.rating === rating ? undefined : rating)}
                aria-label={`${rating} star minimum`}
              >
                <svg
                  className={cn('w-6 h-6', (filters.rating && rating <= filters.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-zinc-600')}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        <button
          onClick={() => onFilterChange({})}
          className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Clear All Filters
        </button>
      </div>

      {/* Mobile: animated toggle */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden space-y-6"
          >
            {/* Category */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Category</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleFilter('category', filters.category === cat ? undefined : cat)}
                    className={cn(
                      'block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                      filters.category === cat
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Brand</h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => toggleFilter('brand', filters.brand === brand ? undefined : brand)}
                      className={cn(
                        'block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                        filters.brand === brand
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      )}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => toggleFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => toggleFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg bg-transparent focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleArrayFilter('sizes', size)}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-full border transition-colors',
                      filters.sizes?.includes(size)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600'
                    )}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleArrayFilter('colors', color.name)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all',
                      filters.colors?.includes(color.name)
                        ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800'
                        : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Minimum Rating</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => toggleFilter('rating', filters.rating === rating ? undefined : rating)}
                    aria-label={`${rating} star minimum`}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <svg
                       className={cn('w-6 h-6', filters.rating === rating ? 'text-yellow-400' : 'text-gray-300 dark:text-zinc-600')}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            <button
              onClick={() => onFilterChange({})}
              className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
