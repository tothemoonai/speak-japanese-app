'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCourse } from '@/hooks/useCourse';
import { CourseDetail } from '@/components/course/CourseDetail';
import { BottomNavBar } from '@/components/ui/zen/BottomNavBar';
import { Icon } from '@/components/ui/zen/Icon';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const courseId = parseInt(params.id as string);
  const { data: course, error, isLoading } = useCourse(courseId, user?.id);

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 bg-gradient-to-b from-[#161f35] to-[#0b1326] px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-primary active:scale-95">
              <Icon name="arrow_back" />
            </button>
            <span className="font-headline font-bold text-primary tracking-tighter text-xl">読み込み中...</span>
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-50 bg-gradient-to-b from-[#161f35] to-[#0b1326] px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-primary">
              <Icon name="arrow_back" />
            </button>
            <span className="font-headline font-bold text-primary tracking-tighter text-xl">エラー</span>
          </div>
        </header>
        <main className="px-6 pt-8 max-w-4xl mx-auto text-center py-12">
          <p className="text-error mb-4">{error?.message || 'コースの読み込みに失敗しました'}</p>
          <Link href="/books" className="text-primary font-bold hover:underline">教材一覧に戻る</Link>
        </main>
        <BottomNavBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 bg-gradient-to-b from-[#161f35] to-[#0b1326] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-primary active:scale-95 duration-200">
            <Icon name="arrow_back" />
          </button>
          <span className="font-headline font-bold text-primary tracking-tighter text-xl">
            第{course.course_number}課
          </span>
        </div>
        <Link href={`/practice/${course.id}`}>
          <button className="bg-primary/15 text-primary font-label font-bold text-xs tracking-widest px-4 py-2 rounded-lg hover:bg-primary/25 transition-all active:scale-95">
            練習開始
          </button>
        </Link>
      </header>

      <main className="px-6 pt-8 max-w-4xl mx-auto pb-32">
        <CourseDetail course={course} />
      </main>

      <BottomNavBar />
    </div>
  );
}
