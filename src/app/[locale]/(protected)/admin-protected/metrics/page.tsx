import { getDb } from '@/db';
import {
  creditTransaction,
  referralRelationships,
  shareRecords,
  user,
} from '@/db/schema';
import { getSession } from '@/lib/server';
import { and, count, desc, eq, gte } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

function isAdmin(role?: string | null) {
  return role === 'admin';
}

export default async function AdminMetricsPage() {
  const session = await getSession();
  const currentUser = session?.user;
  if (!currentUser?.id || !isAdmin(currentUser.role as any)) {
    redirect('/404');
  }

  const db = await getDb();
  const now = new Date();
  const day7Ago = new Date(now);
  day7Ago.setDate(now.getDate() - 7);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  // K 因子（近似）：人均直接推荐数（基于 user_referral_stats 或 referral_relationships）
  const referralRows = await db
    .select({
      id: referralRelationships.id,
      referrerId: referralRelationships.referrerId,
    })
    .from(referralRelationships);
  const inviterMap = new Map<string, number>();
  referralRows.forEach((r) =>
    inviterMap.set(r.referrerId, (inviterMap.get(r.referrerId) || 0) + 1)
  );
  const inviters = Array.from(inviterMap.values());
  const K =
    inviters.length > 0
      ? inviters.reduce((a, b) => a + b, 0) / inviters.length
      : 0;

  // 激活率：已发放奖励的推荐关系 / 总推荐关系
  const totalReferral = referralRows.length;
  const rewarded = await db
    .select({ c: count() })
    .from(referralRelationships)
    .where(eq(referralRelationships.rewardGranted, true));
  const activationRate =
    totalReferral > 0
      ? Number((rewarded as any)[0]?.c || 0) / totalReferral
      : 0;

  // 7日留存：近7日内任一天签到的去重用户 / 近7日内任一天有行为（签到/交易）的去重用户（简化）
  const dailySigninUsers = await db
    .selectDistinct({ userId: creditTransaction.userId })
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.type, 'DAILY_SIGNIN'),
        gte(creditTransaction.createdAt as any, day7Ago as any)
      )
    );
  const activeUsers7d = await db
    .selectDistinct({ userId: creditTransaction.userId })
    .from(creditTransaction)
    .where(gte(creditTransaction.createdAt as any, day7Ago as any));
  const retention7d =
    (activeUsers7d.length || 0) > 0
      ? dailySigninUsers.length / activeUsers7d.length
      : 0;

  // 今日分享有效转化数（奖励已发放）
  const todayShareRewarded = await db
    .select({ c: count() })
    .from(shareRecords)
    .where(
      and(
        eq(shareRecords.rewardGranted, true),
        gte(shareRecords.createdAt as any, startOfDay as any)
      )
    );

  // 今日拦截数（BLACKLISTED）
  const { fraudEvents } = await import('@/db/schema');
  const todayBlocked = await db
    .select({ c: count() })
    .from(fraudEvents)
    .where(gte(fraudEvents.createdAt as any, startOfDay as any));

  const formatPercent = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">增长 KPI（最小看板）</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">
            K 因子（人均直接推荐数）
          </div>
          <div className="text-3xl font-semibold mt-2">{K.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">
            激活率（推荐已发放奖励/总数）
          </div>
          <div className="text-3xl font-semibold mt-2">
            {formatPercent(activationRate)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">
            7日留存（签到近似）
          </div>
          <div className="text-3xl font-semibold mt-2">
            {formatPercent(retention7d)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">
            今日分享有效转化（发奖计数）
          </div>
          <div className="text-3xl font-semibold mt-2">
            {Number((todayShareRewarded as any)[0]?.c || 0)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">
            今日分享拦截（黑名单）
          </div>
          <div className="text-3xl font-semibold mt-2">
            {Number((todayBlocked as any)[0]?.c || 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
