'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCourse } from '@/hooks/useCourse';
import { CourseDetail } from '@/components/course/CourseDetail';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const courseId = parseInt(params.id as string);

  const { data: course, error, isLoading } = useCourse(courseId, user?.id);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link href="/courses">
              <h1 className="text-2xl font-bold">课程详情</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link href="/courses">
              <h1 className="text-2xl font-bold">课程详情</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-red-600 mb-4">
                {error?.message || '课程加载失败'}
              </p>
              <Link href="/courses">
                <Button>返回课程列表</Button>
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
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/courses">
              <h1 className="text-2xl font-bold">课程详情</h1>
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <CourseDetail course={course} />
      </div>
    </div>
  );
}
