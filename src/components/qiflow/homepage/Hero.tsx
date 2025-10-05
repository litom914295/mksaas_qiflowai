import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

export type HeroProps = { variant?: 'A' | 'B' };

export const Hero = async ({ variant = 'A' }: HeroProps) => {
  const t = await getTranslations('BaziHome');
  const bg =
    variant === 'B'
      ? 'bg-[radial-gradient(60%_50%_at_50%_0%,rgba(88,166,255,0.35)_0%,rgba(0,0,0,0)_65%)]'
      : 'bg-[radial-gradient(60%_50%_at_50%_0%,rgba(88,166,255,0.20)_0%,rgba(0,0,0,0)_60%)]';
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-start gap-6 md:gap-8">
          <Image
            src="/brand/logo-bazi.svg"
            alt="AI 八字风水"
            width={200}
            height={40}
            className="opacity-90"
          />

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="max-w-2xl text-base text-slate-300 md:text-lg">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Link
              href="/analysis/bazi"
              className="rounded-md bg-gradient-to-r from-amber-500 to-sky-500 px-5 py-2.5 text-sm font-medium text-black shadow hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {t('hero.cta.startBazi')}
            </Link>
            <Link
              href="/analysis/xuankong"
              className="rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white backdrop-blur hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {t('hero.cta.tryCompass')}
            </Link>
            <Link
              href="/ai/chat"
              className="rounded-md border border-white/10 px-5 py-2.5 text-sm font-medium text-white/90 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {t('hero.cta.askAi')}
            </Link>
          </div>

          <div className="mt-4 text-xs text-slate-400">{t('billing.hint')}</div>
        </div>
      </div>

      {/* 背景层：径向光晕 */}
      <div className={`pointer-events-none absolute inset-0 -z-10 ${bg}`} />

      {/* 背景层：轻量网格（低开销，无依赖） */}
      <div
        className="pointer-events-none absolute inset-0 -z-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 0 0',
          opacity: variant === 'B' ? 0.25 : 0.18,
        }}
      />
    </section>
  );
};
