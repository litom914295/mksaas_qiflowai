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
  
  // 算法优先特性标签
  const features = [
    { icon: '🔬', text: t('hero.features.algorithm') || '算法精准' },
    { icon: '🔒', text: t('hero.features.privacy') || '隐私保护' },
    { icon: '⚡', text: t('hero.features.instant') || '即时分析' },
  ];
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

          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-amber-400 to-sky-400 bg-clip-text text-transparent">
              AI赋能传统智慧
            </span>
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl">
              {t('hero.title') || '解码你的人生密码'}
            </span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-200 md:text-xl font-light">
            {t('hero.subtitle') || '专业八字分析与风水指导，基于千年易学智慧与现代AI技术'}
          </p>
          
          {/* 信任标签 */}
          <div className="flex flex-wrap gap-4 mt-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-lg">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Link
              href="/analysis/bazi"
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-sky-500 px-8 py-4 text-base font-bold text-black shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400/50"
            >
              <span className="relative z-10">
                {t('hero.cta.startBazi') || '立即开始我的八字分析'}
              </span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-600 to-sky-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              href="/ai-chat"
              className="group rounded-lg border border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-3.5 text-base font-medium text-white backdrop-blur transition-all hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                {t('hero.cta.askAi') || 'AI智能咨询'}
              </span>
            </Link>
            <Link
              href="/showcase"
              className="group rounded-lg border border-white/20 bg-white/5 px-6 py-3.5 text-base font-medium text-white backdrop-blur transition-all hover:bg-white/10 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <span className="flex items-center gap-2">
                {t('hero.cta.tryCompass') || '查看示例报告'}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <div className="text-xs text-slate-400">
              {t('hero.trust') || '已有10,000+用户信赖使用'}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-amber-400">★</span>
              ))}
              <span className="ml-2 text-sm text-slate-300">4.9/5 用户评分</span>
            </div>
          </div>
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