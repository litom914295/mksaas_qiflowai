import { defaultLocale, locales } from '@/lib/i18n/config';
import { getRequestConfig } from 'next-intl/server';
import { unstable_cacheTag } from 'next/cache';

/**
 * Next-intl request configuration for internationalization
 * 
 * This function validates the requested locale and loads the corresponding
 * translation messages. It includes fallback handling for robustness.
 * 
 * @param locale - The requested locale from the URL parameter
 * @returns Configuration object with loaded messages
 * @throws notFound() if the locale is not supported
 */
export default getRequestConfig(async ({ locale, requestLocale }) => {
  // Handle case where requestLocale might be a Promise
  let resolvedRequestLocale: string | undefined;
  try {
    resolvedRequestLocale = await Promise.resolve(requestLocale as unknown as string | undefined);
  } catch (error) {
    console.error('[i18n] Error resolving requestLocale:', error);
    resolvedRequestLocale = undefined;
  }

  // Prioritize requestLocale, then locale
  const detectedLocale = resolvedRequestLocale ?? locale ?? '';
  const normalized = detectedLocale.toString();
  
  // Log received locale for debugging
  console.log('[i18n] requested locale:', normalized);
  console.log('[i18n] requestLocale:', resolvedRequestLocale);
  console.log('[i18n] locale param:', locale);
  
  // Exact locale matching to ensure correct language switching
  const matched = locales.find(l => l === normalized) || defaultLocale;
  console.log('[i18n] matched locale:', matched);
  
  // Add cache tag for current locale for external invalidation
  try { unstable_cacheTag?.(`i18n:${matched}`); } catch {}
  
  try {
    return {
      locale: matched,
      messages: (await import(`@/locales/${matched}.json`)).default
    };
  } catch (error) {
    // If loading specific language fails, fallback to default language
    console.error(`Failed to load locale ${locale}, falling back to ${defaultLocale}:`, error);
    
    try {
      return {
        locale: defaultLocale,
        messages: (await import(`@/locales/${defaultLocale}.json`)).default
      };
    } catch (fallbackError) {
      console.error(`Failed to load fallback locale ${defaultLocale}:`, fallbackError);
      // If even default language fails to load, return empty object to avoid app crash
      return {
        locale: defaultLocale,
        messages: {}
      };
    }
  }
});