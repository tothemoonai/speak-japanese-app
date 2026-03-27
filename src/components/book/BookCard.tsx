import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { BookWithProgress } from '@/types';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';

interface BookCardProps {
  book: BookWithProgress;
}

const difficultyColors = {
  N5: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100',
  N4: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100',
  N3: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-100',
  N2: 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-100',
  N1: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100',
};

export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="book-card hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {book.difficulty && (
                <Badge className={difficultyColors[book.difficulty]}>
                  {book.difficulty}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">
              {book.title_jp}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>课程：{book.total_courses} 课</span>
          </div>
          <Link href={`/books/${book.book_number}`} className="flex-shrink-0">
            <Button size="sm" className="text-xs px-3">
              {book.progress === undefined || book.progress === 0 ? '开始学习' : '继续学习'}
            </Button>
          </Link>
        </div>

        {/* 学习进度 - 始终显示 */}
        <div className="flex items-start gap-3">
          {/* 左侧：学习进度 */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">学习进度</span>
              <span className="font-medium">
                {book.progress !== undefined ? book.progress : 0}%
              </span>
            </div>
            <Progress value={book.progress || 0} className="h-2" />
          </div>

          {/* 右侧：统计信息 */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {book.completed_courses !== undefined && book.completed_courses > 0 ? (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>已完成 {book.completed_courses} 课</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>未开始</span>
              </div>
            )}
            {book.total_practices !== undefined && book.total_practices > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>练习 {book.total_practices} 次</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
