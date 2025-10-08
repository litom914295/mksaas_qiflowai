'use client';

// A/B测试配置和管理系统
import { cookies } from 'next/headers';
import { useState, useEffect } from 'react';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 权重，用于分配流量比例
  config: any;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  active: boolean;
  startDate?: Date;
  endDate?: Date;
}

// A/B测试配置
export const AB_TESTS: Record<string, ABTest> = {
  pricing: {
    id: 'pricing',
    name: '定价策略测试',
    description: '测试不同价格点的转化率',
    active: true,
    variants: [
      {
        id: 'control',
        name: '原价299现价99',
        weight: 25,
        config: {
          originalPrice: 299,
          currentPrice: 99,
          discount: 67,
          discountText: '限时67折'
        }
      },
      {
        id: 'variant_a',
        name: '原价199现价79',
        weight: 25,
        config: {
          originalPrice: 199,
          currentPrice: 79,
          discount: 60,
          discountText: '限时6折'
        }
      },
      {
        id: 'variant_b',
        name: '原价399现价99',
        weight: 25,
        config: {
          originalPrice: 399,
          currentPrice: 99,
          discount: 75,
          discountText: '限时75折'
        }
      },
      {
        id: 'variant_c',
        name: '月付订阅19.9',
        weight: 25,
        config: {
          originalPrice: 39.9,
          currentPrice: 19.9,
          discount: 50,
          discountText: '首月半价',
          isSubscription: true
        }
      }
    ]
  },
  cta_text: {
    id: 'cta_text',
    name: 'CTA文案测试',
    description: '测试不同行动号召文案的效果',
    active: true,
    variants: [
      {
        id: 'control',
        name: '立即免费分析',
        weight: 25,
        config: {
          mainCTA: '立即免费分析',
          subCTA: '3分钟看透命理运势',
          urgencyText: '限时优惠仅剩'
        }
      },
      {
        id: 'variant_a',
        name: '马上测算',
        weight: 25,
        config: {
          mainCTA: '马上测算我的运势',
          subCTA: 'AI大师为您解惑',
          urgencyText: '今日特惠倒计时'
        }
      },
      {
        id: 'variant_b',
        name: '开始分析',
        weight: 25,
        config: {
          mainCTA: '开始AI智能分析',
          subCTA: '揭开您的命运密码',
          urgencyText: '限时福利即将结束'
        }
      },
      {
        id: 'variant_c',
        name: '免费体验',
        weight: 25,
        config: {
          mainCTA: '免费体验专业分析',
          subCTA: '改运从了解自己开始',
          urgencyText: '优惠名额仅剩'
        }
      }
    ]
  },
  hero_style: {
    id: 'hero_style',
    name: '首页风格测试',
    description: '测试不同视觉风格的吸引力',
    active: true,
    variants: [
      {
        id: 'control',
        name: '紫粉渐变',
        weight: 33,
        config: {
          gradient: 'from-purple-600 via-pink-600 to-red-600',
          bgStyle: 'gradient',
          animation: 'pulse'
        }
      },
      {
        id: 'variant_a',
        name: '传统中国风',
        weight: 33,
        config: {
          gradient: 'from-red-700 via-yellow-600 to-red-700',
          bgStyle: 'traditional',
          animation: 'float',
          pattern: 'chinese'
        }
      },
      {
        id: 'variant_b',
        name: '现代科技风',
        weight: 34,
        config: {
          gradient: 'from-blue-600 via-cyan-500 to-purple-600',
          bgStyle: 'tech',
          animation: 'glow',
          pattern: 'circuit'
        }
      }
    ]
  }
};

// 获取用户的测试变体
export async function getUserVariant(testId: string): Promise<ABTestVariant | null> {
  const test = AB_TESTS[testId];
  if (!test || !test.active) return null;

  const cookieStore = cookies();
  const variantCookie = cookieStore.get(`ab_${testId}`);
  
  if (variantCookie) {
    // 如果用户已分配变体，返回该变体
    const variant = test.variants.find(v => v.id === variantCookie.value);
    if (variant) return variant;
  }

  // 分配新变体
  const variant = selectVariant(test.variants);
  
  // 保存到cookie（30天）
  cookieStore.set(`ab_${testId}`, variant.id, {
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    sameSite: 'strict'
  });

  return variant;
}

// 根据权重随机选择变体
function selectVariant(variants: ABTestVariant[]): ABTestVariant {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) return variant;
  }
  
  return variants[0]; // fallback
}

// 记录A/B测试事件
export async function trackABEvent(
  testId: string,
  variantId: string,
  event: 'view' | 'click' | 'conversion',
  metadata?: any
) {
  // 这里可以集成到您的分析系统
  // 暂时先记录到控制台
  console.log('A/B Test Event:', {
    testId,
    variantId,
    event,
    metadata,
    timestamp: new Date().toISOString()
  });

  // TODO: 发送到分析后端
  // await fetch('/api/analytics/ab-test', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     testId,
  //     variantId,
  //     event,
  //     metadata
  //   })
  // });
}

// React Hook for A/B Testing
export function useABTest(testId: string) {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserVariant(testId).then(v => {
      setVariant(v);
      setLoading(false);
      if (v) {
        trackABEvent(testId, v.id, 'view');
      }
    });
  }, [testId]);

  const trackClick = (metadata?: any) => {
    if (variant) {
      trackABEvent(testId, variant.id, 'click', metadata);
    }
  };

  const trackConversion = (metadata?: any) => {
    if (variant) {
      trackABEvent(testId, variant.id, 'conversion', metadata);
    }
  };

  return {
    variant,
    loading,
    config: variant?.config || {},
    trackClick,
    trackConversion
  };
}