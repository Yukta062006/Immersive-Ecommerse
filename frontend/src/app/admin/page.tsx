'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  Users,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  Package,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { fetchAdminDashboard } from '@/lib/admin-api';
import { Card, StatusBadge, Spinner } from './_components/ui';
import { formatPrice } from '@/lib/utils';
import { useIsDark } from '@/lib/use-is-dark';
import { ORDER_STATUSES } from '@/types/admin';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <Card className="p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-zinc-500 font-medium">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </Card>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500',
  processing: 'bg-blue-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

function formatCompact(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return formatPrice(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchAdminDashboard,
  });
  const isDark = useIsDark();

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
        <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Could not load dashboard</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mb-4">The server may be offline. Try again.</p>
        <button
          onClick={() => refetch()}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
        >
          Retry
        </button>
      </Card>
    );
  }

  const d = data.data;
  const kpis = d.kpis;
  const totalStatuses = Object.values(d.statusBreakdown).reduce((a, b) => a + b, 0);
  const gridColor = isDark ? '#27272a' : '#e5e7eb';
  const tickColor = isDark ? '#71717a' : '#9ca3af';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Overview</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">A snapshot of your store right now.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/orders" className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
            View all orders →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={IndianRupee}
          label="Total revenue"
          value={formatPrice(kpis.revenue.total)}
          sub={`${formatPrice(kpis.revenue.month)} this month`}
          accent="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={ShoppingCart}
          label="Orders"
          value={kpis.orders.total}
          sub={`${kpis.orders.today} today · ${kpis.orders.pending} pending`}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={kpis.customers.total}
          sub={`${kpis.customers.month} joined this month`}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Activity}
          label="Avg order value"
          value={formatPrice(kpis.avgOrderValue)}
          sub={`${kpis.lowStock} low-stock products`}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Revenue (last 30 days)</h3>
              <span className="text-[11px] text-gray-500 dark:text-zinc-500">{d.revenueTrend.length} days</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.revenueTrend} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    tick={{ fontSize: 11, fill: tickColor }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={30}
                  />
                  <YAxis
                    tickFormatter={(v: number) => formatCompact(v)}
                    tick={{ fontSize: 11, fill: tickColor }}
                    tickLine={false}
                    axisLine={false}
                    width={64}
                  />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as { revenue: number; orders: number };
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs dark:bg-zinc-900 dark:border-zinc-700">
                          <p className="font-medium text-gray-900 dark:text-zinc-100 mb-0.5">{formatDate(label as string)}</p>
                          <p className="text-indigo-600 dark:text-indigo-400">{formatPrice(row.revenue)} revenue</p>
                          <p className="text-gray-500 dark:text-zinc-400">{row.orders} orders</p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#revenueFill)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Recent orders</h3>
              <Link href="/admin/orders" className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                View all →
              </Link>
            </div>
            {d.recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-500 py-8 text-center">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 dark:text-zinc-500 border-b border-gray-200 dark:border-zinc-800">
                      <th className="pb-2 font-medium">Order</th>
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.recentOrders.map((o) => (
                      <tr key={o._id} className="border-b border-gray-100 last:border-0 dark:border-zinc-800/50">
                        <td className="py-3 pr-4">
                          <Link href={`/admin/orders/${o._id}`} className="group inline-flex items-center gap-1 font-medium text-gray-900 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            <span className="truncate max-w-[160px]">{o.orderNumber}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">{formatDate(o.createdAt)}</p>
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-zinc-400 truncate max-w-[200px]">
                          {o.customer.name ?? o.customer.email ?? '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="py-3 text-right text-gray-900 dark:text-zinc-200 whitespace-nowrap font-medium">
                          {formatPrice(o.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Order status</h3>
            <div className="space-y-3">
              {ORDER_STATUSES.map((s) => {
                const count = d.statusBreakdown[s.value] ?? 0;
                const pct = totalStatuses > 0 ? Math.round((count / totalStatuses) * 100) : 0;
                return (
                  <div key={s.value}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-zinc-400 capitalize">{s.label}</span>
                      <span className="text-xs text-gray-500 dark:text-zinc-500">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden dark:bg-zinc-800">
                      <div className={`h-full rounded-full ${STATUS_COLORS[s.value]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Top selling</h3>
              <Link href="/admin/analytics" className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                Analytics →
              </Link>
            </div>
            {d.topSellingProducts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-500 py-6 text-center">No sales in this window.</p>
            ) : (
              <div className="space-y-3">
                {d.topSellingProducts.map((p, i) => (
                  <div key={p.productId ?? i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-semibold text-gray-500 dark:text-zinc-400 shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-zinc-200 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-500">{p.unitsSold} units sold</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-zinc-200 whitespace-nowrap">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Recent customers</h3>
            <div className="space-y-3">
              {d.recentCustomers.map((c) => (
                <Link key={c._id} href={`/admin/customers/${c._id}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/15 flex items-center justify-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {c.name?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-500 truncate">{c.email}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-600 whitespace-nowrap">{formatDate(c.createdAt)}</span>
                </Link>
              ))}
              {d.recentCustomers.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-zinc-500 py-4 text-center">No customers yet.</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Recent activity</h3>
            <div className="space-y-3">
              {d.activity.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-700 dark:text-zinc-300 leading-snug">
                      <Link href={`/admin/orders/${a.orderId}`} className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400">
                        {a.orderNumber ?? 'Order'}
                      </Link>{' '}
                      moved <span className="font-medium capitalize">{a.fromStatus ?? '—'}</span> →{' '}
                      <span className="font-medium capitalize">{a.toStatus}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-0.5">
                      {a.changedBy ?? 'System'} · {formatDate(a.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {d.activity.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-zinc-500 py-4 text-center">No recent activity.</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Quick actions</h3>
            <div className="space-y-2">
              <Link href="/admin/products/new" className="block">
                <span className="w-full inline-flex items-center justify-between text-sm font-medium text-gray-700 dark:text-zinc-300 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors px-4 py-2.5 rounded-lg">
                  Add a product <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/admin/orders" className="block">
                <span className="w-full inline-flex items-center justify-between text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors px-4 py-2.5 rounded-lg">
                  Manage orders <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/admin/settings" className="block">
                <span className="w-full inline-flex items-center justify-between text-sm font-medium text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors px-4 py-2.5 rounded-lg">
                  Store settings <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <Link href="/" target="_blank" className="block">
                <span className="w-full inline-flex items-center justify-between text-sm font-medium text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors px-4 py-2.5 rounded-lg">
                  <Package className="w-4 h-4" /> View storefront
                </span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}