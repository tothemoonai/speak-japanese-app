/**
 * Anthropic API Key 验证路由
 * 测试 Anthropic API Key 是否有效
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/validate/anthropic
 * 验证 Anthropic API Key
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

    // 测试 API 调用
    const fetch = (await import('node-fetch')).default;

    // 使用 Anthropic 的简单请求进行验证
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{
          role: 'user',
          content: 'test'
        }]
      }),
    });

    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        message: 'Anthropic API Key 无效或已过期',
        error: errorData.error?.message || '认证失败',
      });
    }

    if (response.status === 429) {
      return NextResponse.json({
        valid: true,
        message: 'Anthropic API Key 有效，但调用次数已达上限',
        warning: '请检查账户余额',
      });
    }

    if (response.ok) {
      return NextResponse.json({
        valid: true,
        message: 'Anthropic API Key 验证成功',
        provider: 'anthropic',
      });
    }

    // 对于其他错误，也认为 Key 有效（可能是模型权限问题）
    if (response.status >= 400 && response.status < 500) {
      return NextResponse.json({
        valid: true,
        message: 'Anthropic API Key 有效',
        provider: 'anthropic',
      });
    }

    return NextResponse.json({
      valid: false,
      message: 'Anthropic API Key 验证失败',
      error: `HTTP ${response.status}`,
    });

  } catch (error) {
    console.error('Anthropic 验证错误:', error);

    return NextResponse.json({
      valid: false,
      message: '网络连接失败，无法验证 API Key',
      error: error instanceof Error ? error.message : '网络错误',
    }, { status: 500 });
  }
}
