/**
 * 配色方案管理工具
 */

export type ColorScheme = 'warm' | 'cool';

const STORAGE_KEY = 'app-color-scheme';

/**
 * 获取当前配色方案
 */
export function getColorScheme(): ColorScheme {
  if (typeof window === 'undefined') return 'warm';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ColorScheme) || 'warm';
  } catch {
    return 'warm';
  }
}

/**
 * 设置配色方案
 */
export function setColorScheme(scheme: ColorScheme): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, scheme);
    window.dispatchEvent(new CustomEvent('colorSchemeChange', { detail: { scheme } }));
  } catch (error) {
    console.error('Failed to save color scheme:', error);
  }
}
