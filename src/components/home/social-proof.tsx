'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

// 社会证明组件（支持国际化）
export const SocialProof: React.FC = () => {
  const t = useTranslations('SocialProof');
  const tt = t as unknown as (key: string) => string;

  return (
    <section className="w-full py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-background p-6 text-center">
            <p className="text-3xl font-bold">10000+</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('registeredUsers')}
            </p>
          </div>
          <div className="rounded-lg border bg-background p-6 text-center">
            <p className="text-3xl font-bold">50000+</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('reportsGenerated')}
            </p>
          </div>
          <div className="rounded-lg border bg-background p-6 text-center">
            <p className="text-3xl font-bold">98%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('satisfactionRate')}
            </p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  U{i}
                </div>
                <div className="text-sm font-medium">
                  {t('user')} {i}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {tt(`testimonial${i}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
