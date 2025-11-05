import { resolve } from 'path';
import { config } from 'dotenv';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { websiteConfig } from '../src/config/website';

console.log('\n🔍 检查积分包配置...\n');

const packages = websiteConfig.credits.packages;

console.log('积分功能是否启用:', websiteConfig.credits.enableCredits);
console.log(
  '免费用户是否可购买:',
  websiteConfig.credits.enablePackagesForFreePlan
);
console.log('\n积分包配置:\n');

Object.entries(packages).forEach(([key, pkg]) => {
  console.log(`📦 ${key}:`);
  console.log(`   ID: ${pkg.id}`);
  console.log(`   积分数: ${pkg.amount}`);
  console.log(`   价格: $${pkg.price.amount / 100}`);
  console.log(`   Price ID: ${pkg.price.priceId}`);
  console.log(`   是否流行: ${pkg.popular}`);
  console.log(`   有效期: ${pkg.expireDays}天`);
  console.log('');
});

// 检查环境变量
console.log('\n🔐 Stripe 配置:\n');
console.log(
  'STRIPE_SECRET_KEY:',
  process.env.STRIPE_SECRET_KEY ? '✓ 已配置' : '✗ 未配置'
);
console.log(
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:',
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✓ 已配置' : '✗ 未配置'
);

console.log('\n📋 Price IDs:\n');
console.log('Basic:', process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC);
console.log('Standard:', process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD);
console.log('Premium:', process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM);
console.log(
  'Enterprise:',
  process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE
);

console.log('\n✅ 检查完成\n');
