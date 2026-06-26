'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-12-15',
    status: 'Delivered',
    total: 24999,
    items: [{ name: 'Wireless Headphones', qty: 1 }],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-12-28',
    status: 'Shipped',
    total: 18999,
    items: [{ name: 'Running Shoes', qty: 1 }, { name: 'Athletic Socks', qty: 2 }],
  },
  {
    id: 'ORD-2025-003',
    date: '2025-01-10',
    status: 'Processing',
    total: 5499,
    items: [{ name: 'Phone Case', qty: 1 }],
  },
];

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, isMockAuth, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-32" />
          <div className="h-32 bg-gray-200 dark:bg-zinc-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">My Account</h1>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              {isMockAuth && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                  Demo Mode
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="font-medium capitalize text-gray-900 dark:text-white">{user.role}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Order History</h3>
            <div className="space-y-3">
              {mockOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.items.map((i) => i.name).join(', ')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${(order.total / 100).toFixed(2)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/products"
              className="block w-full p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Addresses
            </Link>
            <Link
              href="/products"
              className="block w-full p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm text-left text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Payment Methods
            </Link>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="w-full p-4 bg-white dark:bg-zinc-900 rounded-xl border border-red-200 dark:border-red-800 shadow-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
