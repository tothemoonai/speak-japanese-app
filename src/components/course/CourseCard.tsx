import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { CourseWithProgress } from '@/types';
import { BookOpen } from 'lucide-react';

interface CourseCardProps {
  course: CourseWithProgress;
}

export function CourseCard({ course }: CourseCardProps) {
  const progress = course.progress || 0;
  const practiceCount = course.practice_count || 0;
  const bestScore = course.best_score || 0;
  const isStarted = progress > 0 || practiceCount > 0;

  return (
    <Card className="course-card hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl">
              第{course.course_number}课：{course.title_jp}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {course.theme && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>主题：{course.theme}</span>
            </div>
          )}
          {course.total_sentences !== undefined && course.total_sentences > 0 && (
            <span>对话：{course.total_sentences} 句</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">学习进度</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{progress}%</span>
                {isStarted && (
                  <span className="text-xs text-muted-foreground">
                    · 练习 {practiceCount} 次
                  </span>
                )}
                {bestScore > 0 && (
                  <span className="text-xs text-muted-foreground">
                    · 最高 {bestScore}
                  </span>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <Link href={`/courses/${course.id}`}>
            <Button size="sm">
              {isStarted ? '继续练习' : '开始学习'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
