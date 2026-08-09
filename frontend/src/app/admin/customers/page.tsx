'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Search, ChevronRight, Mail } from 'lucide-react';
import { fetchAdminCustomers } from '@/lib/admin-api';
import { Button, Card, Input, EmptyState, Spinner } from '../_components/ui';
import { formatPrice } from '@/lib/utils';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const customersQuery = useQuery({
    queryKey: ['admin', 'customers', { search: debouncedSearch, page }],
    queryFn: () =>
      fetchAdminCustomers({
        search: debouncedSearch || undefined,
        page,
        limit: 10,
      }),
  });

  const customers = customersQuery.data?.data.items ?? [];
  const meta = customersQuery.data?.data.meta;
  const loading = customersQuery.isLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Customers</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
          {meta ? `${meta.total} customer${meta.total === 1 ? '' : 's'}` : 'Loading…'}
        </p>
      </div>

      <Card className="p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Spinner className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            message="Try adjusting your search terms."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200 dark:text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium text-right">Total spent</th>
                  <th className="px-5 py-3 font-medium text-right">Avg order</th>
                  <th className="px-5 py-3 font-medium">Last order</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-500/15 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-zinc-200 truncate max-w-[200px]">{c.name}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500 flex items-center gap-1 truncate max-w-[220px]">
                            <Mail className="w-3 h-3 shrink-0" /> {c.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-zinc-500">{c.orderCount}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 dark:text-zinc-200 whitespace-nowrap">
                      {formatPrice(c.totalSpent)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 dark:text-zinc-500 whitespace-nowrap">
                      {formatPrice(c.avgOrderValue)}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-zinc-500 whitespace-nowrap">{formatDate(c.lastOrderAt)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/customers/${c._id}`} className="inline-flex items-center gap-1 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors">
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