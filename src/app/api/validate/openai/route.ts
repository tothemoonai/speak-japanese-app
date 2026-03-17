/**
 * OpenAI API Key 验证路由
 * 测试 OpenAI API Key 是否有效
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/validate/openai
 * 验证 OpenAI API Key
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

    // 使用 OpenAI 的模型列表接口进行验证
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.status === 401) {
      return NextResponse.json({
        valid: false,
        message: 'OpenAI API Key 无效或已过期',
      });
    }

    if (response.status === 429) {
      return NextResponse.json({
        valid: true,
        message: 'OpenAI API Key 有效，但调用次数已达上限',
        warning: '请检查账户余额',
      });
    }

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        valid: true,
        message: 'OpenAI API Key 验证成功',
        provider: 'openai',
        models: data.data?.length || 0,
      });
    }

    return NextResponse.json({
      valid: false,
      message: 'OpenAI API Key 验证失败',
      error: `HTTP ${response.status}`,
    });

  } catch (error) {
    console.error('OpenAI 验证错误:', error);

    return NextResponse.json({
      valid: false,
      message: '网络连接失败，无法验证 API Key',
      error: error instanceof Error ? error.message : '网络错误',
    }, { status: 500 });
  }
}
