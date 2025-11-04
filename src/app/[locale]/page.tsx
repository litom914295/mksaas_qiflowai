import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// 动态导入重型组件，延迟加载
const HeroWithForm = dynamic(() =>
  import('@/components/home/HeroWithForm').then((mod) => ({
    default: mod.HeroWithForm,
  }))
);

const FeatureShowcase = dynamic(() =>
  import('@/components/home/FeatureShowcase').then((mod) => ({
    default: mod.FeatureShowcase,
  }))
);

const PricingSection = dynamic(() =>
  import('@/components/home/PricingSection').then((mod) => ({
    default: mod.PricingSection,
  }))
);

// 信任区块为动态内容，从翻译文件获取
async function TrustSection() {
  const t = (await getTranslations('home')) as unknown as (
    key: string
  ) => string;

  const trustItems = [
    {
      icon: '🔒',
      title: t('trust.privacy.title'),
      description: t('trust.privacy.description'),
    },
    {
      icon: '⚡',
      title: t('trust.speed.title'),
      description: t('trust.speed.description'),
    },
    {
      icon: '✨',
      title: t('trust.accuracy.title'),
      description: t('trust.accuracy.description'),
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {t('trust.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('trust.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {trustItems.map((item, index) => (
              <div
                key={index}
                className="group flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2 text-lg">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 服务器组件 - 快速渲染
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 - 静态部分先渲染 */}
      <Navbar scroll={true} />

      {/* Hero + Form - 延迟加载 */}
      <Suspense
        fallback={
          <div className="min-h-[600px] flex items-center justify-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        }
      >
        <HeroWithForm />
      </Suspense>

      {/* Feature Showcase - 延迟加载 */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <FeatureShowcase />
      </Suspense>

      {/* Pricing - 延迟加载 */}
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <PricingSection />
      </Suspense>

      {/* Trust Section - 服务器渲染 */}
      <TrustSection />

      {/* Footer - 静态内容 */}
      <Footer />
    </div>
  );
}
