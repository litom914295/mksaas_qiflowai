import { getDb } from '@/db';
import { baziCalculations, fengshuiAnalysis, creditTransaction } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  IconCalendar,
  IconFlame,
  IconMessageCircle,
  IconSparkles,
  IconTrendingDown,
  IconTrendingUp,
  IconYinYang,
} from '@tabler/icons-react';

type StatsData = {
  baziAnalysisCount: number;
  baziAnalysisTrend: number;
  fengshuiAnalysisCount: number;
  fengshuiAnalysisTrend: number;
  aiChatRounds: number;
  aiChatTrend: number;
  consecutiveSignIns: number;
  signInTrend: number;
};

async function getStatsData(): Promise<StatsData> {
  try {
    const session = await auth.api.getSession({ headers: new Headers() });
    const userId = session?.user?.id;

    if (!session || !userId) {
      return {
        baziAnalysisCount: 0,
        baziAnalysisTrend: 0,
        fengshuiAnalysisCount: 0,
        fengshuiAnalysisTrend: 0,
        aiChatRounds: 0,
        aiChatTrend: 0,
        consecutiveSignIns: 0,
        signInTrend: 0,
      };
    }

    const db = await getDb();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 并行查询所有数据
    const [
      baziThisMonth,
      baziLastMonth,
      fengshuiThisMonth,
      fengshuiLastMonth,
      aiChatThisMonth,
      aiChatLastMonth,
      signInRows,
    ] = await Promise.all([
      // 本月八字分析
      db
        .select({ count: count() })
        .from(baziCalculations)
        .where(
          and(
            eq(baziCalculations.userId, userId),
            gte(baziCalculations.createdAt, startOfMonth)
          )
        ),
      // 上月八字分析
      db
        .select({ count: count() })
        .from(baziCalculations)
        .where(
          and(
            eq(baziCalculations.userId, userId),
            gte(baziCalculations.createdAt, startOfLastMonth),
            sql`${baziCalculations.createdAt} < ${startOfMonth.toISOString()}`
          )
        ),
      // 本月风水分析
      db
        .select({ count: count() })
        .from(fengshuiAnalysis)
        .where(
          and(
            eq(fengshuiAnalysis.userId, userId),
            gte(fengshuiAnalysis.createdAt, startOfMonth)
          )
        ),
      // 上月风水分析
      db
        .select({ count: count() })
        .from(fengshuiAnalysis)
        .where(
          and(
            eq(fengshuiAnalysis.userId, userId),
            gte(fengshuiAnalysis.createdAt, startOfLastMonth),
            sql`${fengshuiAnalysis.createdAt} < ${startOfMonth.toISOString()}`
          )
        ),
      // 本月AI对话
      db
        .select({ count: count() })
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, userId),
            eq(creditTransaction.type, 'AI_CHAT'),
            gte(creditTransaction.createdAt, startOfMonth)
          )
        ),
      // 上月AI对话
      db
        .select({ count: count() })
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, userId),
            eq(creditTransaction.type, 'AI_CHAT'),
            gte(creditTransaction.createdAt, startOfLastMonth),
            sql`${creditTransaction.createdAt} < ${startOfMonth.toISOString()}`
          )
        ),
      // 签到记录
      db
        .select({ createdAt: creditTransaction.createdAt })
        .from(creditTransaction)
        .where(
          and(
            eq(creditTransaction.userId, userId),
            eq(creditTransaction.type, 'DAILY_SIGNIN'),
            gte(
              creditTransaction.createdAt,
              new Date(Date.now() - 120 * 24 * 60 * 60 * 1000)
            )
          )
        ),
    ]);

    // 计算连续签到天数
    const marked = new Set<string>();
    for (const r of signInRows) {
      const d = r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      marked.add(dateKey);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let consecutiveSignIns = 0;

    for (let i = 0; i < 365; i++) {
      const cur = new Date(today);
      cur.setDate(today.getDate() - i);
      const curKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;

      if (marked.has(curKey)) {
        consecutiveSignIns += 1;
      } else {
        break;
      }
    }

    // 计算趋势
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const baziCount = Number(baziThisMonth[0]?.count || 0);
    const baziPrevCount = Number(baziLastMonth[0]?.count || 0);
    const fengshuiCount = Number(fengshuiThisMonth[0]?.count || 0);
    const fengshuiPrevCount = Number(fengshuiLastMonth[0]?.count || 0);
    const aiChatCount = Number(aiChatThisMonth[0]?.count || 0);
    const aiChatPrevCount = Number(aiChatLastMonth[0]?.count || 0);

    return {
      baziAnalysisCount: baziCount,
      baziAnalysisTrend: calculateTrend(baziCount, baziPrevCount),
      fengshuiAnalysisCount: fengshuiCount,
      fengshuiAnalysisTrend: calculateTrend(fengshuiCount, fengshuiPrevCount),
      aiChatRounds: aiChatCount,
      aiChatTrend: calculateTrend(aiChatCount, aiChatPrevCount),
      consecutiveSignIns,
      signInTrend: 0,
    };
  } catch (error) {
    console.error('[QiFlowStatsCardsServer] Error:', error);
    return {
      baziAnalysisCount: 0,
      baziAnalysisTrend: 0,
      fengshuiAnalysisCount: 0,
      fengshuiAnalysisTrend: 0,
      aiChatRounds: 0,
      aiChatTrend: 0,
      consecutiveSignIns: 0,
      signInTrend: 0,
    };
  }
}

/**
 * 服务端统计卡片组件 - SSR优化首屏加载
 * 在服务器端获取数据并渲染，提供最快的首屏显示
 */
export async function QiFlowStatsCardsServer() {
  const stats = await getStatsData();

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* 八字分析次数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>八字分析</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconYinYang className="h-6 w-6 text-purple-500" />
              {stats.baziAnalysisCount}
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.baziAnalysisTrend >= 0 ? (
                <>
                  <IconTrendingUp className="h-3 w-3" />
                  +{stats.baziAnalysisTrend}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="h-3 w-3" />
                  {stats.baziAnalysisTrend}%
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.baziAnalysisTrend >= 0 ? '稳步增长中' : '需要提升'}
            {stats.baziAnalysisTrend >= 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </div>
          <div className="text-muted-foreground">本月累计分析次数</div>
        </CardFooter>
      </Card>

      {/* 风水分析次数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>风水分析</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconSparkles className="h-6 w-6 text-amber-500" />
              {stats.fengshuiAnalysisCount}
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.fengshuiAnalysisTrend >= 0 ? (
                <>
                  <IconTrendingUp className="h-3 w-3" />
                  +{stats.fengshuiAnalysisTrend}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="h-3 w-3" />
                  {stats.fengshuiAnalysisTrend}%
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.fengshuiAnalysisTrend >= 0 ? '持续上升' : '有待改善'}
            {stats.fengshuiAnalysisTrend >= 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </div>
          <div className="text-muted-foreground">本月累计分析次数</div>
        </CardFooter>
      </Card>

      {/* AI对话轮数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>AI对话</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconMessageCircle className="h-6 w-6 text-blue-500" />
              {stats.aiChatRounds}
            </div>
            <Badge variant="outline" className="text-xs">
              {stats.aiChatTrend >= 0 ? (
                <>
                  <IconTrendingUp className="h-3 w-3" />
                  +{stats.aiChatTrend}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="h-3 w-3" />
                  {stats.aiChatTrend}%
                </>
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.aiChatTrend >= 0 ? '活跃互动中' : '使用频率下降'}
            {stats.aiChatTrend >= 0 ? (
              <IconTrendingUp className="size-4 text-green-600" />
            ) : (
              <IconTrendingDown className="size-4 text-red-600" />
            )}
          </div>
          <div className="text-muted-foreground">本月AI对话轮数</div>
        </CardFooter>
      </Card>

      {/* 连续签到天数 */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>连续签到</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconFlame className="h-6 w-6 text-orange-500" />
              {stats.consecutiveSignIns} 天
            </div>
            <Badge variant="outline" className="text-xs">
              <IconCalendar className="h-3 w-3" />
              本月已签 {stats.consecutiveSignIns} 天
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.consecutiveSignIns >= 7 ? '坚持不懈' : '继续加油'}
            <IconFlame
              className={`size-4 ${stats.consecutiveSignIns >= 7 ? 'text-orange-500' : 'text-gray-400'}`}
            />
          </div>
          <div className="text-muted-foreground">
            {stats.consecutiveSignIns >= 30
              ? '已达成月度签到！'
              : `距离下一个里程碑还有 ${Math.ceil((7 - (stats.consecutiveSignIns % 7)) % 7) || 7} 天`}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
