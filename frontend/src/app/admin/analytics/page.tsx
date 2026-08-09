'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, IndianRupee, ShoppingCart, Users, Receipt } from 'lucide-react';
import type { AnalyticsRange } from '@/types/admin';
import { ORDER_STATUSES } from '@/types/admin';
import { fetchAdminAnalytics } from '@/lib/admin-api';
import { Card, Spinner } from '../_components/ui';
import { formatPrice } from '@/lib/utils';
import { useIsDark } from '@/lib/use-is-dark';
import { cn } from '@/lib/utils';

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last year' },
  { value: 'all', label: 'All time' },
];

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof IndianRupee;
  label: string;
  value: string;
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

function formatCompact(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return String(Math.round(value));
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>('30');
  const isDark = useIsDark();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'analytics', range],
    queryFn: () => fetchAdminAnalytics(range),
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
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">Could not load analytics</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-500 mb-4">The server may be offline. Try again.</p>
        <button onClick={() => refetch()} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
          Retry
        </button>
      </Card>
    );
  }

  const a = data.data;
  const kpis = a.kpis;
  const gridColor = isDark ? '#27272a' : '#e5e7eb';
  const tickColor = isDark ? '#71717a' : '#9ca3af';
  const totalStatuses = Object.values(a.statusBreakdown).reduce((x, y) => x + y, 0);
  const chartData = a.revenueTrend.map((row, i) => ({ ...row, orders: a.orderTrend[i]?.orders ?? 0 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
            {a.from && a.to
              ? `${new Date(a.from).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – ${new Date(a.to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : 'All time'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                range === r.value
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                  : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={IndianRupee} label="Revenue" value={formatPrice(kpis.revenue)} accent="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" />
        <KpiCard icon={ShoppingCart} label="Orders" value={String(kpis.orders)} accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <KpiCard icon={Receipt} label="Avg order value" value={formatPrice(kpis.averageOrderValue)} accent="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
        <KpiCard icon={Users} label="New customers" value={String(kpis.newCustomers)} sub={`${kpis.totalCustomers} total`} accent="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.revenueTrend} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: tickColor }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    tickFormatter={(v: number) => formatCompact(v)}
                    tick={{ fontSize: 11, fill: tickColor }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <ChartTooltip
                    cursor={{ fill: isDark ? '#27272a33' : '#f3f4f666' }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs dark:bg-zinc-900 dark:border-zinc-700">
                          <p className="font-medium text-gray-900 dark:text-zinc-100 mb-0.5">{label}</p>
                          <p className="text-indigo-600 dark:text-indigo-400">{formatPrice(payload[0].value as number)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Orders vs revenue</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: tickColor }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: tickColor }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} width={48} />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0].payload as { revenue: number; orders: number };
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs dark:bg-zinc-900 dark:border-zinc-700">
                          <p className="font-medium text-gray-900 dark:text-zinc-100 mb-1">{label}</p>
                          <p className="text-indigo-600 dark:text-indigo-400">{formatPrice(row.revenue)} revenue</p>
                          <p className="text-emerald-600 dark:text-emerald-400">{row.orders} orders</p>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Order status</h3>
            <div className="space-y-3">
              {ORDER_STATUSES.map((s) => {
                const count = a.statusBreakdown[s.value] ?? 0;
                const pct = totalStatuses > 0 ? Math.round((count / totalStatuses) * 100) : 0;
                return (
                  <div key={s.value}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-zinc-400 capitalize">{s.label}</span>
                      <span className="text-xs text-gray-500 dark:text-zinc-500">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden dark:bg-zinc-800">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[s.value] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-4">Top products</h3>
            {a.topProducts.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-zinc-500 py-6 text-center">No sales in this window.</p>
            ) : (
              <div className="space-y-3">
                {a.topProducts.map((p, i) => (
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
        </div>
      </div>
    </div>
  );
}