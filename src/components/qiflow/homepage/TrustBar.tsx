import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export type TrustBarProps = { variant?: 'A' | 'B' };

export const TrustBar = async ({ variant = 'A' }: TrustBarProps) => {
  const t = await getTranslations('BaziHome');
  const items = [
    { icon: '/brand/icon-bagua.svg', label: t('trust.professional') },
    { icon: '/brand/icon-ai.svg', label: t('trust.ai') },
    { icon: '/brand/icon-luopan.svg', label: t('trust.privacy') },
  ];
  const container = variant === 'B' ? 'bg-white/4' : 'bg-white/2';
  return (
    <section
      aria-label="信任背书"
      className={`border-y border-white/10 ${container}`}
    >
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <Image src={it.icon} alt={it.label} width={24} height={24} />
            <span className="text-sm text-slate-200">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
