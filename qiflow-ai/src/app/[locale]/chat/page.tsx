import '@/styles/chat-theme.css';

import { EnhancedChatInterface } from '@/components/chat/enhanced-chat-interface';
import { ChatLoadingSkeleton } from '@/components/chat/loading-skeleton';
import { ThreeOverlay } from '@/components/chat/three-overlay';
import { locales } from '@/lib/i18n/config';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

const createSessionId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? `chat-${crypto.randomUUID()}`
    : `chat-${Date.now()}`;

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chat' });
  const sessionId = createSessionId();

  return (
    <div className='chat-page'>
      <section className='chat-hero'>
        <div className='chat-badge'>
          <span aria-hidden='true'>AI</span>
          {t('badge')}
        </div>
        <h1>{t('title')}</h1>
        <p>{t('subtitle')}</p>
        <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
          <Link className='chat-cta' href={`/${locale}/guest-analysis`}>
            <span aria-hidden='true'>Chat</span>
            {t('ctaPrimary')}
          </Link>
          <Link
            className='chat-cta bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10'
            href={`/${locale}/test-guest`}
          >
            <span aria-hidden='true'>PDF</span>
            {t('ctaSecondary')}
          </Link>
        </div>
      </section>

      <section className='chat-shell container mx-auto px-4 pb-16'>
        <div className='relative'>
          <ThreeOverlay className='hidden md:block' intensity={0.9} />
          <Suspense fallback={<ChatLoadingSkeleton />}>
            <div className='chat-panel relative p-4 sm:p-6 lg:p-8'>
              <EnhancedChatInterface
                sessionId={sessionId}
                userId='guest'
                className='min-h-[520px]'
              />
            </div>
          </Suspense>
        </div>
      </section>
    </div>
  );
}
