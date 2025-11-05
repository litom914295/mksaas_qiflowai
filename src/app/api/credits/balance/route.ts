import { getDb } from '@/db';
import { creditTransaction, user as userTable } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, eq, gte, sum } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Get user credits balance
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    console.log('[Credits Balance API] Processing request');

    // Authentication check - using auth.api.getSession
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!session || !userId) {
      console.warn('[Credits Balance API] Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Credits Balance API] Fetching balance for user:', userId);

    const db = await getDb();

    // Get user's current credits balance from user table
    const userRecord = await db
      .select({
        credits: userTable.credits,
        email: userTable.email,
        name: userTable.name,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      console.error('[Credits Balance API] User not found:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const currentCredits = userRecord[0].credits || 0;

    // Calculate total earned credits (all positive transactions)
    const earnedResult = await db
      .select({
        total: sum(creditTransaction.amount),
      })
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          gte(creditTransaction.amount, 0)
        )
      );

    const totalEarned = Number(earnedResult[0]?.total || 0);

    // Calculate total spent credits (all negative transactions)
    const spentResult = await db
      .select({
        total: sum(creditTransaction.amount),
      })
      .from(creditTransaction)
      .where(and(eq(creditTransaction.userId, userId)));

    const totalSpent =
      Math.abs(Number(spentResult[0]?.total || 0)) - totalEarned;

    console.log('[Credits Balance API] Balance retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        currentBalance: currentCredits,
        totalEarned: totalEarned,
        totalSpent: totalSpent,
        user: {
          name: userRecord[0].name,
          email: userRecord[0].email,
        },
      },
    });
  } catch (error) {
    console.error('[Credits Balance API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch credits balance',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
