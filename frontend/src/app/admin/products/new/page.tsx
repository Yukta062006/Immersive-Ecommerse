'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { fetchAdminCategories, createAdminProduct } from '@/lib/admin-api';
import ProductForm from '../_components/ProductForm';
import { Spinner } from '../../_components/ui';

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  });

  const createMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push('/admin/products');
    },
  });

  if (categoriesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to products
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">New product</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">Add a product to your catalog.</p>
      </div>

      <ProductForm
        initial={null}
        categories={categoriesQuery.data?.data.categories ?? []}
        submitting={createMutation.isPending}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />
    </div>
  );
}
