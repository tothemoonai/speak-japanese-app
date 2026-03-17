/**
 * 统一的 API Key 存储服务
 * 支持网页版（localStorage）和移动端（Capacitor Preferences）
 */

import { Preferences } from '@capacitor/preferences';

export type ApiKeyProvider = 'dashscope' | 'openai' | 'anthropic' | 'zhipu';

export interface ApiKeys {
  dashscope?: string;    // 阿里云 DashScope
  openai?: string;       // OpenAI GPT
  anthropic?: string;    // Anthropic Claude
  zhipu?: string;        // 智谱 GLM
}

const STORAGE_KEY = 'user_api_keys';

/**
 * 检查是否在移动端运行
 */
const isMobile = () => {
  return window.Capacitor?.isNativePlatform === true;
};

/**
 * 保存用户的 API Keys
 */
export async function saveApiKeys(keys: ApiKeys): Promise<void> {
  try {
    const keysJson = JSON.stringify(keys);

    if (isMobile()) {
      // 移动端：使用 Capacitor Preferences（加密存储）
      await Preferences.set({
        key: STORAGE_KEY,
        value: keysJson,
      });
      console.log('✅ API Keys 已保存到移动端安全存储');
    } else {
      // 网页版：使用 localStorage
      localStorage.setItem(STORAGE_KEY, keysJson);
      console.log('✅ API Keys 已保存到浏览器本地存储');
    }
  } catch (error) {
    console.error('❌ 保存 API Keys 失败:', error);
    throw new Error('保存 API Keys 失败');
  }
}

/**
 * 获取用户的 API Keys
 */
export async function getApiKeys(): Promise<ApiKeys> {
  try {
    let keysJson: string | null = null;

    if (isMobile()) {
      // 移动端：从 Capacitor Preferences 读取
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      keysJson = value;
    } else {
      // 网页版：从 localStorage 读取
      keysJson = localStorage.getItem(STORAGE_KEY);
    }

    if (!keysJson) {
      return {};
    }

    return JSON.parse(keysJson);
  } catch (error) {
    console.error('❌ 读取 API Keys 失败:', error);
    return {};
  }
}

/**
 * 获取特定提供商的 API Key
 */
export async function getApiKey(provider: ApiKeyProvider): Promise<string | undefined> {
  const keys = await getApiKeys();
  return keys[provider];
}

/**
 * 删除用户的 API Keys
 */
export async function clearApiKeys(): Promise<void> {
  try {
    if (isMobile()) {
      await Preferences.remove({ key: STORAGE_KEY });
      console.log('✅ API Keys 已从移动端删除');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      console.log('✅ API Keys 已从浏览器删除');
    }
  } catch (error) {
    console.error('❌ 删除 API Keys 失败:', error);
    throw new Error('删除 API Keys 失败');
  }
}

/**
 * 检查用户是否已配置 API Keys
 */
export async function hasConfiguredKeys(): Promise<boolean> {
  const keys = await getApiKeys();
  return Object.keys(keys).length > 0 && Object.values(keys).some(key => key && key.trim().length > 0);
}

/**
 * 获取已配置的提供商列表
 */
export async function getConfiguredProviders(): Promise<ApiKeyProvider[]> {
  const keys = await getApiKeys();
  return Object.keys(keys).filter(key => keys[key as ApiKeyProvider]?.trim()) as ApiKeyProvider[];
}
