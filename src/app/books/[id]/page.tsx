'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useBook } from '@/hooks/useBook';
import { CourseList } from '@/components/course/CourseList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { BookOpen, Clock, TrendingUp, ArrowLeft } from 'lucide-react';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const bookId = parseInt(params.id as string);

  const { data: book, error, isLoading } = useBook(bookId, user?.id);

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
      <div className="min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <Card>
            <CardContent className="pt-4 sm:pt-6 text-center py-12">
              <p className="text-red-600 mb-4">
                {error?.message || '课本加载失败'}
              </p>
              <Link href="/books">
                <Button>返回课本列表</Button>
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/books">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  返回
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{book.title_cn}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                {user.nickname || user.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Book Info */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {book.cover_image_url && (
                <img
                  src={book.cover_image_url}
                  alt={book.title_cn}
                  className="w-full sm:w-32 h-40 object-cover rounded-lg"
                />
              )}
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold">{book.title_cn}</h2>
                  {book.difficulty && (
                    <Badge variant="outline">{book.difficulty}</Badge>
                  )}
                </div>
                <p className="text-lg sm:text-xl text-muted-foreground mb-4">
                  {book.title_jp}
                </p>
                {book.description && (
                  <p className="text-sm sm:text-base text-muted-foreground mb-4">{book.description}</p>
                )}

                {/* Progress */}
                {user && book.progress !== undefined && book.progress > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">学习进度</span>
                      <span className="font-medium">{book.progress}%</span>
                    </div>
                    <Progress value={book.progress} className="h-2" />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>课程：{book.total_courses} 课</span>
                  </div>
                  {book.completed_courses !== undefined && book.completed_courses > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>已完成：{book.completed_courses} 课</span>
                    </div>
                  )}
                  {book.total_practices !== undefined && book.total_practices > 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>练习：{book.total_practices} 次</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course List */}
        <div className="mb-4">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">课程列表</h3>
        </div>
        <CourseList
          filter={{ book_id: bookId }}
          userId={user.id}
        />
      </div>
    </div>
  );
}
