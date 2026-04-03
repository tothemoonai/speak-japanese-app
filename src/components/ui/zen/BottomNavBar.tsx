'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'ホーム', path: '/dashboard' },
  { icon: 'menu_book', label: '教材', path: '/books' },
  { icon: 'mic', label: '練習', path: '__practice__' },
  { icon: 'leaderboard', label: 'レポート', path: '/reports' },
  { icon: 'settings', label: '設定', path: '/settings' },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const getPracticePath = () => {
    if (typeof window === 'undefined') return '/books';
    const lastCourseId = localStorage.getItem('lastPracticeCourseId');
    return lastCourseId ? `/practice/${lastCourseId}` : '/books';
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 w-full z-50',
        'flex justify-around items-center px-2 pb-6 pt-3',
        'bg-surface/95 backdrop-blur-xl rounded-t-3xl',
        'border-t border-primary/15',
        'nav-shadow'
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isPractice = item.path === '__practice__';
        const isActive =
          (!isPractice && pathname === item.path) ||
          (item.path === '/books' && pathname.startsWith('/books')) ||
          (item.path === '/books' && pathname.startsWith('/courses')) ||
          (isPractice && pathname.startsWith('/practice'));

        return (
          <button
            key={item.path}
            onClick={() => router.push(isPractice ? getPracticePath() : item.path)}
            className={cn(
              'flex flex-col items-center justify-center transition-all active:scale-90',
              isActive
                ? 'text-primary font-bold bg-primary/10 rounded-xl px-3 py-1'
                : 'text-secondary opacity-60 hover:opacity-100 hover:text-primary/80'
            )}
          >
            <Icon name={item.icon} fill={isActive} className="mb-1" />
            <span className="font-label text-[10px] uppercase tracking-widest">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
