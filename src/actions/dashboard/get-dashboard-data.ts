'use server';

import { getDb } from '@/db';
import { creditTransaction, userCredit } from '@/db/schema';
import { getSession } from '@/lib/server';
import { and, count, eq, gte, sql, sum } from 'drizzle-orm';

type DashboardData = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    credits: number;
  };
  stats: {
    totalAnalysis: number;
    remainingAnalysis: number;
    usedThisMonth: number;
    growthRate: number;
  };
  activities: {
    dailySignIn: {
      isSigned: boolean;
      streak: number;
      nextReward: number;
    };
    newbieMissions: {
      completed: number;
      total: number;
      progress: number;
    };
  };
};

export async function getDashboardDataAction() {
  const session = await getSession();
  const user = session?.user as any;
  if (!user) {
    return { error: 'Unauthorized', data: null };
  }

  try {
    const db = await getDb();

    const [userCredits] = await db
      .select({ balance: userCredit.currentCredits })
      .from(userCredit)
      .where(eq(userCredit.userId, user.id))
      .limit(1);

    const balance = userCredits?.balance || 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthlyUsage] = await db
      .select({ count: count(), totalCost: sum(creditTransaction.amount) })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, user.id),
          gte(creditTransaction.createdAt, startOfMonth),
          sql`${creditTransaction.amount} < 0`
        )
      );

    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const [lastMonthUsage] = await db
      .select({ count: count() })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, user.id),
          gte(creditTransaction.createdAt, startOfLastMonth),
          sql`${creditTransaction.createdAt} < ${startOfMonth}`,
          sql`${creditTransaction.amount} < 0`
        )
      );

    const currentMonthCount = Number(monthlyUsage?.count || 0);
    const lastMonthCount = Number(lastMonthUsage?.count || 0);
    const growthRate =
      lastMonthCount > 0
        ? Math.round(
            ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100
          )
        : 0;

    const remainingAnalysis = Math.floor(balance / 20);

    const dashboardData: DashboardData = {
      user: {
        id: user.id,
        name: user.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: (user as any).avatar,
        credits: balance,
      },
      stats: {
        totalAnalysis: currentMonthCount,
        remainingAnalysis,
        usedThisMonth: Math.abs(Number(monthlyUsage?.totalCost || 0)),
        growthRate,
      },
      activities: {
        dailySignIn: { isSigned: false, streak: 0, nextReward: 5 },
        newbieMissions: { completed: 0, total: 10, progress: 0 },
      },
    };

    return { success: true, data: dashboardData, error: null };
  } catch (err) {
    console.error('[getDashboardDataAction]', err);
    return { error: 'Failed to fetch dashboard data', data: null };
  }
}
