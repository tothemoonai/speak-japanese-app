'use client';

import { useEffect } from 'react';
import { getStoredFontSize, applyFontSize, type FontSizeLevel } from '@/lib/utils/fontSize';

/**
 * 字体大小Provider
 * 在客户端初始化并应用用户的字体大小偏好
 */
export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化字体大小
    const fontSize = getStoredFontSize();
    applyFontSize(fontSize);

    // 监听字体大小变化事件
    const handleFontSizeChange = (event: CustomEvent) => {
      const { level } = event.detail;
      applyFontSize(level);
    };

    window.addEventListener('fontSizeChange' as any, handleFontSizeChange);

    return () => {
      window.removeEventListener('fontSizeChange' as any, handleFontSizeChange);
    };
  }, []);

  return <>{children}</>;
}
