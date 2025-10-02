import { GlobalErrorBoundary } from '@/components/providers/global-error-boundary';
import { AuthProvider } from '@/lib/auth/context';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QiFlow AI - 智能风水分析平台',
  description: '结合传统风水智慧与现代AI技术的智能风水分析平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='zh-CN'>
      <body suppressHydrationWarning={true}>
        <GlobalErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
