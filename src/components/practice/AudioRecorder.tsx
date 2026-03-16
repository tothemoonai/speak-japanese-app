'use client';

import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { usePCMRecorder } from '@/hooks/usePCMRecorder';
import { useASR, useJapaneseASR } from '@/hooks/useASR';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, RotateCcw, AlertCircle, Loader2, Play, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, audioUrl: string) => void;
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  enableASR?: boolean;
  language?: 'ja-JP' | 'zh-CN' | 'en-US';
  provider?: 'volcengine' | 'aliyun';
  usePCM?: boolean; // 是否使用PCM格式录制
}

export function AudioRecorder({
  onRecordingComplete,
  onTranscript,
  onError,
  disabled = false,
  enableASR = true,
  language = 'ja-JP',
  provider = 'aliyun',
  usePCM = true, // 默认使用PCM格式（适合阿里云ASR）
}: AudioRecorderProps) {
  // 根据usePCM选择不同的录音hook
  const mediaRecorder = useAudioRecorder();
  const pcmRecorder = usePCMRecorder();

  const { state, controls } = usePCM ? pcmRecorder : mediaRecorder;
  const { state: asrState, recognize: recognizeSpeech } = useASR({ language, provider });
  const lastNotifiedBlobRef = useRef<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Notify parent component when recording completes
  useEffect(() => {
    if (
      state.audioBlob &&
      state.audioUrl &&
      !state.isRecording &&
      state.audioUrl !== lastNotifiedBlobRef.current
    ) {
      lastNotifiedBlobRef.current = state.audioUrl;
      onRecordingComplete?.(state.audioBlob, state.audioUrl);

      // 自动进行语音识别
      if (enableASR && state.audioBlob) {
        performRecognition(state.audioBlob);
      }
    }
  }, [state.audioBlob, state.audioUrl, state.isRecording, onRecordingComplete, enableASR]);

  // Notify parent component of errors
  useEffect(() => {
    if (state.error) {
      onError?.(state.error);
    }
  }, [state.error, onError]);

  // 执行语音识别
  const performRecognition = async (audioBlob: Blob) => {
    setIsRecognizing(true);
    setTranscript('');
    try {
      const result = await recognizeSpeech(audioBlob);
      if (result?.text) {
        setTranscript(result.text);
        onTranscript?.(result.text);
      }
    } catch (error) {
      console.error('ASR recognition failed:', error);
    } finally {
      setIsRecognizing(false);
    }
  };

  // 播放录音
  const handlePlayRecording = () => {
    if (!state.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.src = state.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // 音频播放结束处理
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          {/* Duration Display */}
          {state.isRecording && (
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-500 animate-pulse">
                {formatDuration(state.duration)}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                录音中...{usePCM && '(WAV 16kHz)'}
              </p>
            </div>
          )}

          {/* Recognition Progress */}
          {isRecognizing && (
            <div className="text-center w-full max-w-md px-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-xs sm:text-sm text-blue-600">正在识别语音...</span>
              </div>
              {asrState.progress > 0 && asrState.progress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${asrState.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Transcript Result */}
          {transcript && !isRecognizing && (
            <div className="w-full max-w-md px-4 sm:px-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-md mx-2 sm:mx-0">
              <p className="text-xs text-green-600 mb-1 font-medium">识别结果：</p>
              <p className="text-sm text-gray-800">{transcript}</p>
            </div>
          )}

          {/* ASR Error */}
          {asrState.error && !isRecognizing && (
            <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 sm:px-4 py-2 rounded-md w-full max-w-md mx-2 sm:mx-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">识别失败：{asrState.error.message}</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {!state.isRecording && !state.audioUrl && (
              <Button
                size="lg"
                onClick={controls.startRecording}
                disabled={disabled || isRecognizing}
                className="w-full sm:w-auto min-w-[120px] sm:w-32"
              >
                <Mic className="h-5 w-5 mr-2" />
                开始录音
              </Button>
            )}

            {state.isRecording && (
              <Button
                size="lg"
                variant="destructive"
                onClick={controls.stopRecording}
                className="w-full sm:w-auto min-w-[120px] sm:w-32"
              >
                <Square className="h-5 w-5 mr-2" />
                停止录音
              </Button>
            )}

            {state.audioUrl && !state.isRecording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePlayRecording}
                  disabled={isPlaying || isRecognizing}
                  className="w-full sm:w-auto min-w-[120px] sm:w-32"
                >
                  {isPlaying ? (
                    <>
                      <Volume2 className="h-5 w-5 mr-2 animate-pulse" />
                      播放中...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      播放录音
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={controls.resetRecording}
                  disabled={isRecognizing}
                  className="w-full sm:w-auto min-w-[120px] sm:w-32"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  重新录音
                </Button>
              </>
            )}
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 sm:px-4 py-2 rounded-md mx-2 sm:mx-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">
                {state.error.message.includes('Permission denied')
                  ? '请允许访问麦克风'
                  : state.error.message.includes('not found')
                  ? '未找到麦克风设备'
                  : '录音出错，请重试'}
              </span>
            </div>
          )}

          {/* Instructions */}
          {!state.isRecording && !state.audioUrl && !isRecognizing && (
            <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
              点击"开始录音"按钮，然后清晰地读出目标句子
              {usePCM && '（使用WAV格式录制，16kHz采样率，适合语音识别）'}
            </p>
          )}

          {/* Audio element for playback */}
          {state.audioUrl && (
            <audio
              ref={audioRef}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
