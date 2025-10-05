import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

export type FeatureGridProps = { variant?: 'A' | 'B' };

export const FeatureGrid = async ({ variant = 'A' }: FeatureGridProps) => {
  const t = await getTranslations('BaziHome');
  const features = [
    {
      title: t('features.bazi.title'),
      desc: t('features.bazi.desc'),
      icon: '/brand/icon-bagua.svg',
      href: '/analysis/bazi',
    },
    {
      title: t('features.compass.title'),
      desc: t('features.compass.desc'),
      icon: '/brand/icon-luopan.svg',
      href: '/analysis/xuankong',
    },
    {
      title: t('features.ai.title'),
      desc: t('features.ai.desc'),
      icon: '/brand/icon-ai.svg',
      href: '/ai/chat',
    },
  ];
  const card =
    variant === 'B'
      ? 'bg-white/6 border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,.06)]'
      : 'bg-white/5 border-white/10';
  return (
    <section className="mx-auto max-w-screen-xl px-4 py-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className={`rounded-lg border ${card} p-6 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              <Image src={f.icon} alt={f.title} width={24} height={24} />
              <h3 className="text-base font-medium text-white/90">{f.title}</h3>
            </div>
            <p className="mt-2 text-sm text-slate-300">{f.desc}</p>
            <div className="mt-4">
              <Link
                href={f.href}
                className="text-sm text-amber-400 hover:underline"
              >
                →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
