'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { BookList } from '@/components/book/BookList';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BookFilter } from '@/types';

const DIFFICULTIES = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

export default function BooksPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<BookFilter>({});
  const [selectedDifficulties, setSelectedDifficulties] = useState<(typeof DIFFICULTIES)[number][]>([]);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  const handleDifficultyToggle = (difficulty: (typeof DIFFICULTIES)[number]) => {
    setSelectedDifficulties((prev) => {
      const newSelected = prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty];
      setFilter((prev) => ({
        ...prev,
        difficulty: newSelected.length > 0 ? (newSelected as any) : undefined,
      }));
      return newSelected;
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="w-full top-0 sticky z-50 header-gradient flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <span className="text-primary active:scale-95 duration-200 cursor-pointer">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: 24 }}>arrow_back</span>
            </span>
          </Link>
          <h1 className="font-headline font-bold tracking-tight text-xl text-primary tracking-tighter">
            IT日本語 教材一覧
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="font-label text-xs text-secondary opacity-60 uppercase tracking-widest">
              {user.nickname || user.email?.split('@')[0]}
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-4 max-w-5xl mx-auto pb-32">
        {/* Filter Tabs */}
        <section className="mb-8">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar py-2">
            <button
              onClick={() => { setSelectedDifficulties([]); setFilter({}); }}
              className={cn(
                'px-6 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all',
                selectedDifficulties.length === 0
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/10 hover:border-primary/30'
              )}
            >
              すべて
            </button>
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => handleDifficultyToggle(difficulty)}
                className={cn(
                  'px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all',
                  selectedDifficulties.includes(difficulty)
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/10 hover:border-primary/30'
                )}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </section>

        {/* Book List */}
        <BookList filter={filter} userId={user.id} />

        {/* Informational Footer */}
        <section className="mt-12 mb-8 bg-surface-container-low/50 rounded-2xl p-6 border-l-4 border-primary">
          <h4 className="font-headline font-bold text-on-surface mb-2">学習を続けましょう</h4>
          <p className="text-sm text-on-surface-variant font-body mb-4">
            すべてのテキストブックを完了して、IT日本語マスターへの道を歩み続けましょう。
          </p>
          <Link href="/dashboard">
            <span className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-4 transition-all cursor-pointer group">
              ダッシュボードへ
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: 14 }}>arrow_forward</span>
            </span>
          </Link>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
