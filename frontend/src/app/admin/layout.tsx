'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminShell from './_components/AdminShell';
import { Spinner } from './_components/ui';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-zinc-500">
        <Spinner className="w-5 h-5 text-indigo-400" />
        <span className="text-sm">Loading admin…</span>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoading || isLoginPage) return;
    if (!isAuthenticated) {
      router.replace('/admin/login');
    } else if (user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, user?.role, isLoginPage, router]);

  // Login page has its own centered shell.
  if (isLoginPage) return <>{children}</>;

  if (isLoading) return <LoadingScreen />;

  // Not authenticated or not an admin → redirecting.
  if (!isAuthenticated || user?.role !== 'admin') return <LoadingScreen />;

  return <AdminShell>{children}</AdminShell>;
}
