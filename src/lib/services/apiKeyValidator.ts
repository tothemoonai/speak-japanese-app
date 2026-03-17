/**
 * API Key 验证服务
 * 在保存前测试密钥是否有效
 */

export type ApiKeyProvider = 'dashscope' | 'openai' | 'anthropic' | 'zhipu';

export interface ValidationResult {
  valid: boolean;
  provider: ApiKeyProvider;
  message: string;
  error?: string;
}

/**
 * 验证单个 API Key
 */
export async function validateApiKey(
  provider: ApiKeyProvider,
  apiKey: string
): Promise<ValidationResult> {
  if (!apiKey || apiKey.trim() === '') {
    return {
      valid: false,
      provider,
      message: 'API Key 不能为空',
    };
  }

  try {
    switch (provider) {
      case 'dashscope':
        return await validateDashScopeKey(apiKey);
      case 'openai':
        return await validateOpenAIKey(apiKey);
      case 'anthropic':
        return await validateAnthropicKey(apiKey);
      case 'zhipu':
        return await validateZhipuKey(apiKey);
      default:
        return {
          valid: false,
          provider,
          message: '不支持的提供商',
        };
    }
  } catch (error) {
    return {
      valid: false,
      provider,
      message: '验证失败',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 验证阿里云 DashScope API Key
 */
async function validateDashScopeKey(apiKey: string): Promise<ValidationResult> {
  try {
    const response = await fetch('/api/validate/dashscope', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      return {
        valid: true,
        provider: 'dashscope',
        message: 'DashScope API Key 有效',
      };
    } else {
      return {
        valid: false,
        provider: 'dashscope',
        message: data.message || 'DashScope API Key 无效',
        error: data.error,
      };
    }
  } catch (error) {
    return {
      valid: false,
      provider: 'dashscope',
      message: 'DashScope API Key 验证失败',
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 验证 OpenAI API Key
 */
async function validateOpenAIKey(apiKey: string): Promise<ValidationResult> {
  try {
    // 简单的格式验证
    if (!apiKey.startsWith('sk-')) {
      return {
        valid: false,
        provider: 'openai',
        message: 'OpenAI API Key 格式不正确，应以 sk- 开头',
      };
    }

    const response = await fetch('/api/validate/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      return {
        valid: true,
        provider: 'openai',
        message: 'OpenAI API Key 有效',
      };
    } else {
      return {
        valid: false,
        provider: 'openai',
        message: data.message || 'OpenAI API Key 无效',
        error: data.error,
      };
    }
  } catch (error) {
    return {
      valid: false,
      provider: 'openai',
      message: 'OpenAI API Key 验证失败',
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 验证 Anthropic API Key
 */
async function validateAnthropicKey(apiKey: string): Promise<ValidationResult> {
  try {
    // 简单的格式验证
    if (!apiKey.startsWith('sk-ant-')) {
      return {
        valid: false,
        provider: 'anthropic',
        message: 'Anthropic API Key 格式不正确，应以 sk-ant- 开头',
      };
    }

    const response = await fetch('/api/validate/anthropic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      return {
        valid: true,
        provider: 'anthropic',
        message: 'Anthropic API Key 有效',
      };
    } else {
      return {
        valid: false,
        provider: 'anthropic',
        message: data.message || 'Anthropic API Key 无效',
        error: data.error,
      };
    }
  } catch (error) {
    return {
      valid: false,
      provider: 'anthropic',
      message: 'Anthropic API Key 验证失败',
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 验证智谱 GLM API Key
 */
async function validateZhipuKey(apiKey: string): Promise<ValidationResult> {
  try {
    // 简单的格式验证
    if (!apiKey.includes('.')) {
      return {
        valid: false,
        provider: 'zhipu',
        message: '智谱 API Key 格式不正确',
      };
    }

    const response = await fetch('/api/validate/zhipu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();

    if (response.ok && data.valid) {
      return {
        valid: true,
        provider: 'zhipu',
        message: '智谱 API Key 有效',
      };
    } else {
      return {
        valid: false,
        provider: 'zhipu',
        message: data.message || '智谱 API Key 无效',
        error: data.error,
      };
    }
  } catch (error) {
    return {
      valid: false,
      provider: 'zhipu',
      message: '智谱 API Key 验证失败',
      error: error instanceof Error ? error.message : '网络错误',
    };
  }
}

/**
 * 批量验证多个 API Keys
 */
export async function validateApiKeys(
  keys: Record<ApiKeyProvider, string>
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  for (const [provider, apiKey] of Object.entries(keys)) {
    if (apiKey && apiKey.trim() !== '') {
      const result = await validateApiKey(provider as ApiKeyProvider, apiKey);
      results.push(result);
    }
  }

  return results;
}
