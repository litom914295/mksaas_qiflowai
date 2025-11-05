import { getDb } from '@/db';
import { creditTransaction } from '@/db/schema';
import { auth } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Get user credit transactions history
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    console.log('[Credits Transactions API] Processing request');

    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!session || !userId) {
      console.warn('[Credits Transactions API] Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters for pagination
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      Number.parseInt(url.searchParams.get('limit') || '50'),
      100
    ); // Max 100 per page
    const offset = (page - 1) * limit;

    console.log(
      '[Credits Transactions API] Fetching transactions for user:',
      userId,
      'page:',
      page,
      'limit:',
      limit
    );

    const db = await getDb();

    // Get transactions with pagination
    const transactions = await db
      .select({
        id: creditTransaction.id,
        amount: creditTransaction.amount,
        type: creditTransaction.type,
        description: creditTransaction.description,
        metadata: creditTransaction.metadata,
        createdAt: creditTransaction.createdAt,
      })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId))
      .orderBy(desc(creditTransaction.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ count: creditTransaction.id })
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId));

    const totalCount = totalResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    console.log(
      '[Credits Transactions API] Retrieved',
      transactions.length,
      'transactions'
    );

    return NextResponse.json({
      success: true,
      data: {
        transactions: transactions.map((tx) => ({
          id: tx.id,
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          metadata: tx.metadata,
          createdAt: tx.createdAt,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    console.error('[Credits Transactions API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
