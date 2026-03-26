import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
              {book.title_cn}
            </CardTitle>
            <CardDescription className="mt-1 text-base">
              {book.title_jp}
            </CardDescription>
          </div>
        </div>
        {book.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {book.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <BookOpen className="h-4 w-4" />
          <span>课程：{book.total_courses} 课</span>
        </div>

        {book.progress !== undefined && book.progress > 0 && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">学习进度</span>
                <span className="font-medium">{book.progress}%</span>
              </div>
              <Progress value={book.progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {book.completed_courses !== undefined && book.completed_courses > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>已完成 {book.completed_courses} 课</span>
                </div>
              )}
              {book.total_practices !== undefined && book.total_practices > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>练习 {book.total_practices} 次</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/books/${book.book_number}`} className="w-full">
          <Button className="w-full">
            {book.progress === undefined || book.progress === 0 ? '开始学习' : '继续学习'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
