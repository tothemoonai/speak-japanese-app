/**
 * Aliyun ASR API 路由
 * 接收用户的语音数据并使用阿里云 DashScope 进行识别
 * 支持用户提供的 API Key
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/asr/aliyun
 * Body: { audioData: base64, apiKey: string, language?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioData, apiKey, language = 'ja' } = body;

    // 验证必要参数
    if (!audioData) {
      return NextResponse.json(
        { success: false, error: '缺少音频数据' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '请先配置阿里云 DashScope API Key' },
        { status: 400 }
      );
    }

    // 转换 base64 音频数据为 Buffer
    const audioBuffer = Buffer.from(audioData.replace(/^data:audio\/\w+;base64,/, ''), 'base64');

    // 调用阿里云 DashScope Realtime ASR API
    const result = await transcribeWithDashScope(audioBuffer, apiKey, language);

    return NextResponse.json({
      success: true,
      data: {
        text: result.transcript,
        isFinal: result.isFinal,
      },
    });

  } catch (error) {
    console.error('Aliyun ASR API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '语音识别失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 使用阿里云 DashScope 进行语音识别
 */
async function transcribeWithDashScope(
  audioBuffer: Buffer,
  apiKey: string,
  language: string
): Promise<{ transcript: string; isFinal: boolean }> {
  const fetch = (await import('node-fetch')).default;

  // DashScope Realtime ASR API endpoint
  const url = 'https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-audio-asr',
        input: {
          audio: (audioBuffer.toString('base64')),
        },
        parameters: {
          language_hints: [language],
          format: 'wav',
          sample_rate: 16000,
          word_timestamps: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `DashScope API 错误 ${response.status}: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (data.output?.results?.[0]?.transcription_text) {
      return {
        transcript: data.output.results[0].transcription_text,
        isFinal: true,
      };
    } else {
      throw new Error('识别失败：无法解析 API 响应');
    }

  } catch (error) {
    console.error('Dashscope API 调用失败:', error);

    // 提供更详细的错误信息
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('API Key 无效，请检查配置');
      } else if (error.message.includes('429') || error.message.includes('quota')) {
        throw new Error('API 调用次数超限，请检查账户余额');
      }
    }

    throw error;
  }
}

/**
 * GET /api/asr/aliyun
 * 返回 API 使用说明
 */
export async function GET() {
  return NextResponse.json({
    service: 'Aliyun DashScope ASR',
    version: '1.0',
    description: '阿里云语音识别服务',
    documentation: 'https://www.alibabacloud.com/help/zh/model-studio',
    endpoints: {
      'POST /api/asr/aliyun': {
        description: '进行语音识别',
        parameters: {
          audioData: 'base64 编码的音频数据',
          apiKey: '用户的 DashScope API Key',
          language: '语言代码 (zh, en, ja, yue)，默认 ja',
        },
      },
    },
  });
}
