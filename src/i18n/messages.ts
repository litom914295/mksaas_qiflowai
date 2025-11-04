import deepmerge from 'deepmerge';
import type { Locale, Messages } from 'next-intl';
import { routing } from './routing';

// assume that the default messages are in the en.json file
// if you want to use a different default locale, you can change to other {locale}.json file
// we need to export the default messages so that we can use them in the app/manifest.ts file
// and the email templates can use the default messages to preview the emails
export { default as defaultMessages } from '../../messages/en.json';

// 内存缓存，避免重复加载和合并
const messagesCache = new Map<Locale, Messages>();
let defaultMessagesCache: Messages | null = null;

const importLocale = async (locale: Locale): Promise<Messages> => {
  return (await import(`../../messages/${locale}.json`)).default as Messages;
};

// Instead of using top-level await, create a function to get default messages
export const getDefaultMessages = async (): Promise<Messages> => {
  if (!defaultMessagesCache) {
    defaultMessagesCache = await importLocale(routing.defaultLocale);
  }
  return defaultMessagesCache;
};

/**
 * If you have incomplete messages for a given locale and would like to use messages
 * from another locale as a fallback, you can merge the two accordingly.
 *
 * https://next-intl.dev/docs/usage/configuration#messages
 */
export const getMessagesForLocale = async (
  locale: Locale
): Promise<Messages> => {
  // 检查缓存
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale)!;
  }

  const startTime = performance.now();
  const localeMessages = await importLocale(locale);

  let result: Messages;
  if (locale === routing.defaultLocale) {
    result = localeMessages;
  } else {
    // Get default messages when needed instead of using a top-level await
    const defaultMessages = await getDefaultMessages();
    result = deepmerge(defaultMessages, localeMessages);
  }

  // 存入缓存
  messagesCache.set(locale, result);

  const duration = performance.now() - startTime;
  console.log(`[i18n] getMessages: ${duration.toFixed(3)}ms`);

  return result;
};
