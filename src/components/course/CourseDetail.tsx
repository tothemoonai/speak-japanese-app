'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { CourseWithProgress, Character, Sentence } from '@/types';
import { BookOpen, Users, MessageSquare, ArrowLeft, Play } from 'lucide-react';

interface CourseDetailProps {
  course: CourseWithProgress & { characters?: Character[]; sentences?: Sentence[] };
  onPractice?: (characterId: number) => void;
}

const difficultyColors = {
  N5: 'bg-green-100 text-green-800',
  N4: 'bg-blue-100 text-blue-800',
  N3: 'bg-purple-100 text-purple-800',
};

const difficultyLabels = {
  N5: '初级',
  N4: '中级',
  N3: '高级',
};

export function CourseDetail({ course, onPractice }: CourseDetailProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);

  const handlePractice = (characterId: number) => {
    setSelectedCharacter(characterId);
    if (onPractice) {
      onPractice(characterId);
    }
  };

  return (
    <div
      className="space-y-6"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))'
      }}
    >
      {/* Header */}
      <div>
        <Link href={`/books/${course.book_number}`}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回课程列表
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={difficultyColors[course.difficulty]}>
                {difficultyLabels[course.difficulty]}
              </Badge>
              {course.status && (
                <Badge variant="outline">
                  {course.status === 'not_started' && '未开始'}
                  {course.status === 'in_progress' && '进行中'}
                  {course.status === 'completed' && '已完成'}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">
              第{course.course_number}课：{course.title_cn} {course.title_jp}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {course.theme && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>主题：{course.theme}</span>
                </div>
              )}
              {course.total_sentences !== undefined && course.total_sentences > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>对话：{course.total_sentences} 句</span>
                </div>
              )}
              {course.vocab_count !== undefined && course.vocab_count > 0 && (
                <span>词汇：{course.vocab_count}</span>
              )}
              {course.grammar_count !== undefined && course.grammar_count > 0 && (
                <span>语法：{course.grammar_count}</span>
              )}
            </div>
          </div>

          <Link href={`/practice/${course.id}`} className="w-full md:w-auto">
            <Button size="lg" className="w-full md:w-auto">
              <Play className="h-5 w-5 mr-2" />
              开始练习
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Card */}
      {course.status && course.status !== 'not_started' && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {course.progress !== undefined && course.progress > 0 && (
                <>
                  <span className="text-muted-foreground">学习进度</span>
                  <span className="font-medium">{course.progress}%</span>
                  <Progress value={course.progress} className="h-2 w-24" />
                </>
              )}
              {course.practice_count !== undefined && course.practice_count > 0 && (
                <span className="text-muted-foreground">练习 {course.practice_count} 次</span>
              )}
              {course.best_score !== undefined && course.best_score > 0 && (
                <span className="text-muted-foreground">最高分 {course.best_score}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Characters Section */}
      {course.characters && course.characters.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                <span>对话角色</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {course.characters.map((character) => (
                  <Link
                    key={character.id}
                    href={`/practice/${course.id}?character=${character.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{character.name_jp}</span>
                          <Play className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentences Preview */}
      {course.sentences && course.sentences.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                对话预览
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                本课程包含 {course.sentences.length} 句对话
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.sentences.map((sentence) => {
                const character = course.characters?.find(c => c.id === sentence.character_id);
                return (
                  <div key={sentence.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
                        {character?.name_jp || '角色'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{sentence.text_jp}</p>
                        <p className="text-sm text-muted-foreground">{sentence.text_cn}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
