'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBook } from '@/hooks/useBook';
import { CourseList } from '@/components/course/CourseList';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { ProgressBar } from '@/components/ui/zen/ProgressBar';
import { Icon } from '@/components/ui/zen/Icon';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const bookId = parseInt(params.id as string);
  const { data: book, error, isLoading } = useBook(bookId, user?.id);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 header-gradient">
          <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-primary active:scale-95">
              <Icon name="arrow_back" />
            </button>
            <span className="font-headline font-bold text-primary tracking-tighter text-xl">読み込み中...</span>
          </div>
          </div>
        </header>
        <main className="px-6 pt-8 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-surface-container-low rounded-xl w-3/4" />
            <div className="h-6 bg-surface-container-low rounded-xl w-1/2" />
            <div className="h-32 bg-surface-container-low rounded-2xl" />
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 header-gradient">
          <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-primary">
              <Icon name="arrow_back" />
            </button>
            <span className="font-headline font-bold text-primary tracking-tighter text-xl">エラー</span>
          </div>
          </div>
        </header>
        <main className="px-6 pt-8 max-w-4xl mx-auto text-center py-12">
          <p className="text-error mb-4">{error?.message || 'テキストの読み込みに失敗しました'}</p>
          <Link href="/books" className="text-primary font-bold hover:underline">教材一覧に戻る</Link>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  const progress = book.progress || 0;
  const difficultyLabel = book.difficulty || '';

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 header-gradient">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-primary active:scale-95 duration-200">
            <Icon name="arrow_back" />
          </button>
          <span className="font-headline font-bold text-primary tracking-tighter text-xl">IT Japanese</span>
        </div>
        </div>
      </header>

      <main className="px-6 pt-8 max-w-4xl mx-auto pb-32">
        {/* Hero Bento Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {/* Left: Book Title & Details */}
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-md font-label text-xs font-bold tracking-widest border border-primary/20">
                LEVEL {difficultyLabel}
              </span>
              <span className="text-secondary/60 text-xs font-label tracking-widest">
                {book.total_courses} コース
              </span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight">
              {book.title_jp || book.title_cn}
            </h1>
            {book.title_jp && book.title_cn && book.title_jp !== book.title_cn && (
              <p className="text-secondary text-lg leading-relaxed font-body">{book.title_cn}</p>
            )}
            {book.description && (
              <p className="text-secondary text-lg leading-relaxed font-body max-w-xl">{book.description}</p>
            )}

            {/* Progress Section */}
            <div className="bg-surface-container-low p-6 rounded-xl">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="font-label text-xs text-secondary/50 uppercase tracking-[0.2em] mb-1">学習状況</p>
                  <p className="font-headline text-3xl font-bold text-on-surface">
                    {progress}% <span className="text-secondary/40 text-lg font-normal">完了</span>
                  </p>
                </div>
                <Icon name="auto_awesome" size={28} className="text-primary" />
              </div>
              <ProgressBar value={progress} />
            </div>
          </div>

          {/* Right: Decorative Visual */}
          <div className="md:col-span-4 relative group hidden md:block">
            <div className="absolute inset-0 bg-primary/10 rounded-xl blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            <div className="relative h-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container-high min-h-[200px] flex items-center justify-center">
              <div className="text-center space-y-2">
                <span className="text-6xl font-headline font-light text-primary/30">{book.book_number}</span>
                <p className="font-label text-xs text-secondary/40 uppercase tracking-widest">Volume</p>
              </div>
            </div>
          </div>
        </section>

        {/* Course List */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold tracking-tight">カリキュラム</h2>
            <span className="text-secondary/50 font-label text-sm">全 {book.total_courses} ユニット</span>
          </div>
          <CourseList filter={{ book_id: book.book_number }} userId={user.id} />
        </section>

        {/* Stats Grid */}
        <section className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col gap-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary/40">コース数</span>
            <span className="font-headline text-3xl font-bold text-on-surface">{book.total_courses}</span>
          </div>
          <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col gap-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary/40">完了</span>
            <span className="font-headline text-3xl font-bold text-on-surface">{book.completed_courses || 0}</span>
          </div>
          <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col gap-2">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary/40">練習回数</span>
            <span className="font-headline text-3xl font-bold text-on-surface">{book.total_practices || 0}</span>
          </div>
          <div className="p-6 bg-surface-container-low rounded-2xl flex flex-col gap-2 border border-primary/10">
            <span className="font-label text-[10px] uppercase tracking-widest text-primary/60">次の目標</span>
            <span className="font-headline text-3xl font-bold text-primary">
              {difficultyLabel || '-'}
            </span>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
