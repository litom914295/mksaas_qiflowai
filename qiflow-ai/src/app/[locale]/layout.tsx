import { Header } from '@/components/layout/header';
import { ErrorBoundary } from '@/components/providers/error-boundary';
import { FontProvider } from '@/components/providers/font-provider';
import { localeDirections, locales } from '@/lib/i18n/config';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'QiFlow AI - Intelligent Feng Shui Analysis Platform',
  description: 'An intelligent analysis platform combining traditional Feng Shui wisdom with modern AI technology.',
};

export const dynamic = 'force-dynamic';
export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}
export const revalidate = 300; // 5分钟

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  // Validate that the incoming `locale` parameter is valid
  const matchedLocale = locales.find((l) => l === locale) || 'zh-CN';
  setRequestLocale(matchedLocale);

  // 获取翻译消息
  const messages = await getMessages();
  const direction = localeDirections[matchedLocale as keyof typeof localeDirections];

  return (
    <div dir={direction} className={`font-${matchedLocale}`}>
      <ErrorBoundary>
        <NextIntlClientProvider messages={messages}>
          <FontProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </FontProvider>
        </NextIntlClientProvider>
      </ErrorBoundary>
    </div>
  );
}
