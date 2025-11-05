/**
 * AI Provider 管理模块
 * 参考 mksaas 模板最佳实践
 * 集中管理多云 Provider（OpenAI、DeepSeek、Gemini）
 */

import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

// OpenAI Provider
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.tu-zi.com/v1',
});

// DeepSeek Provider (使用官方 SDK)
export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

// Google Gemini Provider
export const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '',
  baseURL:
    process.env.GEMINI_BASE_URL ||
    'https://generativelanguage.googleapis.com/v1beta',
});

// Provider 类型定义
export type ProviderKey = 'openai' | 'deepseek' | 'gemini';

/**
 * 根据 Provider 名称和模型名称解析具体的模型实例
 */
export function resolveModel(provider: ProviderKey, model?: string) {
  switch (provider) {
    case 'openai':
      return openai(model || 'gpt-4o-mini');
    case 'deepseek':
      return deepseek(model || 'deepseek-chat');
    case 'gemini':
      return gemini(model || 'gemini-2.0-flash-exp');
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * 检查 Provider 是否可用（API Key 已配置）
 */
export function isProviderAvailable(provider: ProviderKey): boolean {
  switch (provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'deepseek':
      return !!process.env.DEEPSEEK_API_KEY;
    case 'gemini':
      return !!(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);
    default:
      return false;
  }
}

/**
 * 获取所有可用的 Provider 列表（按优先级排序）
 */
export function getAvailableProviders(): ProviderKey[] {
  const providers: ProviderKey[] = ['deepseek', 'openai', 'gemini'];
  return providers.filter(isProviderAvailable);
}

/**
 * 获取默认 Provider（优先使用 DeepSeek，其次 OpenAI，最后 Gemini）
 */
export function getDefaultProvider(): ProviderKey {
  const available = getAvailableProviders();
  if (available.length === 0) {
    throw new Error('No AI provider available. Please configure API keys.');
  }
  return available[0];
}
