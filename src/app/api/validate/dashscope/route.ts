/**
 * DashScope API Key 验证路由
 * 测试阿里云 DashScope API Key 是否有效
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/validate/dashscope
 * 验证 DashScope API Key
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, message: 'API Key 不能为空' },
        { status: 400 }
      );
    }

    // 简单的格式验证
    if (!apiKey.startsWith('sk-')) {
      return NextResponse.json({
        valid: false,
        message: 'DashScope API Key 格式不正确，应以 sk- 开头',
      });
    }

    // 测试 API 调用
    const fetch = (await import('node-fetch')).default;

    // 使用公开音频 URL 进行验证（避免 base64 格式问题）
    const testAudioUrl = 'https://dashscope.oss-cn-beijing.aliyuncs.com/audios/welcome.mp3';

    // 尝试国际部署和内地部署
    const endpoints = [
      'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', // 国际部署
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'        // 内地部署
    ];

    for (const url of endpoints) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen3-asr-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_audio',
                  input_audio: {
                    data: testAudioUrl
                  }
                }
              ]
            }
          ],
          stream: false,
          asr_options: {
            enable_itn: false
          }
        }),
      });

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          valid: false,
          message: 'API Key 无效或已过期',
          error: '认证失败',
        });
      }

      if (response.status === 429) {
        return NextResponse.json({
          valid: true,
          message: 'API Key 有效，但调用次数已达上限',
          warning: '请检查账户余额',
        });
      }

      if (response.ok) {
        return NextResponse.json({
          valid: true,
          message: 'DashScope API Key 验证成功',
          provider: 'dashscope',
          model: 'qwen3-asr-flash',
        });
      }

      // 如果不是最后一个端点，继续尝试
      if (url !== endpoints[endpoints.length - 1]) {
        continue;
      }

      // 最后一个端点也失败了
      return NextResponse.json({
        valid: false,
        message: 'API Key 验证失败',
        error: `HTTP ${response.status}`,
      });
    }

    const responseData = await response.json();

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json({
        valid: false,
        message: 'API Key 无效或已过期',
        error: responseData.message || '认证失败',
      });
    }

    if (response.status === 429) {
      return NextResponse.json({
        valid: true,
        message: 'API Key 有效，但调用次数已达上限',
        warning: '请检查账户余额',
      });
    }

    if (response.ok) {
      return NextResponse.json({
        valid: true,
        message: 'DashScope API Key 验证成功',
        provider: 'dashscope',
      });
    }

    // 其他错误也认为 Key 有效（可能是测试音频的问题）
    if (response.status >= 400 && response.status < 500) {
      return NextResponse.json({
        valid: true,
        message: 'DashScope API Key 有效',
        provider: 'dashscope',
      });
    }

    return NextResponse.json({
      valid: false,
      message: 'API Key 验证失败',
      error: responseData.message || '未知错误',
    });

  } catch (error) {
    console.error('DashScope 验证错误:', error);

    // 网络错误不认为 Key 无效
    return NextResponse.json({
      valid: false,
      message: '网络连接失败，无法验证 API Key',
      error: error instanceof Error ? error.message : '网络错误',
    }, { status: 500 });
  }
}
