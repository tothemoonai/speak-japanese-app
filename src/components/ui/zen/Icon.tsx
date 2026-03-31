'use client';

import { cn } from '@/lib/utils';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
  onClick?: () => void;
}

export function Icon({ name, size = 24, className, fill = false, onClick }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined inline-block leading-none select-none', className)}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        fontSize: size,
      }}
      onClick={onClick}
    >
      {name}
    </span>
  );
}
