'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, AlertTriangle, ChevronRight, Package } from 'lucide-react';
import { fetchAdminCustomer } from '@/lib/admin-api';
import { Button, Card, Spinner, StatusBadge } from '../../_components/ui';
import { formatPrice } from '@/lib/utils';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'customer', params.id],
    queryFn: () => fetchAdminCustomer(params.id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <Card className="p-10 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Customer not found</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mb-4">This customer may have been removed.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/customers')}>Back to customers</Button>
      </Card>
    );
  }

  const { customer, kpis, orders } = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/customers')}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Back to customers"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">{customer.name}</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-0.5 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> {customer.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">Total spent</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mt-0.5">{formatPrice(kpis.totalSpent)}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Delivered orders only</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">Orders</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mt-0.5">{kpis.orderCount}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Last order {formatDate(kpis.lastOrderAt)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">Avg order value</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mt-0.5">{formatPrice(kpis.avgOrderValue)}</p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">Joined {formatDate(kpis.joinedAt)}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Recent orders</h3>
          <span className="text-[11px] text-gray-500 dark:text-zinc-500">Up to 15 most recent</span>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-zinc-500 py-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-zinc-500 border-b border-gray-200 dark:border-zinc-800">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium">Placed</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-gray-100 last:border-0 dark:border-zinc-800/50">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="inline-flex items-center gap-1 font-medium text-gray-900 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                    <td className="py-3 pr-4 text-right font-medium text-gray-900 dark:text-zinc-200 whitespace-nowrap">{formatPrice(o.total)}</td>
                    <td className="py-3 pr-4 text-gray-500 dark:text-zinc-500 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                    <td className="py-3 text-right">
                      <Link href={`/admin/orders/${o._id}`} className="inline-flex p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-500/10 dark:hover:text-indigo-400 transition-colors">
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
    </div>
  );
}