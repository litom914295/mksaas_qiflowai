/**
 * Phase 8: 月度运势详情页面
 * 
 * 路由: /qiflow/monthly-fortune/[id]
 * 
 * 功能：
 * 1. 显示完整的运势报告
 * 2. 飞星九宫格详细分析
 * 3. 八字时令性分析
 * 4. 化解方法建议
 */

import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { MonthlyFortuneDetail } from '@/components/qiflow/monthly-fortune-detail';
import { getMonthlyFortuneById } from '@/actions/qiflow/generate-monthly-fortune';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ==================== 类型定义 ====================

interface PageProps {
  params: {
    id: string;
  };
}

// ==================== Metadata ====================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const result = await getMonthlyFortuneById(params.id);
  
  if (!result.success || !result.data) {
    return {
      title: '运势未找到 - QiFlow AI',
    };
  }

  const fortune = result.data;
  
  return {
    title: `${fortune.year}年${fortune.month}月运势 - QiFlow AI`,
    description: `基于玄空飞星和八字命理的个性化月度运势分析 - 综合评分 ${fortune.overallScore}`,
  };
}

// ==================== 主页面 ====================

export default async function MonthlyFortuneDetailPage({ params }: PageProps) {
  // 获取当前用户
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(`/auth/signin?callbackUrl=/qiflow/monthly-fortune/${params.id}`);
  }

  // 检查是否为 Pro 会员
  if (user.subscriptionTier !== 'pro') {
    redirect('/qiflow/monthly-fortune');
  }

  // 获取运势详情
  const result = await getMonthlyFortuneById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const fortune = result.data;

  // 验证运势是否属于当前用户
  if (fortune.userId !== user.id) {
    notFound();
  }

  // 确保运势已完成生成
  if (fortune.status !== 'completed') {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/qiflow/monthly-fortune">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">
            {fortune.status === 'generating' ? '运势生成中...' : '运势生成失败'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {fortune.status === 'generating' 
              ? '请稍候，预计需要 3-5 秒' 
              : '请返回列表重新生成'}
          </p>
          <Button asChild>
            <Link href="/qiflow/monthly-fortune">
              返回列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 返回按钮 */}
      <div className="container max-w-6xl mx-auto pt-6">
        <Button variant="ghost" asChild>
          <Link href="/qiflow/monthly-fortune">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>

      {/* 详情内容 */}
      <MonthlyFortuneDetail
        fortune={{
          id: fortune.id,
          userId: fortune.userId,
          year: fortune.year,
          month: fortune.month,
          status: fortune.status,
          fortuneData: fortune.fortuneData,
          flyingStarAnalysis: fortune.flyingStarAnalysis,
          baziTimeliness: fortune.baziTimeliness,
          overallScore: fortune.overallScore,
          luckyDirections: fortune.luckyDirections,
          luckyColors: fortune.luckyColors,
          luckyNumbers: fortune.luckyNumbers,
          warnings: fortune.warnings,
          generatedAt: fortune.generatedAt,
        }}
      />
    </div>
  );
}
