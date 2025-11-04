import { websiteConfig } from '@/config/website';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * GET /api/stripe/prices
 * 从 Stripe 获取所有积分包的实际价格
 */
export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const packages = websiteConfig.credits.packages;
    
    // 如果没有配置 Stripe,返回配置文件中的默认价格
    if (!stripeSecretKey) {
      const prices: Record<string, { amount: number; currency: string }> = {};
      
      for (const [, pkg] of Object.entries(packages)) {
        prices[pkg.id] = {
          amount: pkg.price.amount,
          currency: pkg.price.currency,
        };
      }
      
      return NextResponse.json({ prices });
    }

    const stripe = new Stripe(stripeSecretKey);
    const prices: Record<string, { amount: number; currency: string }> = {};

    // 遍历所有积分包,获取 Stripe 价格
    for (const [key, pkg] of Object.entries(packages)) {
      const priceId = pkg.price.priceId;
      
      if (!priceId) {
        console.warn(`Price ID not found for package: ${key}`);
        continue;
      }

      try {
        // 从 Stripe 获取价格
        const price = await stripe.prices.retrieve(priceId);
        
        if (price.unit_amount && price.currency) {
          prices[pkg.id] = {
            amount: price.unit_amount, // 单位:分/美分
            currency: price.currency.toUpperCase(),
          };
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${key}:`, error);
        // 获取失败时使用配置文件中的默认值
        prices[pkg.id] = {
          amount: pkg.price.amount,
          currency: pkg.price.currency,
        };
      }
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Failed to fetch Stripe prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
