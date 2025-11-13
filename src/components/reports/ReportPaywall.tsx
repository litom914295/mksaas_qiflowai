/**
 * 报告付费墙组件
 *
 * 智能转化引导，提升从免费到付费的转化率
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Shield, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useState } from 'react';

/**
 * Paywall配置
 */
export interface PaywallConfig {
  // 定价（人民币）
  price: number;
  originalPrice?: number; // 原价（用于显示折扣）

  // 限时优惠
  discountEndsAt?: Date;

  // 突出卖点（最多4个）
  highlights: string[];

  // 用户历史行为
  userContext?: {
    hasViewedBefore?: boolean;
    viewCount?: number;
    lastViewedAt?: Date;
  };

  // A/B测试变体
  variant?: 'default' | 'urgency' | 'value' | 'social_proof';
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: PaywallConfig = {
  price: 9.9,
  originalPrice: 29.9,
  highlights: [
    '深度人宅合一分析',
    '专属吉位与化解方案',
    '可下载PDF完整报告',
    '专业级命理解读',
  ],
  variant: 'default',
};

/**
 * Paywall组件
 */
export function ReportPaywall({
  config = DEFAULT_CONFIG,
  onUnlock,
  onDismiss,
}: {
  config?: PaywallConfig;
  onUnlock: () => void;
  onDismiss?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlock = async () => {
    setIsLoading(true);
    try {
      await onUnlock();
    } finally {
      setIsLoading(false);
    }
  };

  // 计算折扣百分比
  const discount = config.originalPrice
    ? Math.round((1 - config.price / config.originalPrice) * 100)
    : 0;

  // 根据变体渲染不同风格
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative"
      >
        {/* 背景模糊效果 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background backdrop-blur-sm" />

        {/* 主内容 */}
        <Card className="relative border-2 border-primary/20 shadow-xl">
          <CardContent className="p-8 space-y-6">
            {/* 标题区 */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>

              <h3 className="text-2xl font-bold">
                {config.variant === 'urgency' && '限时优惠：'}
                解锁完整精华报告
              </h3>

              <p className="text-muted-foreground">
                {getSubtitle(config.variant)}
              </p>
            </div>

            {/* 价格区 */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-3">
                {config.originalPrice && (
                  <span className="text-2xl text-muted-foreground line-through">
                    ¥{config.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-5xl font-bold text-primary">
                  ¥{config.price.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <Badge variant="destructive" className="text-sm">
                  立省{discount}% 💰
                </Badge>
              )}

              {config.discountEndsAt && (
                <p className="text-sm text-muted-foreground">
                  优惠截止至 {formatDate(config.discountEndsAt)}
                </p>
              )}
            </div>

            {/* 卖点列表 */}
            <div className="space-y-3">
              {config.highlights.map((highlight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5"
                >
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{highlight}</span>
                </motion.div>
              ))}
            </div>

            {/* 社会证明（针对social_proof变体） */}
            {config.variant === 'social_proof' && (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  已有 <strong className="text-foreground">12,847</strong>{' '}
                  人解锁精华报告
                </p>
              </div>
            )}

            {/* 安全保障 */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>支付安全 | 隐私保护 | 7天无理由退款</span>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full text-lg h-14"
                onClick={handleUnlock}
                disabled={isLoading}
              >
                <Zap className="w-5 h-5 mr-2" />
                {isLoading ? '正在处理...' : '立即解锁完整报告'}
              </Button>

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={onDismiss}
                >
                  暂不需要
                </Button>
              )}
            </div>

            {/* 老用户提示 */}
            {config.userContext?.hasViewedBefore && (
              <div className="text-center text-xs text-muted-foreground">
                <p>
                  欢迎回来！这是您第 {config.userContext.viewCount} 次查看此报告
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * 根据变体获取副标题
 */
function getSubtitle(variant?: string): string {
  switch (variant) {
    case 'urgency':
      return '限时特惠即将结束，抓住最后机会';
    case 'value':
      return '深度分析 + 专业解读，仅需一杯咖啡的价格';
    case 'social_proof':
      return '超过万人信赖的专业命理报告';
    default:
      return '获取完整的命理和风水深度分析';
  }
}

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
