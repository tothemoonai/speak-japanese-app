'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'ダッシュボード', path: '/dashboard' },
  { icon: 'menu_book', label: '教材', path: '/books' },
  { icon: 'leaderboard', label: 'レポート', path: '/reports' },
  { icon: 'settings', label: '設定', path: '/settings' },
] as const;

export function BottomNavBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 w-full z-50',
        'flex justify-around items-center px-4 pb-6 pt-3',
        'bg-surface/95 backdrop-blur-xl rounded-t-3xl',
        'border-t border-primary/15',
        'nav-shadow'
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path === '/books' && pathname.startsWith('/books')) ||
          (item.path === '/books' && pathname.startsWith('/courses'));

        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
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
