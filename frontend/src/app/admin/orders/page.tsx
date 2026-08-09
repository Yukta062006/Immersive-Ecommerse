'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronRight } from 'lucide-react';
import type { OrderStatus } from '@/types/admin';
import { ORDER_STATUSES } from '@/types/admin';
import { fetchAdminOrders } from '@/lib/admin-api';
import { Button, Card, Input, Select, StatusBadge, EmptyState, Spinner } from '../_components/ui';
import { formatPrice } from '@/lib/utils';

const STATUS_OPTIONS: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'All statuses' },
  ...ORDER_STATUSES,
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'total_desc', label: 'Highest total' },
  { value: 'total_asc', label: 'Lowest total' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<'' | OrderStatus>('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders', { search: debouncedSearch, status, sort, page }],
    queryFn: () =>
      fetchAdminOrders({
        search: debouncedSearch || undefined,
        status: status || undefined,
        sort: sort as 'newest' | 'oldest' | 'total_desc' | 'total_asc',
        page,
        limit: 15,
      }),
  });

  const orders = ordersQuery.data?.data.items ?? [];
  const meta = ordersQuery.data?.data.meta;
  const loading = ordersQuery.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Orders</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
          {meta ? `${meta.total} order${meta.total === 1 ? '' : 's'}` : 'Loading…'}
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
            <Input
              className="pl-9"
              placeholder="Search by order number, customer name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value as '' | OrderStatus); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
          <Select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders found"
            message="Try adjusting your filters or search terms."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200 dark:text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium text-right">Total</th>
                  <th className="px-5 py-3 font-medium">Placed</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900 dark:text-zinc-200">{o.orderNumber}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700 dark:text-zinc-300 truncate max-w-[200px]">{o.customer.name ?? '—'}</p>
                      {o.customer.email && <p className="text-[11px] text-gray-500 dark:text-zinc-500 truncate max-w-[200px]">{o.customer.email}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-zinc-500">{o.itemsSummary.count}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-zinc-200 whitespace-nowrap">
                      {formatPrice(o.total)}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-zinc-500 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/orders/${o._id}`} className="inline-flex items-center gap-1 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {meta && !loading && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-zinc-500">
            Showing {((meta.current_page - 1) * meta.per_page) + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}