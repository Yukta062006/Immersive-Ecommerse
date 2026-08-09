'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Plus, Search, Pencil, Archive, Trash2, Package } from 'lucide-react';
import type { ProductStatus } from '@/types/admin';
import type { ProductPayload } from '@/lib/admin-api';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  deleteAdminProduct,
  updateAdminProduct,
} from '@/lib/admin-api';
import { Button, Card, Input, Select, StatusBadge, ConfirmModal, Pagination, EmptyState, Spinner } from '../_components/ui';
import { formatPrice } from '@/lib/utils';

const STATUS_OPTIONS: { value: '' | ProductStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<'' | ProductStatus>('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: string; name: string; kind: 'archive' | 'delete' } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const productsQuery = useQuery({
    queryKey: ['admin', 'products', { search: debouncedSearch, status, category, page }],
    queryFn: () =>
      fetchAdminProducts({
        search: debouncedSearch || undefined,
        status: status || undefined,
        category_id: category || undefined,
        page,
        limit: 10,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
  }, [queryClient]);

  const archiveMutation = useMutation({
    mutationFn: (id: string) => updateAdminProduct(id, { status: 'archived' } as ProductPayload),
    onSuccess: () => {
      invalidate();
      setConfirm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => {
      invalidate();
      setConfirm(null);
    },
  });

  const products = productsQuery.data?.data.products ?? [];
  const pagination = productsQuery.data?.data.pagination;
  const categories = categoriesQuery.data?.data.categories ?? [];

  const runningMutation = archiveMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Products</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
            {pagination ? `${pagination.total} product${pagination.total === 1 ? '' : 's'}` : 'Loading…'}
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4" />
            New product
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-zinc-500 pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value as '' | ProductStatus); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {productsQuery.isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            message={debouncedSearch || status || category ? 'Try adjusting your filters or search.' : 'Add your first product to get started.'}
            action={
              !debouncedSearch && !status && !category ? (
                <Link href="/admin/products/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    New product
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-zinc-500 border-b border-gray-200 dark:border-zinc-800">
                  <th className="py-3 px-5 font-medium">Product</th>
                  <th className="py-3 px-5 font-medium">Category</th>
                  <th className="py-3 px-5 font-medium">Status</th>
                  <th className="py-3 px-5 font-medium text-right">Price</th>
                  <th className="py-3 px-5 font-medium text-right">Stock</th>
                  <th className="py-3 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-gray-200/60 dark:border-zinc-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {p.images[0] ? (
                          <Image src={p.images[0].url} alt={p.images[0].alt || p.name} width={40} height={40} unoptimized className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-gray-400 dark:text-zinc-600" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-zinc-200 truncate max-w-[240px]">{p.name}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 truncate max-w-[240px]">{p.sku || p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-gray-500 dark:text-zinc-400">{p.category?.name ?? '—'}</td>
                    <td className="py-3 px-5"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-5 text-right text-gray-700 dark:text-zinc-300 whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="py-3 px-5 text-right text-gray-500 dark:text-zinc-400 whitespace-nowrap">{p.stock ?? 0}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/${p._id}/edit`} className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700/60 transition-colors" aria-label={`Edit ${p.name}`}>
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {p.status !== 'archived' && (
                          <button
                            onClick={() => setConfirm({ id: p._id, name: p.name, kind: 'archive' })}
                            className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            aria-label={`Archive ${p.name}`}
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setConfirm({ id: p._id, name: p.name, kind: 'delete' })}
                          className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pagination && pagination.pages > 1 && (
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
      )}

      <ConfirmModal
        open={confirm !== null}
        title={confirm?.kind === 'archive' ? 'Archive product?' : 'Delete product?'}
        message={
          confirm?.kind === 'archive' ? (
            <>
              <span className="font-medium text-gray-900 dark:text-zinc-200">{confirm?.name}</span> will be hidden from the storefront
              immediately. You can restore it later.
            </>
          ) : (
            <>
              <span className="font-medium text-gray-900 dark:text-zinc-200">{confirm?.name}</span> will be permanently deleted. This action
              cannot be undone.
            </>
          )
        }
        confirmLabel={confirm?.kind === 'archive' ? 'Archive' : 'Delete'}
        loading={runningMutation}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === 'archive') archiveMutation.mutate(confirm.id);
          else deleteMutation.mutate(confirm.id);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
