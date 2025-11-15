import { SimpleHeader } from '@/components/layout/simple-header';
import type { ReactNode } from 'react';

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimpleHeader title="Reports" showBackButton />
      <main className="flex-1">{children}</main>
    </div>
  );
}
