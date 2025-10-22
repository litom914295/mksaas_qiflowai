import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getDb } from '@/db';
import {
  creditTransaction,
  referralRelationships,
  shareRecords,
  user,
} from '@/db/schema';
import { count, desc, eq, gte, sql } from 'drizzle-orm';
import {
  Activity,
  DollarSign,
  FileText,
  Share2,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

// 获取统计数据
async function getDashboardStats() {
  const db = await getDb();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 用户统计
  const totalUsers = await db.select({ count: count() }).from(user);

  const todayUsers = await db
    .select({ count: count() })
    .from(user)
    .where(gte(user.createdAt, today));

  const monthlyUsers = await db
    .select({ count: count() })
    .from(user)
    .where(gte(user.createdAt, thisMonth));

  // 积分交易统计
  const todayTransactions = await db
    .select({
      count: count(),
      total: sql<number>`COALESCE(SUM(amount), 0)`,
    })
    .from(creditTransaction)
    .where(gte(creditTransaction.createdAt, today));

  // 推荐统计
  const totalReferrals = await db
    .select({ count: count() })
    .from(referralRelationships);

  const activatedReferrals = await db
    .select({ count: count() })
    .from(referralRelationships)
    .where(eq(referralRelationships.rewardGranted, true));

  // 分享统计
  const todayShares = await db
    .select({
      count: count(),
      conversions: sql<number>`COALESCE(SUM(CASE WHEN reward_granted THEN 1 ELSE 0 END), 0)`,
    })
    .from(shareRecords)
    .where(gte(shareRecords.createdAt, today));

  return {
    users: {
      total: totalUsers[0].count,
      today: todayUsers[0].count,
      monthly: monthlyUsers[0].count,
    },
    transactions: {
      today: todayTransactions[0].count,
      amount: Number(todayTransactions[0].total),
    },
    referrals: {
      total: totalReferrals[0].count,
      activated: activatedReferrals[0].count,
    },
    shares: {
      today: todayShares[0].count,
      conversions: Number(todayShares[0].conversions),
    },
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const activationRate =
    stats.referrals.total > 0
      ? ((stats.referrals.activated / stats.referrals.total) * 100).toFixed(1)
      : '0';
  const shareConversionRate =
    stats.shares.today > 0
      ? ((stats.shares.conversions / stats.shares.today) * 100).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">仪表板</h1>
        <p className="text-muted-foreground">管理后台数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 {stats.users.today}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日积分交易</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactions.today}</div>
            <p className="text-xs text-muted-foreground">
              共 {stats.transactions.amount} 积分
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推荐激活率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.referrals.activated} / {stats.referrals.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日分享转化</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shareConversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.shares.conversions} / {stats.shares.today}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要功能入口 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>增长数据</span>
            </CardTitle>
            <CardDescription>查看详细的增长KPI指标</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>用户管理</span>
            </CardTitle>
            <CardDescription>管理用户账户和权限</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>内容管理</span>
            </CardTitle>
            <CardDescription>管理文章和内容资源</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>运营管理</span>
            </CardTitle>
            <CardDescription>推荐、分享、积分等运营功能</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>风控管理</span>
            </CardTitle>
            <CardDescription>黑名单和风控规则配置</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>订单管理</span>
            </CardTitle>
            <CardDescription>订单查询和退款处理</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用管理功能入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <a
              href="/zh-CN/admin/metrics"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              查看增长KPI
            </a>
            <a
              href="/zh-CN/admin/users"
              className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
            >
              用户列表
            </a>
            <a
              href="/zh-CN/admin/operations/referrals"
              className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
            >
              推荐管理
            </a>
            <a
              href="/zh-CN/admin/operations/credits"
              className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
            >
              积分管理
            </a>
            <a
              href="/zh-CN/admin/operations/fraud"
              className="inline-flex items-center rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
            >
              风控管理
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
