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
 * 使用阿里云 DashScope qwen3-asr-flash 进行语音识别
 * 使用 OpenAI SDK 兼容的 chat/completions API
 * 支持国际部署 (dashscope-intl) 和内地部署 (dashscope)
 */
async function transcribeWithDashScope(
  audioBuffer: Buffer,
  apiKey: string,
  language: string
): Promise<{ transcript: string; isFinal: boolean }> {
  const fetch = (await import('node-fetch')).default;

  // 尝试国际部署，如果失败则尝试内地部署
  const endpoints = [
    'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', // 国际部署
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'        // 内地部署
  ];

  // 将音频转换为 data URI 格式
  const audioDataUri = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;

  // 构建请求体 (OpenAI SDK 兼容格式)
  const requestBody = {
    model: 'qwen3-asr-flash',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'input_audio',
            input_audio: {
              data: audioDataUri
            }
          }
        ]
      }
    ],
    stream: false,
    asr_options: {
      enable_lid: true,
      enable_itn: false
      // language: language // 可选：指定语言
    }
  };

  // 尝试不同的端点
  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // 如果是 401/403，Key 无效，不重试
        if (response.status === 401 || response.status === 403) {
          throw new Error(`API Key 无效: ${errorData.error?.message || errorData.message || response.statusText}`);
        }
        // 其他错误，尝试下一个端点
        continue;
      }

      const data = await response.json();

      // 解析 OpenAI SDK 兼容格式的响应
      if (data.choices?.[0]?.message?.content) {
        return {
          transcript: data.choices[0].message.content,
          isFinal: true,
        };
      } else {
        console.error('API响应格式:', JSON.stringify(data, null, 2));
        throw new Error('识别失败：无法解析 API 响应');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('API Key 无效')) {
        throw error; // Key 无效，直接抛出
      }
      // 其他错误，继续尝试下一个端点
      if (url === endpoints[endpoints.length - 1]) {
        throw error; // 最后一个端点也失败了，抛出错误
      }
    }
  }

  throw new Error('所有部署端点都无法访问');
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
