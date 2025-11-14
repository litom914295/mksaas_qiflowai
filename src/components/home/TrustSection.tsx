'use client';

import { useTranslations } from 'next-intl';

export function TrustSection() {
  const t = useTranslations('home');

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
            <p className="text-muted-foreground">{t('trust.subtitle')}</p>
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
