import { getTranslations } from 'next-intl/server';

export type CTASectionProps = { variant?: 'A' | 'B' };

export const CTASection = async ({ variant = 'A' }: CTASectionProps) => {
  const t = await getTranslations('BaziHome');
  const border = variant === 'B' ? 'border-white/15' : 'border-white/10';
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-16">
      <div
        className={`rounded-xl border ${border} bg-gradient-to-br from-amber-500/10 to-sky-500/10 p-8 text-center`}
      >
        <h2 className="text-2xl font-semibold text-white/90">
          {t('cta.title')}
        </h2>
        <p className="mt-2 text-sm text-slate-300">{t('cta.subtitle')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/analysis/bazi"
            className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-black"
          >
            {t('cta.startBazi')}
          </a>
          <a
            href="/ai/chat"
            className="rounded-md border border-white/15 px-5 py-2.5 text-sm text-white/90"
          >
            {t('cta.askAi')}
          </a>
        </div>
      </div>
    </section>
  );
};
