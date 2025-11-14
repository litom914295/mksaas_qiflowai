/**
 * 创建Stripe Checkout Session用于报告解锁
 */

import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

/**
 * POST /api/payments/create-checkout
 *
 * 创建Stripe Checkout Session
 */
export async function POST(req: NextRequest) {
  try {
    // 验证用户登录
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // 解析请求体
    const body = await req.json();
    const { reportId, priceId, successUrl, cancelUrl } = body;

    if (!reportId || !priceId || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 创建或获取Stripe客户
    let customerId: string | undefined;
    if (userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId,
          },
        });
        customerId = customer.id;
      }
    }

    // 创建Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: 'report_unlock',
        reportId,
        userId,
      },
      // 在PaymentIntent中也添加metadata
      payment_intent_data: {
        metadata: {
          type: 'report_unlock',
          reportId,
          userId,
        },
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('[Create Checkout] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
