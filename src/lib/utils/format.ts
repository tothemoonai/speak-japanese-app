/**
 * Format duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '0分钟';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }

  return `${minutes}分钟`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date time to locale string
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get week number of a date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get start and end date of a week
 */
export function getWeekBounds(year: number, weekNumber: number): { start: Date; end: Date } {
  const start = new Date(year, 0, 1);
  const dayOfWeek = start.getDay();
  const diff = (dayOfWeek + 6) % 7;
  start.setDate(start.getDate() - diff + (weekNumber - 1) * 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return { start, end };
}
