/**
 * Phase 8: 月度运势主页面
 * 
 * 路由: /qiflow/monthly-fortune
 * 
 * 功能：
 * 1. 显示当月运势卡片（未生成则显示生成按钮）
 * 2. 显示历史运势列表
 * 3. Pro 会员专享提示
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getUserPlan } from '@/lib/user-plan';
import { getDb } from '@/db';
import { baziCalculations } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { MonthlyFortuneCard } from '@/components/qiflow/monthly-fortune-card';
import { MonthlyFortuneHistory } from '@/components/qiflow/monthly-fortune-history';
import { getMyMonthlyFortunes } from '@/actions/qiflow/generate-monthly-fortune';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Info } from 'lucide-react';
import Link from 'next/link';

// ==================== Metadata ====================

export const metadata: Metadata = {
  title: '月度运势 - QiFlow AI',
  description: '基于玄空飞星和八字命理的个性化月度运势分析',
};

// ==================== 主页面 ====================

export default async function MonthlyFortunePage() {
  // 获取当前用户
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/qiflow/monthly-fortune');
  }

  const user = session.user;

  // 获取用户计划信息
  const userPlan = await getUserPlan(user.id);
  
  // 检查是否为 Pro 会员（终身或订阅）
  const isPro = userPlan?.type === 'LIFETIME' || userPlan?.type === 'SUBSCRIPTION';
  
  console.log('[monthly-fortune] User plan check:', {
    userId: user.id,
    planType: userPlan?.type,
    planName: userPlan?.planName,
    isPro,
  });

  // 如果不是 Pro 会员，显示升级提示
  if (!isPro) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-500" />
              <div>
                <CardTitle className="text-2xl">Pro 会员专享功能</CardTitle>
                <CardDescription>
                  升级至 Pro 会员即可解锁月度运势分析
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">功能特性</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  <div>
                    <strong>玄空飞星分析</strong> - 九宫飞星分布及吉凶评判
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  <div>
                    <strong>八字时令性</strong> - 分析当月时令对命局的影响
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  <div>
                    <strong>四维运势</strong> - 事业、财运、感情、健康详细预测
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  <div>
                    <strong>趋吉避凶</strong> - 吉方位、幸运色、化解方法建议
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                    <span className="text-xs text-primary">✓</span>
                  </div>
                  <div>
                    <strong>每月自动生成</strong> - Pro 会员每月 1 日自动生成新运势
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="flex-1">
                <Link href="/pricing">
                  <Crown className="mr-2 h-5 w-5" />
                  升级至 Pro 会员
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/qiflow/bazi">
                  返回八字排盘
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 获取用户最近的八字分析结果
  const db = await getDb();
  const latestBazi = await db.query.baziCalculations.findFirst({
    where: eq(baziCalculations.userId, user.id),
    orderBy: [desc(baziCalculations.createdAt)],
  });
  
  const baziChart = latestBazi?.result as any;
  
  console.log('[monthly-fortune] Bazi data check:', {
    userId: user.id,
    hasBazi: !!latestBazi,
    baziId: latestBazi?.id,
    createdAt: latestBazi?.createdAt,
  });

  // 获取历史运势
  const fortunesResult = await getMyMonthlyFortunes({ limit: 10 });
  const fortunes = fortunesResult.success ? (fortunesResult.data || []) : [];

  // 当前年月
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 查找当月运势
  const currentFortune = fortunes.find(
    (f) => f.year === currentYear && f.month === currentMonth
  );

  // 验证数据结构
  console.log('[monthly-fortune page] currentFortune:', currentFortune);

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            月度运势分析
            <Badge variant="secondary" className="text-sm">
              <Crown className="h-3 w-3 mr-1" />
              Pro 专享
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-2">
            基于玄空飞星和八字命理的个性化月度运势预测
          </p>
        </div>
      </div>

      {/* 提示信息 */}
      {!baziChart && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="flex items-start gap-3 p-4">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                请先完成 <Link href="/qiflow/bazi" className="underline font-medium">八字排盘</Link>，
                才能生成个性化的月度运势分析。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 当月运势卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyFortuneCard
          year={currentYear}
          month={currentMonth}
          baziChart={baziChart || undefined}
          fortune={currentFortune ? {
            id: currentFortune.id,
            status: currentFortune.status,
            overallScore: currentFortune.overallScore || 0,
            luckyDirections: currentFortune.luckyDirections || [],
            luckyColors: currentFortune.luckyColors || [],
            luckyNumbers: currentFortune.luckyNumbers || [],
            generatedAt: currentFortune.generatedAt,
          } : undefined}
        />

        {/* 功能说明卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>关于月度运势</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">分析方法</h4>
              <p className="text-muted-foreground leading-relaxed">
                月度运势结合了玄空风水的飞星理论和八字命理的时令分析。
                飞星每月轮转，配合您的八字命局特点，给出当月的运势预测。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">使用建议</h4>
              <p className="text-muted-foreground leading-relaxed">
                建议每月初查看运势，了解当月的吉凶方位和注意事项。
                根据建议调整工作生活安排，趋吉避凶。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">积分消耗</h4>
              <p className="text-muted-foreground leading-relaxed">
                每次生成月度运势消耗 <strong className="text-primary">30 积分</strong>。
                Pro 会员每月 1 日会自动生成当月运势，无需手动操作。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 历史运势列表 */}
      <MonthlyFortuneHistory fortunes={fortunes} />
    </div>
  );
}
