import { auth } from '@/lib/auth';
import { getDb } from '@/db';
import { user as userTable, payment } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * Get user subscription status
 * Requires authentication
 */
export async function GET(request: Request) {
  try {
    console.log('[Subscription Status API] Processing request');

    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!session || !userId) {
      console.warn('[Subscription Status API] Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Subscription Status API] Fetching subscription for user:', userId);

    const db = await getDb();

    // Get user info
    const userRecord = await db
      .select({
        email: userTable.email,
        name: userTable.name,
        customerId: userTable.customerId,
      })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      console.error('[Subscription Status API] User not found:', userId);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get active subscriptions/payments
    const subscriptions = await db
      .select({
        id: payment.id,
        subscriptionId: payment.subscriptionId,
        priceId: payment.priceId,
        type: payment.type,
        interval: payment.interval,
        status: payment.status,
        periodStart: payment.periodStart,
        periodEnd: payment.periodEnd,
        cancelAtPeriodEnd: payment.cancelAtPeriodEnd,
        trialStart: payment.trialStart,
        trialEnd: payment.trialEnd,
        createdAt: payment.createdAt,
      })
      .from(payment)
      .where(
        and(
          eq(payment.userId, userId),
          // Only get active or trialing subscriptions
        )
      )
      .orderBy(desc(payment.createdAt))
      .limit(10);

    // Determine current plan
    let currentPlan = 'free';
    let subscriptionStatus = 'none';
    let activeSubscription = null;

    // Find active subscription
    for (const sub of subscriptions) {
      if (sub.status === 'active' || sub.status === 'trialing') {
        activeSubscription = sub;
        subscriptionStatus = sub.status;
        
        // Determine plan type based on priceId or type
        if (sub.type === 'ONE_TIME') {
          currentPlan = 'lifetime';
        } else if (sub.interval === 'MONTH') {
          currentPlan = 'pro_monthly';
        } else if (sub.interval === 'YEAR') {
          currentPlan = 'pro_yearly';
        }
        break;
      }
    }

    console.log('[Subscription Status API] Status retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        userId,
        currentPlan,
        subscriptionStatus,
        customerId: userRecord[0].customerId,
        user: {
          name: userRecord[0].name,
          email: userRecord[0].email,
        },
        activeSubscription: activeSubscription ? {
          id: activeSubscription.id,
          subscriptionId: activeSubscription.subscriptionId,
          priceId: activeSubscription.priceId,
          type: activeSubscription.type,
          interval: activeSubscription.interval,
          status: activeSubscription.status,
          currentPeriodStart: activeSubscription.periodStart,
          currentPeriodEnd: activeSubscription.periodEnd,
          cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          trialStart: activeSubscription.trialStart,
          trialEnd: activeSubscription.trialEnd,
        } : null,
        allSubscriptions: subscriptions.map(sub => ({
          id: sub.id,
          status: sub.status,
          type: sub.type,
          interval: sub.interval,
          createdAt: sub.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('[Subscription Status API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription status',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
