import { LocaleLink } from '@/i18n/navigation';
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
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <LocaleLink
            href="/unified-form"
            className="rounded-md bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-semibold text-black shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            {(t as any)('cta.viewFullAnalysis') || '🎯 查看完整分析流程'}
          </LocaleLink>
          <LocaleLink
            href="/unified-form"
            className="rounded-md bg-amber-400 px-5 py-2.5 text-sm font-medium text-black hover:bg-amber-500 transition-colors"
          >
            {t('cta.startBazi')}
          </LocaleLink>
          <LocaleLink
            href="/ai-chat"
            className="rounded-md border border-white/15 px-5 py-2.5 text-sm text-white/90 hover:bg-white/5 transition-colors"
          >
            {t('cta.askAi')}
          </LocaleLink>
        </div>
      </div>
    </section>
  );
};
