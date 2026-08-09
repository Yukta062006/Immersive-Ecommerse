'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import {
  fetchAdminCategories,
  fetchAdminProduct,
  updateAdminProduct,
} from '@/lib/admin-api';
import ProductForm from '../../_components/ProductForm';
import { Spinner, EmptyState, Button } from '../../../_components/ui';

export default function EditProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';

  const productQuery = useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => fetchAdminProduct(id),
    enabled: Boolean(id),
  });
  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateAdminProduct>[1]) => updateAdminProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] });
      router.push('/admin/products');
    },
  });

  const loading = productQuery.isLoading || categoriesQuery.isLoading;
  const notFound = productQuery.isError;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <EmptyState
        title="Product not found"
        message="This product may have been deleted."
        action={
          <Link href="/admin/products">
            <Button size="sm">Back to products</Button>
          </Link>
        }
      />
    );
  }

  const product = productQuery.data?.data.product;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to products
        </Link>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Edit product</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">{product?.name}</p>
      </div>

      <ProductForm
        initial={product}
        categories={categoriesQuery.data?.data.categories ?? []}
        submitting={updateMutation.isPending}
        onSubmit={(payload) => updateMutation.mutate(payload)}
      />
    </div>
  );
}
