import { AbPersist } from '@/components/qiflow/ab/AbPersist';
import { AgeVerification } from '@/components/qiflow/compliance/AgeVerification';
import { DisclaimerBar } from '@/components/qiflow/compliance/DisclaimerBar';
import { CTASection } from '@/components/qiflow/homepage/CTASection';
import { FAQ } from '@/components/qiflow/homepage/FAQ';
import { FeatureGrid } from '@/components/qiflow/homepage/FeatureGrid';
import { FourStates } from '@/components/qiflow/homepage/FourStates';
import { Hero } from '@/components/qiflow/homepage/Hero';
import { HowItWorks } from '@/components/qiflow/homepage/HowItWorks';
import { InstantTrySection } from '@/components/qiflow/homepage/InstantTrySection';
import { LiveActivityFeed } from '@/components/qiflow/homepage/LiveActivityFeed';
import { Testimonials } from '@/components/qiflow/homepage/Testimonials';
import { TrustBar } from '@/components/qiflow/homepage/TrustBar';
import { TrustBarEnhanced } from '@/components/qiflow/homepage/TrustBarEnhanced';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { CrispChat, InteractiveCompassTeaser } from './ClientComponents';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    canonicalUrl: getUrlWithLocale('', locale),
    keywords: [
      'AI八字',
      '八字分析',
      '风水罗盘',
      '玄空飞星',
      'AI咨询',
      '命盘',
      '风水',
      'Bazi',
      'Feng Shui',
      'Luopan',
    ],
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const searchParams: Record<string, string | string[] | undefined> =
    await (props.searchParams ?? Promise.resolve({}));
  const { locale } = params;

  const t = await getTranslations('BaziHome');
  const abParam = (
    typeof searchParams.ab === 'string'
      ? searchParams.ab
      : Array.isArray(searchParams.ab)
        ? searchParams.ab[0]
        : undefined
  ) as 'A' | 'B' | undefined;
  const cookieStore = await cookies();
  const abCookie = cookieStore.get('ab_variant')?.value as
    | 'A'
    | 'B'
    | undefined;
  const variant =
    abParam === 'B' || abParam === 'A'
      ? abParam
      : abCookie === 'B' || abCookie === 'A'
        ? abCookie
        : 'A';
  const shouldPersist = abParam ? true : !abCookie;

  return (
    <>
      <div className="flex flex-col">
        <Hero variant={variant} />
        <TrustBar variant={variant} />

        {/* Phase 2: 实时活动流 */}
        <LiveActivityFeed />

        <FeatureGrid variant={variant} />

        {/* Phase 2: 信任增强区 */}
        <TrustBarEnhanced variant={variant} />

        <HowItWorks variant={variant} />

        {/* Phase 2: 即时体验区 */}
        <InstantTrySection />

        <Testimonials variant={variant} />
        <FAQ variant={variant} />
        <Suspense
          fallback={
            <div className="mx-auto my-8 h-40 w-full max-w-3xl animate-pulse rounded-xl bg-muted" />
          }
        >
          <InteractiveCompassTeaser
            title={t('teaser.title')}
            clockwise={t('teaser.clockwise')}
            counterClockwise={t('teaser.counterClockwise')}
            currentDegreeLabel={t('teaser.currentDegreeLabel')}
            variant={variant}
          />
        </Suspense>
        {/* 可按开关展示四态：<FourStates state="limited" variant={variant} /> */}
        <CTASection variant={variant} />
        <AbPersist variant={variant} persist={shouldPersist} />

        <CrispChat />
        <AgeVerification />
        <DisclaimerBar />
      </div>
    </>
  );
}
