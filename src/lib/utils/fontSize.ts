/**
 * 字体大小管理工具
 * 支持的字体大小级别：small, medium, large, xlarge
 */

export type FontSizeLevel = 'small' | 'medium' | 'large' | 'xlarge';

export const FONT_SIZE_LEVELS: Record<FontSizeLevel, { label: string; scale: number }> = {
  small: { label: '小', scale: 0.85 },
  medium: { label: '中', scale: 1.0 },
  large: { label: '大', scale: 1.15 },
  xlarge: { label: '特大', scale: 1.3 },
};

const STORAGE_KEY = 'app-font-size';

/**
 * 获取保存的字体大小级别
 */
export function getStoredFontSize(): FontSizeLevel {
  if (typeof window === 'undefined') return 'medium';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as FontSizeLevel) || 'medium';
  } catch {
    return 'medium';
  }
}

/**
 * 保存字体大小级别
 */
export function setStoredFontSize(level: FontSizeLevel): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, level);
    // 触发自定义事件，让其他组件知道字体大小已更改
    window.dispatchEvent(new CustomEvent('fontSizeChange', { detail: { level } }));
  } catch (error) {
    console.error('Failed to save font size:', error);
  }
}

/**
 * 获取字体大小的缩放比例
 */
export function getFontScale(level?: FontSizeLevel): number {
  const fontSizeLevel = level || getStoredFontSize();
  return FONT_SIZE_LEVELS[fontSizeLevel].scale;
}

/**
 * 应用字体大小到document
 */
export function applyFontSize(level: FontSizeLevel): void {
  if (typeof document === 'undefined') return;

  const scale = getFontScale(level);
  document.documentElement.style.setProperty('--font-scale', scale.toString());
}
