import { routing } from '@/i18n/routing';
import { getDefaultMessages } from '@/i18n/messages';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function I18nDiag({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Try loading translations for the current locale and default locale
  let currentLoaded = true;
  let defaultLoaded = true;
  try {
    await import(`../../../messages/${locale}.json`);
  } catch (e) {
    currentLoaded = false;
  }

  try {
    await import(`../../../messages/${routing.defaultLocale}.json`);
  } catch (e) {
    defaultLoaded = false;
  }

  const t = await getTranslations('Metadata');

  const info = {
    params: { locale },
    routing: {
      locales: routing.locales,
      defaultLocale: routing.defaultLocale,
      localePrefix: 'always',
    },
    messages: {
      currentLoaded,
      defaultLoaded,
    },
    sampleTitle: t('title'),
  } as const;

  return (
    <div style={{ padding: 24 }}>
      <h1>i18n 诊断</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}