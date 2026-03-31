import { cn } from '@/lib/utils';
import { Icon } from './Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  accent?: 'primary' | 'secondary' | 'tertiary';
  icon?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  unit,
  accent = 'primary',
  icon,
  className,
}: StatCardProps) {
  const accentColors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
  };

  return (
    <div
      className={cn(
        'bg-surface-container-low p-6 rounded-2xl',
        'flex flex-col justify-between',
        'hover:bg-surface-container transition-colors',
        className
      )}
    >
      {icon && (
        <Icon
          name={icon}
          size={20}
          className={cn(accentColors[accent], 'mb-4')}
          fill
        />
      )}
      {!icon && (
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-secondary opacity-50">
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-1">
        <span className="font-headline text-3xl font-bold text-on-surface">
          {value}
        </span>
        {unit && (
          <span className={cn('text-lg opacity-50 font-headline', accentColors[accent])}>
            {unit}
          </span>
        )}
      </div>
      {icon && (
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">
          {label}
        </span>
      )}
    </div>
  );
}
