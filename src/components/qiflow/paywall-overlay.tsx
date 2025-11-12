'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Coins, CreditCard, Lock, Sparkles } from 'lucide-react';
import { useState } from 'react';

type PaywallOverlayProps = {
  /**
   * 报告类型
   */
  reportType: 'basic' | 'essential';

  /**
   * 用户当前积分余额
   */
  userCredits: number;

  /**
   * 报告价格 (积分)
   */
  price: number;

  /**
   * 点击购买按钮的回调
   */
  onPurchase: () => void;

  /**
   * 点击充值按钮的回调
   */
  onRecharge?: () => void;

  /**
   * 是否正在处理购买
   */
  isPurchasing?: boolean;

  /**
   * 自定义样式类名
   */
  className?: string;
};

const REPORT_TITLES = {
  basic: '基础报告',
  essential: '精华报告',
};

const REPORT_FEATURES = {
  basic: ['八字命盘解析', '五行分析', '基础运势解读'],
  essential: [
    '深度八字命盘',
    '三大主题故事化解读',
    'AI 个性化建议',
    '终身有效查看',
  ],
};

export function PaywallOverlay({
  reportType,
  userCredits,
  price,
  onPurchase,
  onRecharge,
  isPurchasing = false,
  className,
}: PaywallOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);

  const hasEnoughCredits = userCredits >= price;
  const shortfall = hasEnoughCredits ? 0 : price - userCredits;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'relative flex items-center justify-center bg-gradient-to-br from-purple-50/90 via-pink-50/90 to-orange-50/90 backdrop-blur-sm',
        className
      )}
    >
      <Card
        className="w-full max-w-md shadow-2xl border-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="text-center space-y-2">
          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>

          <CardTitle className="text-2xl font-bold">
            解锁 {REPORT_TITLES[reportType]}
          </CardTitle>

          <CardDescription className="text-base">
            深度 AI 解析，专属您的命理指南
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 报告特性列表 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>报告包含：</span>
            </div>
            <ul className="space-y-1.5">
              {REPORT_FEATURES[reportType].map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* 价格信息 */}
          <div className="rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">价格</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-900">
                  {price}
                </span>
                <span className="text-sm text-purple-700">积分</span>
              </div>
            </div>
          </div>

          {/* 余额状态 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">您的余额</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={hasEnoughCredits ? 'default' : 'destructive'}
                className="font-mono"
              >
                {userCredits} 积分
              </Badge>
              {!hasEnoughCredits && (
                <span className="text-destructive text-xs">
                  (还需 {shortfall} 积分)
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {hasEnoughCredits ? (
            <Button
              onClick={onPurchase}
              disabled={isPurchasing}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {isPurchasing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  生成中...
                </>
              ) : (
                <>
                  <Coins className="mr-2 h-5 w-5" />
                  使用 {price} 积分购买
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={onRecharge}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                size="lg"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                充值积分
              </Button>
              <Button variant="outline" onClick={onRecharge} className="w-full">
                查看充值方案
              </Button>
            </>
          )}
        </CardFooter>

        {/* 底部提示 */}
        <div className="px-6 pb-4 text-center text-xs text-muted-foreground">
          <p>购买后终身有效 · AI 深度解析 · 专业可靠</p>
        </div>
      </Card>
    </motion.div>
  );
}
