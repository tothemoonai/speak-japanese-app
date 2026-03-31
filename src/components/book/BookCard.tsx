import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { BookWithProgress } from '@/types';

interface BookCardProps {
  book: BookWithProgress;
}

const difficultyLabels: Record<string, string> = {
  N5: 'N5 レベル',
  N4: 'N4 レベル',
  N3: 'N3 レベル',
  N2: 'N2 レベル',
  N1: 'N1 レベル',
};

export function BookCard({ book }: BookCardProps) {
  const progress = book.progress || 0;
  const isCompleted = progress >= 100;

  return (
    <Link href={`/books/${book.book_number}`} className="block group">
      <div
        className={cn(
          'relative rounded-xl overflow-hidden p-1 transition-all',
          'bg-surface-container-low hover:bg-surface-container-high',
          isCompleted && 'bg-gradient-to-br from-tertiary/10 to-surface-container-low border border-tertiary/20'
        )}
      >
        <div className="flex gap-4 p-4">
          {/* Book Cover */}
          <div className="w-24 h-32 rounded-lg bg-surface-container-highest flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-headline text-2xl font-bold text-primary/20">
                {book.book_number}
              </span>
            </div>
            <span className="absolute bottom-2 left-2 text-[10px] font-bold text-primary tracking-widest uppercase font-label">
              Vol.{String(book.book_number).padStart(2, '0')}
            </span>
          </div>

          {/* Book Info */}
          <div className="flex flex-col justify-between flex-grow py-1">
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  'text-[10px] font-bold tracking-widest font-label px-2 py-0.5 rounded',
                  isCompleted
                    ? 'text-tertiary bg-tertiary/20'
                    : 'text-primary bg-primary/10'
                )}>
                  {difficultyLabels[book.difficulty || ''] || book.difficulty || 'N/A'}
                </span>
                <span className="text-[10px] text-on-surface-variant font-label opacity-60">
                  {book.total_courses} コース
                </span>
              </div>
              <h3 className="text-lg font-bold font-headline text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">
                {book.title_jp}
              </h3>
              {book.title_cn && (
                <p className="text-xs text-on-surface-variant font-body">
                  {book.title_cn}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter font-label">
                  進捗
                </span>
                <span className={cn(
                  'text-[10px] font-bold font-label',
                  isCompleted ? 'text-tertiary' : 'text-primary'
                )}>
                  {progress}%
                </span>
              </div>
              <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    isCompleted
                      ? 'bg-tertiary progress-glow-gold'
                      : 'bg-primary progress-glow'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
