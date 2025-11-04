/**
 * Internationalization metadata and utilities
 *
 * Defines language metadata for the 6 supported languages and provides
 * RTL detection functions (although current 6 languages are all LTR,
 * the framework-level capability is preserved for future expansion)
 */

export type LocaleCode = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko' | 'ms-MY';

export interface LocaleMeta {
  code: LocaleCode;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  /**
   * Native name in the language itself
   */
  nativeName: string;
}

/**
 * Metadata for all supported languages
 *
 * Current 6 languages (all LTR):
 * - zh-CN: Simplified Chinese
 * - en: English
 * - ja: Japanese
 * - ko: Korean
 * - ms-MY: Malay (Malaysia)
 * - zh-TW: Traditional Chinese
 */
export const locales: readonly LocaleMeta[] = [
  {
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    nativeName: 'English',
  },
  {
    code: 'zh-CN',
    label: 'Simplified Chinese',
    flag: '🇨🇳',
    dir: 'ltr',
    nativeName: '简体中文',
  },
  {
    code: 'zh-TW',
    label: 'Traditional Chinese',
    flag: '🇹🇼',
    dir: 'ltr',
    nativeName: '繁體中文',
  },
  {
    code: 'ja',
    label: 'Japanese',
    flag: '🇯🇵',
    dir: 'ltr',
    nativeName: '日本語',
  },
  {
    code: 'ko',
    label: 'Korean',
    flag: '🇰🇷',
    dir: 'ltr',
    nativeName: '한국어',
  },
  {
    code: 'ms-MY',
    label: 'Malay (Malaysia)',
    flag: '🇲🇾',
    dir: 'ltr',
    nativeName: 'Bahasa Melayu',
  },
] as const;

/**
 * Check if a locale uses Right-to-Left text direction
 *
 * Currently all 6 supported languages are LTR, but this function
 * is provided for future RTL language support (e.g., Arabic, Hebrew, Persian)
 *
 * @param code - Locale code to check
 * @returns true if the locale is RTL, false otherwise
 */
export function isRtl(code: string): boolean {
  // Reserved for future RTL language support
  // Common RTL languages: ar (Arabic), he (Hebrew), fa (Persian), ur (Urdu)
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(code);
}

/**
 * Get locale metadata by code
 *
 * @param code - Locale code
 * @returns Locale metadata or undefined if not found
 */
export function getLocaleMeta(code: string): LocaleMeta | undefined {
  return locales.find((locale) => locale.code === code);
}

/**
 * Get all supported locale codes
 */
export function getLocaleCodes(): LocaleCode[] {
  return locales.map((locale) => locale.code);
}
