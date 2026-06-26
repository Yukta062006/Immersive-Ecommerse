'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import ToastContainer from '@/components/ui/Toast';
import AuthInitializer from '@/components/providers/AuthInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <ToastContainer />
      {children}
    </QueryClientProvider>
  );
}
