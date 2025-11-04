'use client';

// P1-003: 增强型即时体验结果展示组件
// 功能：展示八字分析预览、五行图表、CTA引导

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { InstantPreviewResponse } from '@/hooks/useInstantPreview';
import { LocaleLink } from '@/i18n/navigation';
import { trackInstantTryUsage } from '@/lib/analytics/conversion-tracking';
import { BaziPillarDisplay } from '../charts/BaziPillarDisplay';
import { WuxingRadarChart } from '../charts/WuxingRadarChart';

type Props = {
  data: NonNullable<InstantPreviewResponse['data']>;
  onReset: () => void;
};

export function InstantResultEnhanced({ data, onReset }: Props) {
  const handleUpgradeClick = () => {
    trackInstantTryUsage('cta_clicked' as any);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 标题与副标题 */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
          <svg
            className="w-4 h-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            分析完成
          </span>
        </div>
        <h3 className="text-2xl font-bold">您的命理预览</h3>
        <p className="text-sm text-muted-foreground">
          以下是根据您的出生信息生成的命理概况
        </p>
      </div>

      {/* AI总结 */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xl shadow-lg">
            🔮
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-lg">AI 命理总结</h4>
            <p className="text-sm leading-relaxed text-foreground/90">
              {data.summary}
            </p>
          </div>
        </div>
      </Card>

      {/* 四柱展示 */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
          您的八字四柱
        </h4>
        <BaziPillarDisplay pillars={data.pillars} />
      </div>

      {/* 五行雷达图 */}
      <div>
        <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
          五行分布图
        </h4>
        <WuxingRadarChart elements={data.elements} />
      </div>

      {/* 关键洞察列表 */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">
          关键洞察
        </h4>
        <div className="space-y-2">
          {data.keyInsights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 text-xs font-bold">
                {index + 1}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA升级引导 */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-amber-200 dark:border-amber-800">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">
              {data.cta.message}
            </h4>
          </div>
          <ul className="space-y-2 text-sm text-amber-900/80 dark:text-amber-100/80">
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>完整30页专业八字报告</span>
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>流年、大运详细分析</span>
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>PDF导出随时查看</span>
            </li>
            <li className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>AI问答无限次数</span>
            </li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <LocaleLink
              href={data.cta.link}
              className="flex-1"
              onClick={handleUpgradeClick}
            >
              <Button className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                立即获取完整报告
              </Button>
            </LocaleLink>
            <Button
              variant="outline"
              onClick={onReset}
              className="sm:w-auto h-12 px-8"
            >
              重新测试
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            💎 限时优惠：首次购买享8折优惠
          </p>
        </div>
      </Card>
    </div>
  );
}
