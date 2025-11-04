import { Footer } from '@/components/layout/footer';
import { SimpleHeader } from '@/components/layout/simple-header';
import type { ReactNode } from 'react';

export default function BaziTestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SimpleHeader title="八字测试" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
