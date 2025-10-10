'use client';

import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { authClient } from '@/lib/auth-client';
import { AlertCircle, Coins, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * 导航栏积分余额显示组件
 *
 * 功能：
 * 1. 实时显示用户积分余额
 * 2. 积分低于50时显示警告
 * 3. 点击跳转到积分管理页面
 * 4. 快捷充值按钮
 */
export function CreditsNavBadge() {
  const { data: session, isPending } = authClient.useSession();
  const [credits, setCredits] = useState(0);
  const [isLow, setIsLow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 获取积分余额
  useEffect(() => {
    if (session?.user && !isPending) {
      setIsLoading(true);
      getCreditBalanceAction()
        .then((result) => {
          if (result.data?.success && result.data.credits !== undefined) {
            const balance = result.data.credits;
            setCredits(balance);
            setIsLow(balance < 50);
          }
        })
        .catch((error) => {
          console.error('获取积分余额失败:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session, isPending]);

  // 未登录不显示
  if (!session || isPending) {
    return null;
  }

  // 加载中显示骨架
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* 积分余额显示 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/settings/credits">
              <Badge
                variant={isLow ? 'destructive' : 'secondary'}
                className={`
                  flex items-center gap-1.5 cursor-pointer transition-all
                  hover:opacity-80 hover:scale-105
                  ${isLow ? 'animate-pulse' : ''}
                `}
              >
                {isLow && <AlertCircle className="w-3 h-3" />}
                <Coins className="w-3.5 h-3.5" />
                <span className="font-semibold">{credits}</span>
              </Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-semibold">
                {isLow ? '⚠️ 积分余额不足' : '当前积分余额'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                八字分析：10积分
                <br />
                完整分析：30积分
              </p>
              {isLow && (
                <p className="text-xs text-red-500 mt-1">
                  余额低于50，建议充值
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 充值按钮 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={isLow ? 'default' : 'outline'}
              className={`
                gap-1.5 transition-all
                ${isLow ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : ''}
              `}
              asChild
            >
              <Link href="/settings/credits">
                <Zap className="w-3.5 h-3.5" />
                充值
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">点击充值获取更多积分</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

/**
 * 简化版积分显示（用于移动端或紧凑布局）
 */
export function CreditsNavBadgeCompact() {
  const { data: session, isPending } = authClient.useSession();
  const [credits, setCredits] = useState(0);
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) {
      getCreditBalanceAction()
        .then((result) => {
          if (result.data?.success && result.data.credits !== undefined) {
            const balance = result.data.credits;
            setCredits(balance);
            setIsLow(balance < 50);
          }
        })
        .catch((error) => {
          console.error('获取积分余额失败:', error);
        });
    }
  }, [session, isPending]);

  if (!session || isPending) {
    return null;
  }

  return (
    <Link href="/settings/credits">
      <Badge
        variant={isLow ? 'destructive' : 'secondary'}
        className="flex items-center gap-1 cursor-pointer hover:opacity-80"
      >
        <Coins className="w-3 h-3" />
        <span className="font-semibold text-xs">{credits}</span>
      </Badge>
    </Link>
  );
}
