import { Footer } from '@/components/layout/footer';
import { SimpleHeader } from '@/components/layout/simple-header';
import type { ReactNode } from 'react';

export default function PerformanceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimpleHeader title="性能监控中心" showAuthButtons />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
