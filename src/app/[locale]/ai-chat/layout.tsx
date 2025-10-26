import { Footer } from '@/components/layout/footer';
import { SimpleHeader } from '@/components/layout/simple-header';
import type { ReactNode } from 'react';

export default function AIChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimpleHeader title="AI智能咨询" showAuthButtons />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
