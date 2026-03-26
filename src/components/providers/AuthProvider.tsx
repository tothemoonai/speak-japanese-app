'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasInitialized = useRef(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // 只初始化一次，避免无限循环
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initialize().finally(() => {
        // 初始化完成后，延迟隐藏加载状态，避免闪烁
        setTimeout(() => {
          setShowLoading(false);
        }, 300);
      });
    }
  }, [initialize]);

  // 显示全局加载状态
  if (showLoading && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
