'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCartStore } from '@/stores/useCartStore';

export default function AuthInitializer() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    async function init() {
      await loadUser();
      await useCartStore.getState().loadCart();
    }
    init();
  }, [loadUser]);

  return null;
}
