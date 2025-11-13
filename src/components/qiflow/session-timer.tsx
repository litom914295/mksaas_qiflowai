'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SessionTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

export function SessionTimer({
  expiresAt,
  onExpire,
  className,
  compact = false,
}: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const expireTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const diff = expireTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        onExpire?.();
        return;
      }

      setTimeLeft(Math.floor(diff / 1000)); // 转换为秒
    };

    // 立即计算一次
    calculateTimeLeft();

    // 每秒更新
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  // 格式化时间显示（MM:SS）
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度百分比（15分钟 = 900秒）
  const totalSeconds = 15 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // 根据剩余时间确定状态
  const getStatus = () => {
    if (isExpired) return 'expired';
    if (timeLeft <= 60) return 'critical'; // 最后1分钟
    if (timeLeft <= 300) return 'warning'; // 最后5分钟
    return 'normal';
  };

  const status = getStatus();

  // 状态颜色配置
  const statusConfig = {
    normal: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-300 dark:border-green-700',
      icon: <Clock className="h-4 w-4" />,
      progressColor: 'bg-green-500',
    },
    warning: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderColor: 'border-yellow-300 dark:border-yellow-700',
      icon: <AlertTriangle className="h-4 w-4" />,
      progressColor: 'bg-yellow-500',
    },
    critical: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-300 dark:border-red-700',
      icon: <AlertTriangle className="h-4 w-4 animate-pulse" />,
      progressColor: 'bg-red-500',
    },
    expired: {
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
      borderColor: 'border-gray-300 dark:border-gray-700',
      icon: <CheckCircle className="h-4 w-4" />,
      progressColor: 'bg-gray-500',
    },
  };

  const config = statusConfig[status];

  // 紧凑模式
  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
          config.bgColor,
          config.borderColor,
          'border',
          className
        )}
      >
        <span className={config.color}>{config.icon}</span>
        <span className={cn('tabular-nums', config.color)}>
          {isExpired ? '已过期' : formatTime(timeLeft)}
        </span>
      </div>
    );
  }

  // 完整模式
  return (
    <Card
      className={cn(
        'p-4',
        config.bgColor,
        config.borderColor,
        'border-2',
        className
      )}
    >
      <div className="space-y-3">
        {/* 标题和图标 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={config.color}>{config.icon}</span>
            <span className={cn('text-sm font-medium', config.color)}>
              {isExpired ? '会话已结束' : '会话剩余时间'}
            </span>
          </div>
          <span className={cn('text-2xl font-bold tabular-nums', config.color)}>
            {isExpired ? '00:00' : formatTime(timeLeft)}
          </span>
        </div>

        {/* 进度条 */}
        {!isExpired && (
          <div className="space-y-1">
            <Progress
              value={progress}
              className={cn('h-2', config.progressColor)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>已用 {formatTime(totalSeconds - timeLeft)}</span>
              <span>共 15:00</span>
            </div>
          </div>
        )}

        {/* 状态提示 */}
        {status === 'critical' && !isExpired && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            ⚠️ 会话即将结束，请尽快完成咨询
          </p>
        )}

        {status === 'warning' && !isExpired && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            💡 提示：会话还有 {Math.floor(timeLeft / 60)} 分钟
          </p>
        )}

        {isExpired && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            会话已结束，如需继续咨询请购买新会话
          </p>
        )}
      </div>
    </Card>
  );
}
