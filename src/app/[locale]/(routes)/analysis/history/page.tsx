/**
 * 我的分析页面
 * 显示用户的分析历史记录，支持筛选、搜索、导出等功能
 */

import { AnalysisHistoryClient } from '@/components/analysis/history/analysis-history-client';
import { PageHeader } from '@/components/dashboard/page-header';
import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';

export const metadata: Metadata = {
  title: '我的分析 - 气流AI',
  description: '查看和管理您的八字风水分析记录',
};

export default function AnalysisHistoryPage() {
  const t = useTranslations('Dashboard');

  return (
    <div className="space-y-6">
      <PageHeader
        title="我的分析"
        description="查看和管理您的八字风水分析记录"
      />

      <AnalysisHistoryClient />
    </div>
  );
}
