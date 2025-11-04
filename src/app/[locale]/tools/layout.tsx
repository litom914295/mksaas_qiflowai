import { SimpleHeader } from '@/components/layout/simple-header';
import type { ReactNode } from 'react';

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimpleHeader title="Tools" showBackButton />
      <main className="flex-1">{children}</main>
    </div>
  );
}
