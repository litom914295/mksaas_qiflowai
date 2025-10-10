'use client';

import { LocaleLink } from '@/i18n/navigation';
import { trackInstantTryUsage } from '@/lib/analytics/conversion-tracking';
import { useState } from 'react';

export const InstantTrySection = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [fortune, setFortune] = useState('');

  // 简化的运势生成（模拟）
  const generateFortune = () => {
    if (!selectedDate) return;

    trackInstantTryUsage('date_selected');

    // 模拟AI生成延迟
    setTimeout(() => {
      const fortunes = [
        '今日运势：⭐⭐⭐⭐ 贵人相助，事业进展顺利。建议多与他人合作。',
        '今日运势：⭐⭐⭐ 财运亨通，适合投资理财。注意情绪波动。',
        '今日运势：⭐⭐⭐⭐⭐ 大吉之日！万事皆宜，把握机会。',
        '今日运势：⭐⭐ 平淡之日，宜静不宜动。适合学习充电。',
      ];

      // 基于日期随机生成（伪随机，保证同一日期结果相同）
      const dateHash = selectedDate
        .split('-')
        .reduce((acc, val) => acc + Number.parseInt(val), 0);
      const fortuneIndex = dateHash % fortunes.length;

      setFortune(fortunes[fortuneIndex]);
      setShowResult(true);
      trackInstantTryUsage('result_generated');
    }, 800);
  };

  const handleCTAClick = () => {
    trackInstantTryUsage('cta_clicked');
  };

  return (
    <section className="mx-auto max-w-screen-xl px-4 py-16 md:py-20">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 via-slate-900/40 to-blue-900/20 p-8 md:p-12 backdrop-blur-sm">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/10 to-pink-500/10 blur-3xl" />

        <div className="relative z-10">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-1 mb-4 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-sm text-purple-300 font-medium">
              ✨ 即时体验
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              立即体验：输入生日，看今日运势
            </h2>
            <p className="text-lg text-slate-300">
              无需注册，1秒生成 · 体验AI命理分析的魅力
            </p>
          </div>

          {/* 输入区域 */}
          <div className="max-w-md mx-auto space-y-6">
            {!showResult ? (
              <>
                <div className="space-y-3">
                  <label
                    htmlFor="birth-date"
                    className="block text-sm font-medium text-slate-300"
                  >
                    你的出生日期
                  </label>
                  <input
                    id="birth-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-slate-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                  />
                </div>

                <button
                  onClick={generateFortune}
                  disabled={!selectedDate}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>查看我的今日运势</span>
                  </span>
                </button>

                <p className="text-xs text-center text-slate-400">
                  💡 这是简化版体验，完整八字分析请点击下方按钮
                </p>
              </>
            ) : (
              <>
                {/* 结果展示 */}
                <div className="p-6 rounded-lg border border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl">
                      🌟
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        你的今日运势
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {fortune}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-400 mb-3">
                      想了解更详细的命理分析吗？
                    </p>
                    <LocaleLink
                      href="/analysis/bazi"
                      className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      onClick={handleCTAClick}
                    >
                      <span>立即获取完整八字报告</span>
                      <span>→</span>
                    </LocaleLink>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowResult(false);
                    setSelectedDate('');
                    setFortune('');
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
                >
                  重新测试
                </button>
              </>
            )}
          </div>

          {/* 信任提示 */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>数据加密</span>
            </div>
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>即时生成</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✓</span>
              <span>专业算法</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
