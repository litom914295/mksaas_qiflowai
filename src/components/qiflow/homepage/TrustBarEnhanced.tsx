import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export type TrustBarEnhancedProps = { variant?: 'A' | 'B' };

export const TrustBarEnhanced = async ({
  variant = 'A',
}: TrustBarEnhancedProps) => {
  const t = await getTranslations('BaziHome');

  // 信任支柱数据
  const trustPillars = [
    {
      icon: '🔬',
      metric: '98%',
      label: t('trust.accuracy') || '算法准确率',
      proof: '基于2000+古籍与现代统计验证',
    },
    {
      icon: '🛡️',
      metric: '零泄露',
      label: t('trust.privacy') || '隐私保护',
      proof: '生辰数据加密存储，不可逆',
    },
    {
      icon: '👥',
      metric: '127k+',
      label: t('trust.users') || '用户信赖',
      proof: '日均3000+次分析，复购率72%',
    },
  ];

  // 专家背书
  const expertTestimonial = {
    name: '张明德',
    title: '30年执业命理师',
    avatar: '/brand/expert-placeholder.svg',
    quote: 'QiFlow 是我见过最严谨的命理工具，每个推断都有据可查。',
  };

  // 认证徽章
  const certificationBadges = [
    { icon: '✓', label: '专业认证' },
    { icon: '🔒', label: 'GDPR合规' },
    { icon: '⚡', label: 'ISO认证' },
  ];

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-16 md:py-20">
      {/* 区域标题 */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          为什么选择 QiFlow AI
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          专业算法 · 隐私至上 · 真实用户的选择
        </p>
      </div>

      {/* 核心信任支柱 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {trustPillars.map((pillar, index) => (
          <div
            key={index}
            className="group relative rounded-xl border border-white/10 bg-gradient-to-b from-white/8 to-white/4 p-8 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
          >
            {/* 图标背景光晕 */}
            <div className="absolute top-4 right-4 h-20 w-20 rounded-full bg-gradient-to-br from-amber-400/20 to-sky-400/20 blur-2xl" />

            <div className="relative">
              {/* 图标 */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-sky-400/20 ring-1 ring-white/20 group-hover:ring-amber-400/50 transition-all">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </span>
              </div>

              {/* 指标 */}
              <div className="mb-2 text-4xl font-bold bg-gradient-to-r from-amber-400 to-sky-400 bg-clip-text text-transparent">
                {pillar.metric}
              </div>

              {/* 标签 */}
              <div className="mb-3 text-xl font-semibold text-white">
                {pillar.label}
              </div>

              {/* 证明 */}
              <p className="text-sm text-slate-400 leading-relaxed">
                {pillar.proof}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 专家认证带 */}
      <div className="mb-12 rounded-xl border border-white/10 bg-gradient-to-r from-white/8 via-white/5 to-white/8 p-6 md:p-8 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 专家头像（占位符） */}
          <div className="relative h-20 w-20 flex-shrink-0">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-400 to-amber-600 ring-4 ring-amber-400/20" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 ring-2 ring-slate-900" />
          </div>

          {/* 引言内容 */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-lg md:text-xl text-slate-200 italic mb-3 leading-relaxed">
              "{expertTestimonial.quote}"
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-sm font-semibold text-amber-400">
                {expertTestimonial.name}
              </span>
              <span className="text-sm text-slate-400">·</span>
              <span className="text-sm text-slate-400">
                {expertTestimonial.title}
              </span>
              <div className="ml-2 px-2 py-1 rounded bg-amber-500/20 text-xs text-amber-400 font-medium">
                认证专家
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 认证徽章行 */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {certificationBadges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-sm"
          >
            <span className="text-lg text-green-400">{badge.icon}</span>
            <span className="text-sm font-medium text-slate-300">
              {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* 媒体报道（可选，未来添加） */}
      <div className="mt-12 text-center">
        <p className="text-sm text-slate-500 mb-4">媒体报道</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-40">
          {/* 占位，未来添加真实媒体logo */}
          <div className="text-xs text-slate-600">TechCrunch</div>
          <div className="text-xs text-slate-600">Forbes</div>
          <div className="text-xs text-slate-600">Bloomberg</div>
        </div>
      </div>
    </section>
  );
};
