import { getDb } from '@/db';
import { creditTransaction } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, asc, count, desc, eq, like } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Get user credit transactions history
 * Supports pagination, search, filtering, and sorting
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
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = Math.max(Number.parseInt(url.searchParams.get('page') || '1'), 1);
    const pageSize = Math.min(
      Math.max(Number.parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10'), 1),
      100
    ); // Max 100 per page
    const offset = (page - 1) * pageSize;
    const search = url.searchParams.get('search') || '';
    const type = url.searchParams.get('type') || '';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';

    console.log(
      '[Credits Transactions API] Fetching transactions for user:',
      userId,
      'page:',
      page,
      'pageSize:',
      pageSize,
      'search:',
      search,
      'type:',
      type
    );

    const db = await getDb();

    // Build where conditions
    const conditions = [eq(creditTransaction.userId, userId)];
    
    // Search filter (description)
    if (search) {
      conditions.push(like(creditTransaction.description, `%${search}%`));
    }
    
    // Type filter
    if (type && type !== 'all') {
      conditions.push(eq(creditTransaction.type, type));
    }
    
    const whereClause = and(...conditions);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(creditTransaction)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize);

    // Determine sort order
    const orderByClause = sortOrder === 'desc'
      ? desc(creditTransaction[sortBy as 'createdAt' | 'amount'])
      : asc(creditTransaction[sortBy as 'createdAt' | 'amount']);

    // Get transactions with filters, sorting, and pagination
    const transactions = await db
      .select({
        id: creditTransaction.id,
        userId: creditTransaction.userId,
        amount: creditTransaction.amount,
        type: creditTransaction.type,
        description: creditTransaction.description,
        metadata: creditTransaction.metadata,
        createdAt: creditTransaction.createdAt,
      })
      .from(creditTransaction)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    console.log(
      '[Credits Transactions API] Retrieved',
      transactions.length,
      'transactions of',
      total
    );

    // Return in format expected by EnhancedTransactionHistory component
    return NextResponse.json({
      items: transactions,
      total,
      page,
      pageSize,
      totalPages,
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
