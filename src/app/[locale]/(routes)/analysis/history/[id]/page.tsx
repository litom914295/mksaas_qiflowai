/**
 * 分析记录详情页面
 * 显示单个分析记录的详细内容
 */

import { AnalysisDetailClient } from '@/components/analysis/history/analysis-detail-client';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

interface AnalysisDetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export const metadata: Metadata = {
  title: '分析详情 - 气流AI',
  description: '查看分析记录的详细内容',
};

export default async function AnalysisDetailPage({
  params,
}: AnalysisDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/analysis/history">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            返回分析列表
          </Link>
        </Button>
      </div>

      <AnalysisDetailClient analysisId={id} />
    </div>
  );
}
