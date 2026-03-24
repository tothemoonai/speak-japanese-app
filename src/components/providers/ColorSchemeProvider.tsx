'use client';

import { useEffect } from 'react';
import { getColorScheme, type ColorScheme } from '@/lib/utils/colorScheme';

/**
 * 配色方案Provider
 * 管理两种配色方案的切换：Warm（温馨可爱）和Cool（科技感）
 */
export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化配色方案
    const savedScheme = getColorScheme();
    applyColorScheme(savedScheme);

    // 监听配色方案变化事件
    const handleColorSchemeChange = (event: CustomEvent) => {
      const { scheme } = event.detail;
      applyColorScheme(scheme);
    };

    window.addEventListener('colorSchemeChange' as any, handleColorSchemeChange);

    return () => {
      window.removeEventListener('colorSchemeChange' as any, handleColorSchemeChange);
    };
  }, []);

  return <>{children}</>;
}

/**
 * 应用配色方案到document
 */
function applyColorScheme(scheme: ColorScheme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (scheme === 'cool') {
    root.setAttribute('data-color-scheme', 'cool');
  } else {
    root.removeAttribute('data-color-scheme');
  }
}
