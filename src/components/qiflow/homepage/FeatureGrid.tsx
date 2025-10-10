import { LocaleLink } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

export type FeatureGridProps = { variant?: 'A' | 'B' };

export const FeatureGrid = async ({ variant = 'A' }: FeatureGridProps) => {
  const t = await getTranslations('BaziHome');

  const features = [
    {
      title: t('features.bazi.title') || '八字命盘分析',
      desc: t('features.bazi.desc') || '精准解读你的天赋、性格与人生运势',
      icon: '/brand/icon-bagua.svg',
      href: '/analysis/bazi',
      priority: 'primary', // 主推功能
      tag: t('features.bazi.tag') || '最受欢迎',
      scenario: ['❓ 不知道适合什么职业？', '❓ 总在关键时刻做错选择？'],
      solution: '找到你的用神，看清天赋所在',
      pricing: '首次免费 · 完整报告 30 积分',
      emoji: '🎯',
      stats: '10,000+ 人使用',
    },
    {
      title: t('features.compass.title') || '风水罗盘分析',
      desc: t('features.compass.desc') || '基于玄空飞星，优化空间能量场',
      icon: '/brand/icon-luopan.svg',
      href: '/analysis/xuankong',
      priority: 'secondary',
      tag: t('features.compass.tag') || '专业推荐',
      scenario: ['🏠 搬新家需要选吉位？', '💼 办公室布局影响运势？'],
      solution: '精准定位财位、文昌位',
      pricing: '完整分析 20 积分',
      emoji: '🧭',
      stats: '3,500+ 次分析',
    },
    {
      title: t('features.ai.title') || 'AI智能咨询',
      desc: t('features.ai.desc') || '自然语言问答，个性化解答',
      icon: '/brand/icon-ai.svg',
      href: '/ai-chat',
      priority: 'tertiary',
      tag: t('features.ai.tag') || '即时响应',
      scenario: ['💬 有具体问题想了解？', '🤔 需要针对性建议？'],
      solution: 'AI基于你的八字深度解答',
      pricing: '5 积分/次对话',
      emoji: '✨',
      stats: '日均1,200+次对话',
    },
  ];

  const card =
    variant === 'B'
      ? 'bg-white/6 border-white/15 shadow-[0_0_0_1px_rgba(255,255,255,.06)]'
      : 'bg-white/5 border-white/10';

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-16 md:py-20">
      {/* 区域标题 */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('features.section.title') || '三大核心功能，满足你的所有需求'}
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          {t('features.section.subtitle') ||
            '从个人命理到空间风水，从快速查询到深度咨询'}
        </p>
      </div>

      {/* 功能卡片网格 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((f, index) => (
          <div
            key={f.title}
            className={`group relative rounded-xl border ${card} p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 ${
              f.priority === 'primary'
                ? 'md:scale-105 ring-2 ring-amber-400/30'
                : ''
            }`}
          >
            {/* 标签 */}
            {f.tag && (
              <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-xs font-bold text-black shadow-lg">
                {f.tag}
              </div>
            )}

            {/* 图标和标题 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400/20 to-sky-400/20 ring-1 ring-white/10 group-hover:ring-amber-400/50 transition-all">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {f.emoji}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-400">{f.stats}</p>
              </div>
            </div>

            {/* 描述 */}
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              {f.desc}
            </p>

            {/* 使用场景 */}
            <div className="space-y-2 mb-4 p-3 rounded-lg bg-black/20">
              {f.scenario.map((s, i) => (
                <p key={i} className="text-xs text-slate-400">
                  {s}
                </p>
              ))}
              <p className="text-sm text-amber-400 font-medium mt-2">
                ➜ {f.solution}
              </p>
            </div>

            {/* CTA按钮 */}
            <div className="space-y-2">
              <LocaleLink
                href={f.href}
                className={`block w-full text-center px-4 py-2.5 rounded-lg font-medium transition-all ${
                  f.priority === 'primary'
                    ? 'bg-gradient-to-r from-amber-500 to-sky-500 text-black hover:shadow-lg hover:shadow-amber-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {f.priority === 'primary' ? '立即开始' : '了解更多'}
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </span>
              </LocaleLink>
              <p className="text-xs text-center text-slate-400">{f.pricing}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 底部对比表 */}
      <div className="mt-16 p-6 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          {t('features.comparison.title') || '功能对比一览'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">
                  功能
                </th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">
                  适合人群
                </th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">
                  核心价值
                </th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">
                  时间
                </th>
                <th className="text-center py-3 px-4 text-slate-300 font-medium">
                  价格
                </th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="py-3 px-4 font-medium">八字分析</td>
                <td className="py-3 px-4 text-center">求职/转行/择偶</td>
                <td className="py-3 px-4 text-center">发现天赋与时机</td>
                <td className="py-3 px-4 text-center">3分钟</td>
                <td className="py-3 px-4 text-center text-amber-400 font-medium">
                  30积分
                </td>
              </tr>
              <tr className="border-b border-white/10 hover:bg-white/5">
                <td className="py-3 px-4 font-medium">风水罗盘</td>
                <td className="py-3 px-4 text-center">搬家/选址/布局</td>
                <td className="py-3 px-4 text-center">优化空间能量场</td>
                <td className="py-3 px-4 text-center">5分钟</td>
                <td className="py-3 px-4 text-center text-amber-400 font-medium">
                  20积分
                </td>
              </tr>
              <tr className="hover:bg-white/5">
                <td className="py-3 px-4 font-medium">AI咨询</td>
                <td className="py-3 px-4 text-center">有具体问题</td>
                <td className="py-3 px-4 text-center">个性化解答</td>
                <td className="py-3 px-4 text-center">即时</td>
                <td className="py-3 px-4 text-center text-amber-400 font-medium">
                  5积分/次
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
