'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { CourseWithProgress, Character, Sentence } from '@/types';
import { BookOpen, Clock, TrendingUp, Users, MessageSquare, ArrowLeft, Play } from 'lucide-react';

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

const genderLabels = {
  male: '男',
  female: '女',
  other: '其他',
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
        <Link href="/courses">
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
              <Badge variant="outline">第 {course.course_number} 课</Badge>
              {course.status && (
                <Badge variant="outline">
                  {course.status === 'not_started' && '未开始'}
                  {course.status === 'in_progress' && '进行中'}
                  {course.status === 'completed' && '已完成'}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">
              {course.title_cn}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {course.title_jp}
            </p>

            {course.description && (
              <p className="text-muted-foreground mb-4">{course.description}</p>
            )}

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
          <CardHeader>
            <CardTitle className="text-lg">学习进度</CardTitle>
          </CardHeader>
          <CardContent>
            {course.progress !== undefined && course.progress > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">完成度</span>
                  <span className="font-medium text-lg">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-3" />
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {course.practice_count !== undefined && course.practice_count > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-foreground">{course.practice_count}</p>
                    <p>练习次数</p>
                  </div>
                </div>
              )}
              {course.best_score !== undefined && course.best_score > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-foreground">{course.best_score}</p>
                    <p>最高分</p>
                  </div>
                </div>
              )}
              {course.last_practiced_at && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(course.last_practiced_at).toLocaleDateString()}
                    </p>
                    <p>最后练习</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Characters Section */}
      {course.characters && course.characters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              对话角色
            </CardTitle>
            <CardDescription>
              选择一个角色开始对话练习
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {course.characters.map((character) => (
                <Card key={character.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {character.name_cn}
                    </CardTitle>
                    <CardDescription>
                      {character.name_jp}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {character.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {character.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {character.gender && (
                        <Badge variant="outline" className="text-xs">
                          {genderLabels[character.gender]}
                        </Badge>
                      )}
                      {character.difficulty_level && (
                        <Badge variant="outline" className="text-xs">
                          {character.difficulty_level === 'easy' && '简单'}
                          {character.difficulty_level === 'medium' && '中等'}
                          {character.difficulty_level === 'hard' && '困难'}
                        </Badge>
                      )}
                    </div>
                    <Link href={`/practice/${course.id}?character=${character.id}`} className="mt-3 block">
                      <Button size="sm" className="w-full">
                        选择此角色
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentences Preview */}
      {course.sentences && course.sentences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              对话预览
            </CardTitle>
            <CardDescription>
              本课程包含 {course.sentences.length} 句对话
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {course.sentences.slice(0, 5).map((sentence) => {
                const character = course.characters?.find(c => c.id === sentence.character_id);
                return (
                  <div key={sentence.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
                        {character?.name_cn || '角色'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{sentence.text_jp}</p>
                        <p className="text-sm text-muted-foreground">{sentence.text_cn}</p>
                        {sentence.text_furigana && (
                          <p className="text-xs text-muted-foreground">{sentence.text_furigana}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {course.sentences.length > 5 && (
                <p className="text-sm text-center text-muted-foreground pt-2">
                  还有 {course.sentences.length - 5} 句对话...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
