import { Suspense } from 'react';
import { Metadata } from 'next';
import ProductsPageClient from './ProductsPageClient';

export const metadata: Metadata = {
  title: 'Products | IMMERSIVE',
  description: 'Browse our immersive collection of cutting-edge products.',
};

export default async function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsPageClient />
    </Suspense>
  );
}
