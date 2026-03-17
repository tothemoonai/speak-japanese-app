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

    // 使用 DashScope 的简单 API 进行验证
    // 这里我们调用一个简单的模型列表接口
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/audio/asr/transcription', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-audio-asr',
        input: {
          // 使用一个小的测试音频数据
          audio: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', // 1ms 静音
        },
        parameters: {
          format: 'wav',
          sample_rate: 16000,
        },
      }),
    });

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
