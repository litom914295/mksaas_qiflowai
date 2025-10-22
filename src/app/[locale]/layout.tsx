import { AnalysisProvider } from '@/contexts/analysis-context';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '气流AI - 智能八字风水分析平台',
  description: '结合传统八字命理与现代AI技术的智能分析平台',
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // 获取国际化消息（仅在开发环境记录性能）
  const startTime = process.env.NODE_ENV === 'development' ? performance.now() : 0;
  const messages = await getMessages();
  
  if (process.env.NODE_ENV === 'development' && startTime > 0) {
    const duration = performance.now() - startTime;
    console.log(`[i18n] getMessages took ${duration.toFixed(2)}ms`);
  }

  return (
    <div
      className={inter.className}
      data-locale={locale}
      suppressHydrationWarning
    >
      <NextIntlClientProvider messages={messages}>
        <AnalysisProvider>{children}</AnalysisProvider>
      </NextIntlClientProvider>
    </div>
  );
}
