'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 只初始化一次，避免无限循环
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initialize();
    }
  }, [initialize]);

  return <>{children}</>;
}
