'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { websiteConfig } from '@/config/website';
import { cn } from '@/lib/utils';
import {
  Check,
  Coins,
  CreditCard,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface RechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCredits?: number;
  requiredCredits?: number;
  reason?: string;
}

export function RechargeModal({
  open,
  onOpenChange,
  currentCredits = 0,
  requiredCredits,
  reason,
}: RechargeModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  const packages = Object.entries(websiteConfig.credits.packages).map(
    ([key, pkg]) => ({
      id: key,
      ...pkg,
      savings:
        key === 'standard'
          ? '省10%'
          : key === 'premium'
            ? '省20%'
            : key === 'enterprise'
              ? '省30%'
              : undefined,
    })
  );

  // 根据所需积分推荐合适的套餐
  const getRecommendedPackage = () => {
    if (!requiredCredits) return 'basic';
    const deficit = requiredCredits - currentCredits;
    if (deficit <= 100) return 'basic';
    if (deficit <= 200) return 'standard';
    if (deficit <= 500) return 'premium';
    return 'enterprise';
  };

  const recommendedId = getRecommendedPackage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-yellow-500" />
            积分充值
          </DialogTitle>
          <DialogDescription className="text-base">
            {reason || '选择合适的积分包，畅享平台所有服务'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 当前积分状态 */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  当前积分余额
                </p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {currentCredits}
                </p>
              </div>
              {requiredCredits && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">所需积分</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {requiredCredits}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    还差 {requiredCredits - currentCredits} 积分
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* 积分包选择 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">选择积分包</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {packages.map((pkg) => {
                const isRecommended = pkg.id === recommendedId;
                const isSelected = selectedPackage === pkg.id;
                const isPopular = pkg.popular;

                return (
                  <Card
                    key={pkg.id}
                    className={cn(
                      'relative p-6 cursor-pointer transition-all hover:shadow-lg',
                      isSelected &&
                        'border-2 border-blue-500 dark:border-blue-400 shadow-md',
                      isRecommended &&
                        'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20'
                    )}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {/* 标签 */}
                    <div className="absolute -top-3 right-4 flex gap-2">
                      {isPopular && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                          <Zap className="h-3 w-3 mr-1" />
                          热门
                        </Badge>
                      )}
                      {isRecommended && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          推荐
                        </Badge>
                      )}
                    </div>

                    {/* 选中标记 */}
                    {isSelected && (
                      <div className="absolute top-4 left-4">
                        <div className="rounded-full bg-blue-500 p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 mt-2">
                      {/* 积分数量 */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          获得积分
                        </p>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                          {pkg.amount}
                        </p>
                        {pkg.savings && (
                          <Badge
                            variant="secondary"
                            className="mt-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                          >
                            {pkg.savings}
                          </Badge>
                        )}
                      </div>

                      {/* 价格 */}
                      <div className="text-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-1">
                          支付金额
                        </p>
                        <p className="text-3xl font-bold">
                          ${(pkg.price.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ {(pkg.price.amount / pkg.amount).toFixed(2)}{' '}
                          美分/积分
                        </p>
                      </div>

                      {/* 有效期 */}
                      <div className="text-center text-xs text-muted-foreground">
                        有效期: {pkg.expireDays} 天
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 使用说明 */}
          <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              积分用途
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 pl-4">
              <li>• AI智能对话：5积分/条消息</li>
              <li>• 15分钟畅聊会话：15积分（1积分/分钟）</li>
              <li>• 八字排盘：10积分</li>
              <li>• 玄空风水分析：20积分</li>
              <li>• 深度解读报告：30积分</li>
              <li>• PDF报告导出：5积分</li>
            </ul>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              暂不充值
            </Button>
            <Button
              className="flex-1"
              size="lg"
              disabled={!selectedPackage}
              asChild={!!selectedPackage}
            >
              {selectedPackage ? (
                <Link href={`/settings/credits?package=${selectedPackage}`}>
                  <CreditCard className="mr-2 h-5 w-5" />
                  立即充值
                </Link>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  请选择积分包
                </>
              )}
            </Button>
          </div>

          {/* 安全提示 */}
          <p className="text-xs text-center text-muted-foreground">
            🔒 支付由 Stripe 提供安全保障 | 支持信用卡、Apple Pay、Google Pay
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
