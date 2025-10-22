'use server';

import { getDb } from '@/db';
import { creditTransaction } from '@/db/schema';
import type { User } from '@/lib/auth-types';
import { CREDITS_EXPIRATION_DAYS } from '@/lib/constants';
import { userActionClient } from '@/lib/safe-action';
import { addDays } from 'date-fns';
import { and, eq, gt, gte, isNotNull, lte, sum } from 'drizzle-orm';

/**
 * Get credit statistics for a user
 */
export const getCreditStatsAction = userActionClient.action(async ({ ctx }) => {
  try {
    const currentUser = (ctx as { user: User }).user;
    const userId = currentUser.id;

    const db = await getDb();
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    // Get credits expiring in the next 30 days
    const expirationDaysFromNow = addDays(now, CREDITS_EXPIRATION_DAYS);

    // Get total credits expiring in the next 30 days
    const expiringCreditsResult = await db
      .select({
        totalAmount: sum(creditTransaction.remainingAmount),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          isNotNull(creditTransaction.expirationDate),
          isNotNull(creditTransaction.remainingAmount),
          gt(creditTransaction.remainingAmount, 0),
          lte(creditTransaction.expirationDate, expirationDaysFromNow),
          gte(creditTransaction.expirationDate, now)
        )
      );

    const totalExpiringCredits =
      Number(expiringCreditsResult[0]?.totalAmount) || 0;

    // Get total credits used (negative amounts)
    const usedCreditsResult = await db
      .select({
        totalAmount: sum(creditTransaction.amount),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'used')
        )
      );

    const totalCreditsUsed = Math.abs(
      Number(usedCreditsResult[0]?.totalAmount) || 0
    );

    // Get total credits earned (positive amounts)
    const earnedCreditsResult = await db
      .select({
        totalAmount: sum(creditTransaction.amount),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'earned')
        )
      );

    const totalCreditsEarned = Number(earnedCreditsResult[0]?.totalAmount) || 0;

    // Get today's usage (negative amounts from today)
    const todayUsageResult = await db
      .select({
        totalAmount: sum(creditTransaction.amount),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, 'used'),
          gte(creditTransaction.createdAt, startOfToday)
        )
      );

    const todayUsage = Math.abs(Number(todayUsageResult[0]?.totalAmount) || 0);

    return {
      success: true,
      data: {
        expiringCredits: {
          amount: totalExpiringCredits,
        },
        totalCreditsUsed,
        totalCreditsEarned,
        todayUsage,
      },
    };
  } catch (error) {
    console.error('get credit stats error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch credit statistics',
    };
  }
});
