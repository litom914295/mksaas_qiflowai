import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AnalysisContextProvider } from '@/contexts/analysis-context';

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

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AnalysisContextProvider>{children}</AnalysisContextProvider>
      </body>
    </html>
  );
}
