'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { CourseWithProgress, Character, Sentence } from '@/types';
import { BookOpen, Users, MessageSquare, ArrowLeft, Play, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';

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
  const [showChinese, setShowChinese] = useState(true);
  const [showJapanese, setShowJapanese] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const manuallyStoppedRef = useRef(false);
  const { controls } = useTTS();

  const handlePractice = (characterId: number) => {
    setSelectedCharacter(characterId);
    if (onPractice) {
      onPractice(characterId);
    }
  };

  const handlePlayAll = () => {
    if (!course.sentences || course.sentences.length === 0) return;

    // 如果正在播放，则停止
    if (isPlaying) {
      manuallyStoppedRef.current = true;
      controls.cancel();
      setIsPlaying(false);
      return;
    }

    // 顺序播放所有日文句子
    const sentences = course.sentences;
    let index = 0;
    manuallyStoppedRef.current = false; // 重置停止标志

    const playNext = () => {
      // 如果已手动停止，不继续播放
      if (manuallyStoppedRef.current) {
        setIsPlaying(false);
        return;
      }

      if (index >= sentences.length) {
        // 播放完成
        setIsPlaying(false);
        return;
      }

      const sentence = sentences[index];
      index++;

      // 使用原生 SpeechSynthesis API 直接播放，以便控制 onend 事件
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentence.text_jp);
        utterance.lang = 'ja-JP';

        // 设置日语语音
        const voices = window.speechSynthesis.getVoices();
        const japaneseVoice = voices.find(voice => voice.lang.startsWith('ja'));
        if (japaneseVoice) {
          utterance.voice = japaneseVoice;
        }

        utterance.pitch = 1.0;
        utterance.rate = 0.9;

        utterance.onend = () => {
          // 当前句子播放完成，播放下一句
          playNext();
        };

        utterance.onerror = () => {
          // 出错时也继续播放下一句
          playNext();
        };

        window.speechSynthesis.speak(utterance);
      }
    };

    // 先停止当前播放
    controls.cancel();
    setIsPlaying(true);

    // 开始播放
    playNext();
  };

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      manuallyStoppedRef.current = true;
      if (isPlaying) {
        controls.cancel();
      }
    };
  }, [isPlaying, controls]);

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

              {/* 分隔线 */}
              <div className="w-px h-4 bg-border" />

              {/* 中文切换按钮 */}
              <Button
                variant={showChinese ? "default" : "outline"}
                size="sm"
                onClick={() => setShowChinese(!showChinese)}
                className="h-7 text-xs"
              >
                {showChinese ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                中文
              </Button>

              {/* 日文切换按钮 */}
              <Button
                variant={showJapanese ? "default" : "outline"}
                size="sm"
                onClick={() => setShowJapanese(!showJapanese)}
                className="h-7 text-xs"
              >
                {showJapanese ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                日文
              </Button>

              {/* 播放按钮 */}
              {course.sentences && course.sentences.length > 0 && (
                <Button
                  variant={isPlaying ? "destructive" : "outline"}
                  size="sm"
                  onClick={handlePlayAll}
                  className="h-7 text-xs"
                  disabled={!showJapanese}
                >
                  {isPlaying ? (
                    <>
                      <VolumeX className="h-3 w-3 mr-1" />
                      停止
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3 w-3 mr-1" />
                      播放
                    </>
                  )}
                </Button>
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
                        {showJapanese && (
                          <p className="font-medium">{sentence.text_jp}</p>
                        )}
                        {showChinese && (
                          <p className="text-sm text-muted-foreground">{sentence.text_cn}</p>
                        )}
                        {!showJapanese && !showChinese && (
                          <p className="text-sm text-muted-foreground italic">文本已隐藏</p>
                        )}
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
