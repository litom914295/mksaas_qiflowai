import { SimpleHeader } from '@/components/layout/simple-header';
import type { ReactNode } from 'react';

export default function AnalysisLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimpleHeader title="Analysis" showBackButton />
      <main className="flex-1">{children}</main>
    </div>
  );
}
