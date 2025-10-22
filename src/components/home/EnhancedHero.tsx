'use client';

import { LocaleLink } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Shield, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

export type EnhancedHeroProps = { variant?: 'A' | 'B' };

export const EnhancedHero = ({ variant = 'A' }: EnhancedHeroProps) => {
  const t = useTranslations('BaziHome');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const bg =
    variant === 'B'
      ? 'bg-[radial-gradient(60%_50%_at_50%_0%,rgba(88,166,255,0.35)_0%,rgba(0,0,0,0)_65%)]'
      : 'bg-[radial-gradient(60%_50%_at_50%_0%,rgba(88,166,255,0.20)_0%,rgba(0,0,0,0)_60%)]';

  // 算法优先特性标签
  const features = [
    {
      icon: Zap,
      text: t('hero.features.algorithm') || '算法精准',
      metric: '98%',
      color: 'text-amber-400',
    },
    {
      icon: Shield,
      text: t('hero.features.privacy') || '隐私保护',
      metric: '零泄露',
      color: 'text-green-400',
    },
    {
      icon: TrendingUp,
      text: t('hero.features.instant') || '即时分析',
      metric: '3分钟',
      color: 'text-sky-400',
    },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-screen-xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-start gap-6 md:gap-8">
          {/* Logo 增加微动效 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/brand/logo-bazi.svg"
              alt="AI 八字风水"
              width={200}
              height={40}
              className="opacity-90 transition-all duration-300 hover:scale-105"
              priority
            />
          </motion.div>

          {/* 优化后的价值主张 - 更具体、结果导向 */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-sky-400 bg-clip-text text-transparent animate-gradient">
                {t('hero.optimized.headline') ||
                  '3分钟，看清你的天赋与运势转折点'}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl text-lg text-slate-200 md:text-xl font-light leading-relaxed"
            >
              {t('hero.optimized.subheadline') ||
                '结合千年命理智慧与AI算法，98%用户认为「准得离谱」'}
            </motion.p>
          </div>

          {/* 增强的信任标签 - 带数据指标 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="group flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:scale-105"
              >
                <feature.icon className="w-4 h-4 group-hover:animate-pulse" />
                <span className={`font-medium ${feature.color}`}>
                  {feature.metric}
                </span>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* 社会证明 - 实时感 + CountUp 动画 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-2 text-sm text-slate-400 mt-1"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-sky-400 ring-2 ring-slate-900"
                />
              ))}
            </div>
            <span>
              {t('hero.social.proof') || '已有'}
              {isVisible && (
                <>
                  {' '}
                  <CountUp
                    end={127843}
                    duration={2.5}
                    separator=","
                    className="font-semibold text-amber-400"
                  />{' '}
                </>
              )}
              {t('hero.social.proofSuffix') || '人获得了人生指南'}
            </span>
          </motion.div>

          {/* 优化后的CTA层级 - 主次分明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4 w-full max-w-2xl"
          >
            {/* 主CTA - 最大视觉权重 */}
            <LocaleLink
              href="#quick-start"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-sky-500 px-8 py-4 text-lg font-bold text-black shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 hover:shadow-amber-500/50 focus:outline-none focus:ring-4 focus:ring-amber-400/50 w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t('hero.cta.primary') || '立即免费体验'}
              </span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-600 to-sky-600 opacity-0 transition-opacity group-hover:opacity-100" />
              {/* 光晕效果 */}
              <div className="absolute inset-0 -z-20 blur-xl bg-gradient-to-r from-amber-500 to-sky-500 opacity-70 group-hover:opacity-100 transition-opacity" />
            </LocaleLink>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* 次CTA - 降低决策压力 */}
              <LocaleLink
                href="/showcase"
                className="group rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-base font-medium text-white backdrop-blur transition-all hover:bg-white/20 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <span className="flex items-center gap-2">
                  <span>👀</span>
                  {t('hero.cta.secondary') || '先看个示例'}
                </span>
              </LocaleLink>

              {/* 第三选项 - 最低摩擦 */}
              <LocaleLink
                href="/ai-chat"
                className="group rounded-lg border border-purple-400/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-5 py-3 text-base font-medium text-white backdrop-blur transition-all hover:from-purple-500/20 hover:to-pink-500/20 hover:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">✨</span>
                  {t('hero.cta.tertiary') || 'AI智能咨询'}
                </span>
              </LocaleLink>
            </div>
          </motion.div>

          {/* 微文案 - 消除顾虑 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-sm text-slate-400 -mt-2"
          >
            {t('hero.cta.hint') || '💡 无需注册，1分钟生成 · 首次体验免费'}
          </motion.p>

          {/* 强化的社会证明区 - 带 CountUp 动画 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1 + i * 0.05 }}
                    className="text-xl text-amber-400"
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">
                  {isVisible && <CountUp end={4.9} duration={2} decimals={1} />}
                  /5
                </span>
                <span className="text-xs text-slate-400">用户评分</span>
              </div>
            </div>

            <div className="h-8 w-px bg-white/20 hidden sm:block" />

            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">
                {isVisible && (
                  <CountUp end={127843} duration={2.5} separator="," />
                )}
                +
              </span>
              <span className="text-xs text-slate-400">用户信赖使用</span>
            </div>

            <div className="h-8 w-px bg-white/20 hidden sm:block" />

            <div className="flex flex-col">
              <span className="text-lg font-bold text-amber-400">
                {isVisible && <CountUp end={98} duration={2} />}%
              </span>
              <span className="text-xs text-slate-400">算法准确率</span>
            </div>
          </motion.div>
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
