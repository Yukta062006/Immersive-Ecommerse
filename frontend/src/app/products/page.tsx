import { Metadata } from 'next';
import ProductsPageClient from './ProductsPageClient';

export const metadata: Metadata = {
  title: 'Products | IMMERSIVE',
  description: 'Browse our immersive collection of cutting-edge products.',
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ brand?: string; category?: string }> }) {
  const params = await searchParams;
  return <ProductsPageClient initialBrand={params.brand} initialCategory={params.category} />;
}
