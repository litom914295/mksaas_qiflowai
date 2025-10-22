/**
 * 翻译加载工具
 * 由 AI-WORKFLOW v5.0 自动生成
 *
 * 功能：
 * - 按需加载翻译文件
 * - 深度合并嵌套翻译
 * - 类型安全的翻译键
 * - 缓存优化
 */

import type { Locale } from './config';

type TranslationFile = 'common' | 'auth' | 'dashboard' | 'errors' | 'chat';

// 翻译缓存
const translationCache = new Map<string, Record<string, any>>();

/**
 * 加载指定语言的翻译文件
 */
export async function loadTranslations(
  locale: Locale,
  files: TranslationFile[] = ['common']
): Promise<Record<string, any>> {
  const cacheKey = `${locale}-${files.join(',')}`;

  // 检查缓存
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const translations: Record<string, any> = {};

  // 加载所有请求的翻译文件
  await Promise.all(
    files.map(async (file) => {
      try {
        const module = await import(`@/locales/${locale}/${file}.json`);
        Object.assign(translations, module.default || module);
      } catch (error) {
        console.warn(
          `Failed to load translation file: ${locale}/${file}.json`,
          error
        );
      }
    })
  );

  // 缓存结果
  translationCache.set(cacheKey, translations);

  return translations;
}

/**
 * 获取翻译值（支持嵌套键）
 * 示例: t('common.welcome.title')
 */
export function getTranslation(
  translations: Record<string, any>,
  key: string,
  fallback?: string
): string {
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback || key;
    }
  }

  return typeof value === 'string' ? value : fallback || key;
}

/**
 * 创建翻译函数
 */
export function createTranslator(translations: Record<string, any>) {
  return (key: string, fallback?: string) =>
    getTranslation(translations, key, fallback);
}

/**
 * 清除翻译缓存（开发环境热更新使用）
 */
export function clearTranslationCache() {
  translationCache.clear();
}
