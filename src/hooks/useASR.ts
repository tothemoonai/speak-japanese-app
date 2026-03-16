/**
 * useASR Hook
 * 客户端语音识别Hook
 */

import { useState, useCallback } from 'react';

// 识别结果接口
export interface ASRResult {
  text: string;
  utterances?: ASRUtterance[];
  audio_info?: {
    duration: number;
  };
}

export interface ASRUtterance {
  text: string;
  start_time: number;
  end_time: number;
  definite: boolean;
  words?: ASRWord[];
}

export interface ASRWord {
  text: string;
  start_time: number;
  end_time: number;
  blank_duration: number;
}

// ASR状态
export interface ASRState {
  isRecognizing: boolean;
  result: ASRResult | null;
  error: Error | null;
  progress: number; // 0-100
}

// ASR选项
export interface ASROptions {
  language?: string; // ja-JP, zh-CN, en-US等
  provider?: 'volcengine' | 'aliyun'; // ASR服务提供商
  useTempUpload?: boolean; // 是否使用临时文件上传（开发测试用，仅volcengine）
}

// API响应接口
interface ASRApiResponse {
  success: boolean;
  data?: ASRResult;
  error?: string;
  code?: string;
}

/**
 * 将Blob转换为Base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * useASR Hook
 */
export function useASR(options: ASROptions = {}) {
  const { language = 'ja-JP', provider = 'aliyun', useTempUpload = true } = options;

  const [state, setState] = useState<ASRState>({
    isRecognizing: false,
    result: null,
    error: null,
    progress: 0,
  });

  /**
   * 识别音频
   */
  const recognize = useCallback(async (audioBlob: Blob): Promise<ASRResult | null> => {
    setState(prev => ({
      ...prev,
      isRecognizing: true,
      error: null,
      progress: 0,
    }));

    try {
      // 更新进度
      setState(prev => ({ ...prev, progress: 20 }));

      // 将Blob转换为Base64
      const base64Data = await blobToBase64(audioBlob);

      setState(prev => ({ ...prev, progress: 40 }));

      // 根据provider选择API端点
      const apiEndpoint = provider === 'aliyun' ? '/api/asr/aliyun' : '/api/asr';

      // 映射语言代码
      const languageMap: Record<string, string> = {
        'ja-JP': 'ja',
        'zh-CN': 'zh',
        'en-US': 'en',
      };
      const asrLanguage = languageMap[language] || language;

      // 调用API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Data,
          language: asrLanguage,
          enableVad: true,
          useTempUpload,
        }),
      });

      setState(prev => ({ ...prev, progress: 70 }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API错误: ${response.status}`);
      }

      const apiResponse: ASRApiResponse = await response.json();

      setState(prev => ({ ...prev, progress: 100 }));

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.error || '识别失败');
      }

      // 更新状态
      setState({
        isRecognizing: false,
        result: apiResponse.data,
        error: null,
        progress: 100,
      });

      return apiResponse.data;

    } catch (error) {
      const err = error as Error;
      console.error('[useASR] 识别失败:', err);

      setState({
        isRecognizing: false,
        result: null,
        error: err,
        progress: 0,
      });

      return null;
    }
  }, [language, provider, useTempUpload]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      isRecognizing: false,
      result: null,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    state,
    recognize,
    reset,
  };
}

/**
 * 便捷Hook - 日语语音识别
 */
export function useJapaneseASR(options?: Omit<ASROptions, 'language'>) {
  return useASR({ ...options, language: 'ja-JP', provider: 'aliyun' });
}

/**
 * 便捷Hook - 中文语音识别
 */
export function useChineseASR(options?: Omit<ASROptions, 'language'>) {
  return useASR({ ...options, language: 'zh-CN', provider: 'aliyun' });
}

/**
 * 便捷Hook - 英文语音识别
 */
export function useEnglishASR(options?: Omit<ASROptions, 'language'>) {
  return useASR({ ...options, language: 'en-US', provider: 'aliyun' });
}
