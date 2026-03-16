'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader2, AlertCircle, CheckCircle, Download } from 'lucide-react';
// 注意：这个导入在生产构建时会导致问题，已通过next.config.js排除此页面
import { useJapaneseLocalASR } from '@/hooks/useLocalASR';

export default function TestLocalASRPage() {
  const { state, initialize, recognize, reset } = useJapaneseLocalASR({
    autoInitialize: false,
  });

  const [isRecording, setIsRecording] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);

  // Initialize model on mount
  useEffect(() => {
    initialize();
    return () => {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initialize]);

  const startRecording = async () => {
    if (!state.isModelLoaded) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      audioChunksRef.current = [];

      processor.onaudioprocess = (e) => {
        if (isRecording) {
          const audioData = e.inputBuffer.getChannelData(0);
          // Store the audio chunk
          audioChunksRef.current.push(new Float32Array(audioData));
        }
      };

      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      processorRef.current = processor;
      setIsRecording(true);
      reset();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    if (audioContextRef.current && processorRef.current) {
      processorRef.current.disconnect();
      audioContextRef.current.close();

      setIsRecording(false);

      // Combine all audio chunks
      const totalLength = audioChunksRef.current.reduce(
        (sum, chunk) => sum + chunk.length,
        0
      );
      const combinedAudio = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of audioChunksRef.current) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      }

      // Recognize
      await recognize(combinedAudio, 16000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>本地语音识别测试 (Sherpa-ONNX)</CardTitle>
            <CardDescription>
              使用 SenseVoiceSmall 模型进行离线日语语音识别
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Model Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">模型状态</h3>
                <p className="text-sm text-muted-foreground">
                  {state.isModelLoading
                    ? `正在加载模型... ${state.progress}%`
                    : state.isModelLoaded
                    ? '模型已加载'
                    : '模型未加载'}
                </p>
              </div>
              {state.isModelLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              ) : state.isModelLoaded ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>录音控制</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={!state.isModelLoaded || state.isRecognizing}
                  className="w-full sm:w-auto"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  开始录音
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  className="w-full sm:w-auto"
                >
                  <Square className="h-5 w-5 mr-2" />
                  停止录音
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={reset} disabled={state.isRecognizing}>
                清除结果
              </Button>
            </div>

            {state.isRecognizing && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">正在识别...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {state.result && (
          <Card>
            <CardHeader>
              <CardTitle>识别结果</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{state.result.text}</p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {state.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600 mb-1">错误</p>
                  <p className="text-sm text-red-700">{state.error.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>1. 模型文件：</strong> SenseVoiceSmall INT8 量化模型（支持中日英韩粤）</p>
            <p><strong>2. 语言：</strong> 支持日语识别</p>
            <p><strong>3. 采样率：</strong> 16kHz</p>
            <p><strong>4. 运行方式：</strong> 完全本地运行，无需服务器</p>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="font-medium text-blue-800 mb-2">📝 首次使用</p>
              <p className="text-blue-700 text-xs">
                首次使用需要下载模型文件。请运行:
                <code className="ml-2 px-2 py-1 bg-blue-100 rounded">node scripts/download-sense-voice-model.js</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Model Info */}
        <Card>
          <CardHeader>
            <CardTitle>模型信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">模型名称</p>
                <p className="text-muted-foreground">SenseVoiceSmall INT8</p>
              </div>
              <div>
                <p className="font-medium">量化方式</p>
                <p className="text-muted-foreground">INT8</p>
              </div>
              <div>
                <p className="font-medium">支持语言</p>
                <p className="text-muted-foreground">日语、中文、英语、韩语、粤语</p>
              </div>
              <div>
                <p className="font-medium">运行环境</p>
                <p className="text-muted-foreground">WebAssembly (浏览器)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
