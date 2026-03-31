import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  variant?: 'primary' | 'tertiary';
  className?: string;
  showGlow?: boolean;
  height?: string;
}

export function ProgressBar({
  value,
  variant = 'primary',
  className,
  showGlow = true,
  height = 'h-1',
}: ProgressBarProps) {
  const barColor = variant === 'tertiary' ? 'bg-tertiary' : 'bg-primary';
  const glowClass = variant === 'tertiary' ? 'progress-glow-gold' : 'progress-glow';

  return (
    <div
      className={cn(
        'w-full bg-surface-container-highest rounded-full overflow-hidden',
        height,
        className
      )}
    >
      <div
        className={cn(
          barColor,
          'h-full rounded-full transition-all duration-500',
          showGlow && glowClass
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
