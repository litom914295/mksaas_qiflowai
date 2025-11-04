import type { Locale } from 'next-intl';
import type { ReactNode } from 'react';

interface DocsLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}

export default async function DocsRootLayout({ children }: DocsLayoutProps) {
  return <div className="min-h-screen">{children}</div>;
}
