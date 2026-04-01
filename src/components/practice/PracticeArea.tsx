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
import { practiceRecordService } from '@/services/supabase/practiceRecord.service';
import { useAuthStore } from '@/store/authStore';
import { getAvatarUrl } from '@/lib/utils/avatar';
import type { Sentence, Character } from '@/types';
import { Volume2, Mic, CheckCircle, Loader2, AlertCircle, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { achievementService } from '@/services/supabase/achievement.service';
import type { AchievementDef } from '@/config/achievements';
import { getApiKey } from '@/lib/storage/apiKeyStorage';

interface PracticeAreaProps {
  course: number;
  character?: Character | null;
  sentences: Sentence[];
}

export function PracticeArea({ course, character, sentences }: PracticeAreaProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  // 根据选择的角色过滤句子（直接使用character_id匹配）
  const filteredSentences = character
    ? sentences.filter(s => s.character_id === character.id)
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
  const [newAchievements, setNewAchievements] = useState<AchievementDef[]>([]);

  const currentSentence = filteredSentences[currentIndex];
  const isLastSentence = currentIndex === filteredSentences.length - 1;
  const isFirstSentence = currentIndex === 0;

  // 练习记录状态
  const [practiceId, setPracticeId] = useState<number | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [practiceStartTime, setPracticeStartTime] = useState<number>(Date.now());

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

  // 初始化练习记录（首次加载时）
  useEffect(() => {
    const initPracticeRecord = async () => {
      if (!user?.id || practiceId !== null) {
        return; // 已初始化或用户未登录
      }

      try {
        const id = await practiceRecordService.createPracticeRecord({
          userId: user.id,
          courseId: course,
          characterId: character?.id || 1, // 默认使用角色1
          sentences: filteredSentences,
        });

        if (id) {
          setPracticeId(id);
          setPracticeStartTime(Date.now());
          console.log('✅ 练习记录已创建，ID:', id);
        }
      } catch (error) {
        console.error('创建练习记录失败:', error);
      }
    };

    initPracticeRecord();
  }, [user?.id]); // 只在用户变化时执行一次

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

      // 保存练习结果到数据库
      if (practiceId && user?.id) {
        try {
          await practiceRecordService.savePracticeResult({
            practiceId: practiceId,
            sentenceId: currentSentence.id,
            userText: transcript,
            standardText: currentSentence.text_jp,
            audioUrl: recordedAudio.url,
            overallScore: evaluation.overall_score || 0,
            dimensionScores: evaluation.dimension_scores || {
              emotion: 0,
              fluency: 0,
              freedom: 0,
              accuracy: 0,
              pronunciation: 0,
            },
            grade: evaluation.grade || 'D',
            feedback: evaluation.feedback || {
              issues: [],
              highlights: [],
              suggestions: [],
            },
            detailedAnalysis: evaluation.detailed_analysis,
          });

          // 保存到结果列表，用于完成时计算总分
          setResults((prev) => [
            ...prev,
            {
              sentenceId: currentSentence.id,
              overallScore: evaluation.overall_score || 0,
            },
          ]);

          console.log('✅ 练习结果已保存');
        } catch (saveError) {
          console.error('保存练习结果失败:', saveError);
          // 不影响用户体验，继续流程
        }
      }

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
      // Practice completed - save data
      if (practiceId && user?.id) {
        try {
          // Calculate total time spent
          const totalTimeSpent = Math.round((Date.now() - practiceStartTime) / 1000);

          // Calculate average score from results
          const averageScore = results.length > 0
            ? Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length)
            : 0;

          // Complete practice - save record and all results
          const success = await practiceRecordService.completePractice(
            practiceId,
            totalTimeSpent,
            averageScore,
            results
          );

          if (success) {
            // Check achievements
            let unlockedAchievements: AchievementDef[] = [];
            try {
              unlockedAchievements = await achievementService.checkAndUnlock(user.id);
            } catch { /* non-critical */ }

            // Format time for display
            const minutes = Math.floor(totalTimeSpent / 60);
            const seconds = totalTimeSpent % 60;
            const timeString = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;

            // Build achievement text
            const achievementText = unlockedAchievements.length > 0
              ? '\n\n🏆 新しいアチーブメント解除！\n' + unlockedAchievements.map(a => `  ${a.name}: ${a.description}`).join('\n')
              : '';

            // Show success message
            alert(`🎉 恭喜完成所有句子练习！\n\n⏱️ 用时: ${timeString}\n📊 平均分: ${averageScore}分${achievementText}`);

            // Redirect to dashboard
            router.push('/dashboard');
          } else {
            alert('❌ 保存练习数据失败，请重试');
          }
        } catch (error) {
          console.error('完成练习失败:', error);
          alert('❌ 完成练习时出错，请重试');
        }
      } else {
        // No practice record - just redirect
        alert('🎉 恭喜完成所有句子练习！');
        router.push('/dashboard');
      }
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
              ? `${character.name_jp} 暂时没有可练习的句子`
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
                {character && (
                  <img
                    src={getAvatarUrl(character.name_jp, character.gender)}
                    alt={character.name_jp}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium">
                  {character?.name_jp || '全部角色'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {filteredSentences.length}
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
            {character && ` - ${character.name_jp}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="text-center space-y-1 sm:space-y-2">
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{currentSentence.text_jp}</p>
            <p className="text-base sm:text-lg text-muted-foreground">{currentSentence.text_cn}</p>
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
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstSentence || isEvaluating}
                className="flex-1 max-w-[160px]"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一句
              </Button>

              <Button
                variant="outline"
                onClick={handleRetry}
                disabled={!recordedAudio || isEvaluating}
                className="flex-1 max-w-[160px]"
              >
                重新录音
              </Button>

              {!result && !error && (
                <Button
                  onClick={handleEvaluate}
                  disabled={!recordedAudio || isEvaluating}
                  className="flex-1 max-w-[160px]"
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

              <Button
                onClick={handleNext}
                disabled={isEvaluating}
                variant={isLastSentence ? 'default' : 'outline'}
                className="flex-1 max-w-[160px]"
              >
                {isLastSentence ? '完成' : '下一句'}
                <ChevronRight className="h-4 w-4 ml-1" />
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
 * 获取用户的 API Key
 * 从本地存储中读取用户配置的密钥
 */
async function getUserApiKey(provider: 'dashscope' | 'openai' | 'anthropic' | 'zhipu'): Promise<string | undefined> {
  try {
    const key = await getApiKey(provider);
    if (!key || key.trim() === '') {
      console.warn(`未配置 ${provider} API Key`);
      return undefined;
    }
    return key;
  } catch (error) {
    console.error('获取 API Key 失败:', error);
    return undefined;
  }
}

/**
 * Transcribe audio using Aliyun ASR API
 * 支持用户提供的 API Key
 */
async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log('Transcribing audio with Aliyun ASR:', {
      size: audioBlob.size,
      type: audioBlob.type,
    });

    // 获取用户的 API Key
    const apiKey = await getUserApiKey('dashscope');
    if (!apiKey) {
      throw new Error('请先在设置中配置阿里云 DashScope API Key');
    }

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

    // Call Aliyun ASR API with user's API key
    const response = await fetch('/api/asr/aliyun', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioData: base64Data,
        apiKey: apiKey, // 使用用户提供的密钥
        language: 'ja',
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
