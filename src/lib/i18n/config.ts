import { websiteConfig } from '@/config/website';

export type Locale = keyof typeof websiteConfig.i18n.locales;
export const locales = Object.keys(websiteConfig.i18n.locales) as Locale[];
export const defaultLocale = websiteConfig.i18n.defaultLocale as Locale;
