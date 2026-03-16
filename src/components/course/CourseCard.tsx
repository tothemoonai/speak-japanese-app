import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { CourseWithProgress } from '@/types';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';

interface CourseCardProps {
  course: CourseWithProgress;
}

const difficultyColors = {
  N5: 'bg-green-100 text-green-800 hover:bg-green-200',
  N4: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  N3: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
};

const statusLabels = {
  not_started: '未开始',
  in_progress: '进行中',
  completed: '已完成',
};

const statusColors = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={difficultyColors[course.difficulty]}>
                {course.difficulty}
              </Badge>
              {course.status && (
                <Badge variant="outline" className={statusColors[course.status]}>
                  {statusLabels[course.status]}
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">
              {course.course_number}. {course.title_cn}
            </CardTitle>
            <CardDescription className="mt-1 text-base">
              {course.title_jp}
            </CardDescription>
          </div>
        </div>
        {course.description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {course.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {course.theme && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <BookOpen className="h-4 w-4" />
            <span>主题：{course.theme}</span>
          </div>
        )}

        {course.status && course.status !== 'not_started' && (
          <div className="space-y-3">
            {course.progress !== undefined && course.progress > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">学习进度</span>
                  <span className="font-medium">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              {course.practice_count !== undefined && course.practice_count > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>练习 {course.practice_count} 次</span>
                </div>
              )}
              {course.best_score !== undefined && course.best_score > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>最高分 {course.best_score}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {course.total_sentences !== undefined && course.total_sentences > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
            <span>对话：{course.total_sentences} 句</span>
            {course.vocab_count !== undefined && course.vocab_count > 0 && (
              <span>词汇：{course.vocab_count}</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${course.id}`} className="w-full">
          <Button className="w-full">
            {course.status === 'not_started' ? '开始学习' : '继续练习'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
