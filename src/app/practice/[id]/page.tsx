'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCourse, useCourseSentences } from '@/hooks/useCourse';
import { PracticeArea } from '@/components/practice/PracticeArea';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { Icon } from '@/components/ui/zen/Icon';
import { cn } from '@/lib/utils';
import type { Character } from '@/types';

function PracticePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const courseId = parseInt(params.id as string);
  const characterIdParam = searchParams.get('character');
  const characterId = characterIdParam ? parseInt(characterIdParam) : undefined;

  const { data: course, error: courseError, isLoading: courseLoading } = useCourse(courseId, user?.id);
  const { data: sentences, error: sentencesError, isLoading: sentencesLoading } = useCourseSentences(courseId);

  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  useEffect(() => {
    if (course?.characters && course.characters.length > 0) {
      if (characterId) {
        const char = course.characters.find(c => c.id === characterId);
        setSelectedCharacter(char || course.characters[0]);
      } else {
        setSelectedCharacter(course.characters[0]);
      }
    }
  }, [course, characterId]);

  if (!user) return null;

  if (courseLoading || sentencesLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 header-gradient">
          <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-primary">
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
            <div className="h-48 bg-surface-container-low rounded-2xl" />
          </div>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  if (courseError || sentencesError || !course || !sentences || sentences.length === 0) {
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
          <Icon name="error" size={48} className="text-error mb-4" />
          <p className="text-error mb-2">
            {courseError?.message || sentencesError?.message || '練習コンテンツを読み込めません'}
          </p>
          <p className="text-secondary/50 text-sm mb-6">
            {sentences && sentences.length === 0 ? 'このコースには会話フレーズがまだありません' : '後でもう一度お試しください'}
          </p>
          <Link href={`/courses/${courseId}`}>
            <button className="bg-primary text-primary-foreground font-headline font-bold px-6 py-3 rounded-xl active:scale-95 transition-all">
              コースに戻る
            </button>
          </Link>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 header-gradient">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${courseId}`}>
            <button className="text-primary active:scale-95 duration-200">
              <Icon name="arrow_back" />
            </button>
          </Link>
          <div className="flex flex-col">
            <span className="font-label text-[10px] text-secondary/50 uppercase tracking-[0.2em]">
              第{course.course_number}課
            </span>
            <span className="font-headline font-bold text-primary tracking-tighter text-xl">
              {course.title_jp || course.title_cn}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-label text-xs text-secondary/50 tracking-widest hidden sm:block">
            {user.nickname || user.email?.split('@')[0]}
          </span>
        </div>
        </div>
      </header>

      <main className="px-6 pt-6 max-w-4xl mx-auto pb-32">
        {/* Breadcrumb */}
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm text-secondary/50 hover:text-primary transition-colors mb-6 font-body">
          <Icon name="chevron_left" size={16} />
          {course.title_cn}
        </Link>

        {/* Character Selector */}
        {course.characters && course.characters.length > 1 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-secondary/40 font-label tracking-widest uppercase">キャラクター</span>
              {course.characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(char)}
                  className={cn(
                    'px-4 py-2 rounded-full font-headline font-bold text-sm transition-all',
                    selectedCharacter?.id === char.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {char.name_jp}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Practice Area */}
        <PracticeArea
          course={courseId}
          character={selectedCharacter}
          sentences={sentences}
        />
      </main>

      <BottomNavBar />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 header-gradient">
          <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="font-headline font-bold text-primary tracking-tighter text-xl">読み込み中...</span>
          </div>
          </div>
        </header>
        <main className="px-6 pt-8 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-surface-container-low rounded-2xl" />
          </div>
        </main>
        <BottomNavBar />
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
}
