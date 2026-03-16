'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioRecorder } from './AudioRecorder';
import { TTSPlayer } from './AudioPlayer';
import { FeedbackDisplay } from './FeedbackDisplay';
import { evaluationService, type EvaluationResult } from '@/services/processing/eval.service';
import { userProgressService } from '@/services/supabase/userProgress.service';
import { useAuthStore } from '@/store/authStore';
import type { Sentence, Character } from '@/types';
import { Volume2, Mic, CheckCircle, Loader2, AlertCircle, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PracticeAreaProps {
  course: number;
  character?: Character | null;
  sentences: Sentence[];
}

/**
 * 角色映射表
 * 将实际的角色ID映射到句子中使用的character_id (1或2)
 * 根据角色性质决定使用哪个character_id
 */
const CHARACTER_ID_MAP: Record<number, 1 | 2> = {
  // 男性角色 → character_id = 1 (田中先生)
  1: 1,  // 田中先生
  3: 1,  // 店员 - 通常男性
  6: 1,  // 警察 - 通常男性
  8: 1,  // 厨师 - 通常男性
  9: 1,  // 经理 - 通常男性
  15: 1, // 社长 - 通常男性

  // 女性角色 → character_id = 2 (山田小姐)
  2: 2,  // 山田小姐
  4: 2,  // 顾客 - 通常女性
  7: 2,  // 服务员 - 通常女性
  10: 2, // 同事 - 通常女性
  11: 2, // 导游 - 通常女性
  12: 2, // 游客 - 通常女性
  14: 2, // 学生 - 通常女性
  16: 2, // 秘书 - 通常女性

  // 中性角色 - 默认分配
  5: 1,  // 路人 → 使用男性角色
  13: 2, // 老师 → 使用女性角色
};

export function PracticeArea({ course, character, sentences }: PracticeAreaProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  // 根据选择的角色过滤句子，使用映射表
  const filteredSentences = character
    ? sentences.filter(s => {
        // 获取映射后的 character_id
        const mappedCharId = CHARACTER_ID_MAP[character.id] ?? 1;
        return s.character_id === mappedCharId;
      })
    : sentences;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; url: string } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [manualTranscript, setManualTranscript] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showSentenceSelector, setShowSentenceSelector] = useState(false);

  const currentSentence = filteredSentences[currentIndex];
  const isLastSentence = currentIndex === filteredSentences.length - 1;
  const isFirstSentence = currentIndex === 0;

  // 当角色改变时，重置到第一句
  useEffect(() => {
    setCurrentIndex(0);
  }, [character?.id]);

  // 当句子变化时，确保索引有效
  useEffect(() => {
    if (currentIndex >= filteredSentences.length && filteredSentences.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, filteredSentences.length]);

  // Reset state when sentence changes
  useEffect(() => {
    setRecordedAudio(null);
    setResult(null);
    setError(null);
    setTranscript('');
    setManualTranscript('');
    setShowManualInput(false);
  }, [currentIndex]);

  const handleRecordingComplete = useCallback((blob: Blob, url: string) => {
    setRecordedAudio({ blob, url });
    setError(null);
  }, []);

  const handleEvaluate = async () => {
    if (!recordedAudio || !currentSentence) {
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      // Use manual transcript if provided, otherwise try to transcribe
      let transcription = manualTranscript;

      if (!transcription) {
        try {
          // Try to transcribe audio using Zhipu GLM-ASR API
          transcription = await transcribeAudio(recordedAudio.blob);
        } catch (transcribeError) {
          // If transcription fails, use target text as fallback
          console.warn('Transcription failed, using target text as fallback:', transcribeError);
          transcription = currentSentence.text_jp;
          setError('语音识别失败，将使用目标文本进行评估');
        }
      }

      setTranscript(transcription);

      // Get user level from profile
      const userLevel = user?.user_metadata?.level || user?.level || 'beginner';

      // Evaluate with AI
      const evaluation = await evaluationService.evaluate({
        target_text: currentSentence.text_jp,
        user_transcript: transcription,
        user_level: userLevel,
      });

      setResult(evaluation);
      setError(null); // Clear the warning if evaluation succeeds

      // 检查是否可以升级（每次评估后都检查）
      if (user?.id) {
        const upgraded = await userProgressService.checkAndUpgrade(user.id);
        if (upgraded) {
          // 刷新用户数据以获取新等级
          const { authService } = await import('@/services/supabase/auth.service');
          const { user: updatedUser } = await authService.getCurrentUser();
          if (updatedUser) {
            useAuthStore.getState().setUser(updatedUser);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '评估失败，请重试';
      setError(errorMessage);
      console.error('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = async () => {
    if (isLastSentence) {
      // Practice completed
      // TODO: Show completion screen or redirect to report
      alert('恭喜完成所有句子练习！');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSentence) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelectSentence = (index: number) => {
    setCurrentIndex(index);
    setShowSentenceSelector(false);
  };

  const handleRetry = () => {
    setRecordedAudio(null);
    setResult(null);
    setError(null);
    setTranscript('');
    setManualTranscript('');
    setShowManualInput(false);
  };

  // 如果没有句子，显示提示信息
  if (!currentSentence || filteredSentences.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">暂无练习句子</p>
          <p className="text-sm text-muted-foreground mb-4">
            {character
              ? `该角色（${character.name_cn}）暂时没有可练习的句子`
              : '该课程暂时没有可练习的句子'
            }
          </p>
          <Button onClick={() => router.back()} variant="outline">
            返回上一页
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress & Navigation */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Character Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {character ? (
                    <>
                      角色：{character.name_cn} ({character.name_jp})
                    </>
                  ) : (
                    '全部角色'
                  )}
                </span>
                <Badge variant="outline" className="text-xs">
                  {filteredSentences.length} 个句子
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSentenceSelector(!showSentenceSelector)}
                className="text-xs sm:text-sm"
              >
                <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                选择句子
              </Button>
            </div>

            {/* Sentence Selector */}
            {showSentenceSelector && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  {filteredSentences.map((sentence, index) => (
                    <button
                      key={sentence.id}
                      onClick={() => handleSelectSentence(index)}
                      className={`text-left p-2 rounded transition-colors ${
                        index === currentIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium">句子 {index + 1}</span>
                        <span className="text-xs truncate">{sentence.text_jp}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  进度：{currentIndex + 1} / {filteredSentences.length}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                <div
                  className="bg-primary h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / filteredSentences.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Sentence Display */}
      <Card>
        <CardHeader>
          <CardTitle>当前句子</CardTitle>
          <CardDescription>
            请说出以下日语句子
            {character && ` - ${character.name_cn}的台词`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="text-center space-y-1 sm:space-y-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{currentSentence.text_jp}</p>
            <p className="text-base sm:text-lg text-muted-foreground">{currentSentence.text_cn}</p>
            {currentSentence.text_furigana && (
              <p className="text-xs sm:text-sm text-muted-foreground">{currentSentence.text_furigana}</p>
            )}
          </div>

          {/* TTS Player */}
          <div className="flex justify-center">
            <TTSPlayer
              text={currentSentence.text_jp}
              label="听示范发音"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recording Section */}
      {!result && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              录制你的发音
            </CardTitle>
            <CardDescription>
              {recordedAudio
                ? '录音完成，点击"评估"查看结果'
                : '点击"开始录音"按钮开始练习'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              disabled={isEvaluating}
              enableASR={false}
              provider="aliyun"
              language="ja-JP"
            />
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="h-4 sm:h-5 w-4 sm:w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm sm:base font-medium text-red-600 mb-1">评估失败</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{error}</p>
                <Button onClick={handleRetry} variant="outline" size="sm" className="w-full sm:w-auto">
                  重试
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evaluation Result */}
      {result && <FeedbackDisplay result={result} />}

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Previous/Next Buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstSentence || isEvaluating}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一句
              </Button>

              <div className="flex gap-2 flex-1">
                <Button
                  variant="outline"
                  onClick={handleRetry}
                  disabled={!recordedAudio || isEvaluating}
                  className="flex-1"
                >
                  重新录音
                </Button>

                {!result && !error && (
                  <Button
                    onClick={handleEvaluate}
                    disabled={!recordedAudio || isEvaluating}
                    className="flex-1"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        评估中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        评估
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Button
                onClick={handleNext}
                disabled={isEvaluating}
                variant={isLastSentence ? 'default' : 'outline'}
                className="flex-1"
              >
                {isLastSentence ? '完成' : '下一句'}
                <ChevronRight className="h-4 w-4 mr-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Display (for debugging/feedback) */}
      {transcript && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">识别结果</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{transcript}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Transcribe audio using Aliyun ASR API
 */
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log('Transcribing audio with Aliyun ASR:', {
      size: audioBlob.size,
      type: audioBlob.type,
    });

    // Convert blob to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Call Aliyun ASR API
    const response = await fetch('/api/asr/aliyun', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: base64Data,
        language: 'ja',
        enableVad: true,
      }),
    });

    console.log('Aliyun ASR response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API错误: ${response.status}`);
    }

    const data = await response.json();
    console.log('Aliyun ASR response:', data);

    if (!data.success || !data.data) {
      throw new Error('识别失败');
    }

    return data.data.text || '';
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}
