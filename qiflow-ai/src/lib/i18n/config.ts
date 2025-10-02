// 国际化配置
export const locales = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'] as const;
export const defaultLocale = 'zh-CN' as const;

export type Locale = typeof locales[number];

export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'ms': 'Bahasa Melayu',
};

export const localeFlags: Record<Locale, string> = {
  'zh-CN': '🇨🇳',
  'zh-TW': '🇹🇼',
  'en': '🇺🇸',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'ms': '🇲🇾',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  'zh-CN': 'ltr',
  'zh-TW': 'ltr',
  'en': 'ltr',
  'ja': 'ltr',
  'ko': 'ltr',
  'ms': 'ltr',
};