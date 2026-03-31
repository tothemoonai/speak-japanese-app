'use client';

import { TopAppBar } from './TopAppBar';
import { BottomNavBar } from './BottomNavBar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
  headerRight?: React.ReactNode;
  noPadding?: boolean;
}

export function AppLayout({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  className,
  headerRight,
  noPadding = false,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopAppBar
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        onBack={onBack}
        rightSlot={headerRight}
      />
      <main
        className={cn(
          'flex-1 pb-32',
          !noPadding && 'px-6 pt-6 max-w-7xl mx-auto w-full',
          className
        )}
      >
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}
