'use client';

import { useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface TopAppBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
  rightSlot?: React.ReactNode;
}

export function TopAppBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  className,
  rightSlot,
}: TopAppBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        'w-full top-0 sticky z-50',
        'header-gradient',
        'flex justify-between items-center px-6 py-4',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="text-primary active:scale-95 duration-200"
          >
            <Icon name="arrow_back" />
          </button>
        )}
        <div className="flex flex-col">
          {subtitle && (
            <span className="font-label text-[10px] text-secondary opacity-60 uppercase tracking-widest">
              {subtitle}
            </span>
          )}
          <h1 className="font-headline font-bold tracking-tight text-xl text-primary tracking-tighter">
            {title}
          </h1>
        </div>
      </div>
      {rightSlot && <div>{rightSlot}</div>}
    </header>
  );
}
