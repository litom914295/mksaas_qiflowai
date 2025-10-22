import { websiteConfig } from '@/config/website';

export type Locale = keyof typeof websiteConfig.i18n.locales;
export const locales = Object.keys(websiteConfig.i18n.locales) as Locale[];
export const defaultLocale = websiteConfig.i18n.defaultLocale as Locale;

// 语言名称映射（用于UI显示）
export const localeNames: Record<Locale, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  'ms-MY': 'Bahasa Melayu',
};
