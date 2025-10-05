/**
 * Localization formatting utilities
 *
 * Provides locale-aware formatting functions for numbers, currencies,
 * dates, percentages, and other locale-sensitive data using Intl APIs
 */

import type { LocaleCode } from './meta';

/**
 * Currency codes supported for each locale
 */
const LOCALE_CURRENCY_MAP: Record<LocaleCode, string> = {
  en: 'USD',
  'zh-CN': 'CNY',
  'zh-TW': 'TWD',
  ja: 'JPY',
  ko: 'KRW',
  'ms-MY': 'MYR',
};

/**
 * Format a number as currency in the specified locale
 *
 * @param value - Number to format
 * @param locale - Locale code
 * @param currency - Currency code (e.g., USD, CNY, JPY). Defaults to locale's default currency
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 *
 * @example
 * fmtCurrency(9.99, 'en') // "$9.99"
 * fmtCurrency(9.99, 'zh-CN') // "¥9.99"
 * fmtCurrency(9.99, 'ja') // "¥10"
 */
export function fmtCurrency(
  value: number,
  locale: LocaleCode,
  currency?: string,
  options?: Intl.NumberFormatOptions
): string {
  const currencyCode = currency || LOCALE_CURRENCY_MAP[locale];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format a number in the specified locale
 *
 * @param value - Number to format
 * @param locale - Locale code
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 *
 * @example
 * fmtNumber(1234.56, 'en') // "1,234.56"
 * fmtNumber(1234.56, 'zh-CN') // "1,234.56"
 * fmtNumber(1234.56, 'ja') // "1,234.56"
 */
export function fmtNumber(
  value: number,
  locale: LocaleCode,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format a date in the specified locale
 *
 * @param date - Date to format (Date object or timestamp)
 * @param locale - Locale code
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * fmtDate(new Date(), 'en') // "Jan 1, 2024"
 * fmtDate(new Date(), 'zh-CN') // "2024年1月1日"
 * fmtDate(new Date(), 'ja') // "2024年1月1日"
 */
export function fmtDate(
  date: Date | number,
  locale: LocaleCode,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Format a datetime in the specified locale
 *
 * @param date - Date to format (Date object or timestamp)
 * @param locale - Locale code
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted datetime string
 *
 * @example
 * fmtDateTime(new Date(), 'en') // "Jan 1, 2024, 12:00 PM"
 * fmtDateTime(new Date(), 'zh-CN') // "2024年1月1日 12:00"
 */
export function fmtDateTime(
  date: Date | number,
  locale: LocaleCode,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(locale, {
    ...defaultOptions,
    ...options,
  }).format(date);
}

/**
 * Format a number as a percentage in the specified locale
 *
 * @param value - Number to format (0.5 = 50%)
 * @param locale - Locale code
 * @param options - Intl.NumberFormat options
 * @returns Formatted percentage string
 *
 * @example
 * fmtPercent(0.5, 'en') // "50%"
 * fmtPercent(0.1234, 'zh-CN', { maximumFractionDigits: 2 }) // "12.34%"
 */
export function fmtPercent(
  value: number,
  locale: LocaleCode,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

/**
 * Format a file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @param locale - Locale code
 * @returns Formatted file size string
 *
 * @example
 * fmtFileSize(1024, 'en') // "1 KB"
 * fmtFileSize(1048576, 'zh-CN') // "1 MB"
 */
export function fmtFileSize(bytes: number, locale: LocaleCode): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  const formatted = fmtNumber(value, locale, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  });

  return `${formatted} ${units[unitIndex]}`;
}

/**
 * Format a relative time (e.g., "2 hours ago", "in 3 days")
 *
 * @param date - Target date
 * @param baseDate - Base date to compare against (defaults to now)
 * @param locale - Locale code
 * @returns Formatted relative time string
 *
 * @example
 * fmtRelativeTime(new Date(Date.now() - 3600000), new Date(), 'en') // "1 hour ago"
 * fmtRelativeTime(new Date(Date.now() + 86400000), new Date(), 'zh-CN') // "1天后"
 */
export function fmtRelativeTime(
  date: Date,
  baseDate: Date,
  locale: LocaleCode
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = date.getTime() - baseDate.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (Math.abs(years) >= 1) {
    return rtf.format(years, 'year');
  }
  if (Math.abs(months) >= 1) {
    return rtf.format(months, 'month');
  }
  if (Math.abs(days) >= 1) {
    return rtf.format(days, 'day');
  }
  if (Math.abs(hours) >= 1) {
    return rtf.format(hours, 'hour');
  }
  if (Math.abs(minutes) >= 1) {
    return rtf.format(minutes, 'minute');
  }
  return rtf.format(seconds, 'second');
}
