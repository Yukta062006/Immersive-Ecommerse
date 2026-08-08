'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  FolderTree,
  Plus,
  Sparkles,
  Boxes,
  TrendingUp,
  Layers,
  ShoppingBag,
} from 'lucide-react';
import {
  fetchAdminProducts,
  fetchAdminCategories,
} from '@/lib/admin-api';
import { Card, StatusBadge, Spinner, Button } from './_components/ui';
import { formatPrice } from '@/lib/utils';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof Package;
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
        <p className="text-xs text-zinc-500 font-medium">{label}</p>
        <p className="text-2xl font-semibold text-zinc-100 mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const recent = useQuery({
    queryKey: ['admin', 'products', 'recent'],
    queryFn: () => fetchAdminProducts({ limit: 5 }),
  });
  const active = useQuery({
    queryKey: ['admin', 'stats', 'active'],
    queryFn: () => fetchAdminProducts({ status: 'active', limit: 1 }),
  });
  const draft = useQuery({
    queryKey: ['admin', 'stats', 'draft'],
    queryFn: () => fetchAdminProducts({ status: 'draft', limit: 1 }),
  });
  const archived = useQuery({
    queryKey: ['admin', 'stats', 'archived'],
    queryFn: () => fetchAdminProducts({ status: 'archived', limit: 1 }),
  });
  const featured = useQuery({
    queryKey: ['admin', 'stats', 'featured'],
    queryFn: () => fetchAdminProducts({ featured: true, limit: 1 }),
  });
  const all = useQuery({
    queryKey: ['admin', 'products', 'all'],
    queryFn: () => fetchAdminProducts({ limit: 100 }),
  });
  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
  });

  const loading =
    recent.isLoading || active.isLoading || draft.isLoading || archived.isLoading || featured.isLoading || all.isLoading || categories.isLoading;

  const totalProducts = recent.data?.data.pagination.total ?? 0;
  const totalStock = (all.data?.data.products ?? []).reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const totalCategories = categories.data?.data.categories.length ?? 0;
  const categoryProducts = (categories.data?.data.categories ?? []).reduce((sum, c) => sum + (c.productCount ?? 0), 0);
  const recentProducts = recent.data?.data.products ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="w-6 h-6 text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Overview</h2>
          <p className="text-sm text-zinc-500 mt-1">A snapshot of your store right now.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new">
            <Button variant="secondary" size="sm">
              <Plus className="w-4 h-4" />
              New product
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="outline" size="sm">
              <FolderTree className="w-4 h-4" />
              Categories
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total products" value={totalProducts} sub={`${featured.data?.data.pagination.total ?? 0} featured`} accent="bg-indigo-500/10 text-indigo-400" />
        <StatCard icon={ShoppingBag} label="Active" value={active.data?.data.pagination.total ?? 0} accent="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={Layers} label="Draft" value={draft.data?.data.pagination.total ?? 0} accent="bg-amber-500/10 text-amber-400" />
        <StatCard icon={Boxes} label="Total stock" value={totalStock} sub="units across all products" accent="bg-cyan-500/10 text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Recent products
              </h3>
              <Link href="/admin/products" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                View all →
              </Link>
            </div>
            {recentProducts.length === 0 ? (
              <p className="text-sm text-zinc-500 py-8 text-center">No products yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500 border-b border-zinc-800">
                      <th className="pb-2 font-medium">Product</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Price</th>
                      <th className="pb-2 font-medium text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((p) => (
                      <tr key={p._id} className="border-b border-zinc-800/50 last:border-0">
                        <td className="py-3 pr-4">
                          <Link href={`/admin/products/${p._id}/edit`} className="flex items-center gap-3 group">
                            {p.images[0] ? (
                              <img src={p.images[0].url} alt={p.images[0].alt || p.name} className="w-9 h-9 rounded-lg object-cover shrink-0 bg-zinc-800" />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-zinc-600" />
                              </div>
                            )}
                            <span className="font-medium text-zinc-200 group-hover:text-indigo-400 transition-colors truncate max-w-[220px]">
                              {p.name}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-300 whitespace-nowrap">{formatPrice(p.price)}</td>
                        <td className="py-3 text-right text-zinc-400 whitespace-nowrap">{p.stock ?? 0}</td>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Categories
              </h3>
              <Link href="/admin/categories" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Manage →
              </Link>
            </div>
            <p className="text-3xl font-semibold text-zinc-100">{totalCategories}</p>
            <p className="text-xs text-zinc-500 mt-1">{categoryProducts} active products across categories</p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Quick actions</h3>
            <div className="space-y-2">
              <Link href="/admin/products/new" className="block">
                <Button variant="secondary" size="md" className="w-full justify-start">
                  <Plus className="w-4 h-4" />
                  Add a product
                </Button>
              </Link>
              <Link href="/admin/categories" className="block">
                <Button variant="outline" size="md" className="w-full justify-start">
                  <FolderTree className="w-4 h-4" />
                  Manage categories
                </Button>
              </Link>
              <Link href="/" target="_blank" className="block">
                <Button variant="ghost" size="md" className="w-full justify-start">
                  <ShoppingBag className="w-4 h-4" />
                  View storefront
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
