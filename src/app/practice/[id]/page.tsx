'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCourse } from '@/hooks/useCourse';
import { useCourseSentences } from '@/hooks/useCourse';
import { PracticeArea } from '@/components/practice/PracticeArea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
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
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Set character from URL or default to first character
  useEffect(() => {
    if (course?.characters && course.characters.length > 0) {
      if (characterId) {
        const char = course.characters.find(c => c.id === characterId);
        if (char) {
          setSelectedCharacter(char);
        } else {
          setSelectedCharacter(course.characters[0]);
        }
      } else {
        setSelectedCharacter(course.characters[0]);
      }
    }
  }, [course, characterId]);

  if (!user) {
    return null;
  }

  if (courseLoading || sentencesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link href="/courses">
              <h1 className="text-2xl font-bold">练习</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">加载中...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (courseError || sentencesError || !course || !sentences || sentences.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link href="/courses">
              <h1 className="text-2xl font-bold">练习</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-600 mb-2">
                {courseError?.message || sentencesError?.message || '无法加载练习内容'}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {sentences && sentences.length === 0 ? '该课程还没有对话句子' : '请稍后重试'}
              </p>
              <Link href={`/courses/${courseId}`}>
                <Button>返回课程</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/courses/${courseId}`}>
              <h1 className="text-2xl font-bold">练习</h1>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.nickname || user.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href={`/courses/${courseId}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← {course.title_cn}
          </Link>
        </div>

        {/* Course Title */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">{course.title_cn}</h2>
          <p className="text-xl text-muted-foreground mb-4">{course.title_jp}</p>

          {/* Character Selector */}
          {course.characters && course.characters.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">选择角色：</span>
              {course.characters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(char)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCharacter?.id === char.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {char.name_cn} ({char.name_jp})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Practice Area */}
        <PracticeArea
          course={courseId}
          character={selectedCharacter}
          sentences={sentences}
        />
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">练习</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">加载中...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
}
