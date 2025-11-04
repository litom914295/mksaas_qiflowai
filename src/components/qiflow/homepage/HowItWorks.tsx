import { getTranslations } from 'next-intl/server';

export type HowItWorksProps = { variant?: 'A' | 'B' };

export const HowItWorks = async ({ variant = 'A' }: HowItWorksProps) => {
  const t = await getTranslations('BaziHome');
  const steps = [
    { title: t('how.steps.s1.title'), desc: t('how.steps.s1.desc') },
    { title: t('how.steps.s2.title'), desc: t('how.steps.s2.desc') },
    { title: t('how.steps.s3.title'), desc: t('how.steps.s3.desc') },
  ];
  const card =
    variant === 'B'
      ? 'bg-white/6 border-white/15'
      : 'bg-white/5 border-white/10';
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-12">
      <h2 className="text-xl font-semibold text-white/90">{t('how.title')}</h2>
      <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className={`rounded-lg border ${card} p-6`}>
            <div className="text-sm text-amber-400">Step {i + 1}</div>
            <div className="mt-1 text-base font-medium text-white/90">
              {s.title}
            </div>
            <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
};
