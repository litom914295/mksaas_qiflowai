'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Circle,
  Gift,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'pending' | 'completed' | 'claimed';
  order: number;
}

interface OnboardingBannerProps {
  className?: string;
  onDismiss?: () => void;
}

export function OnboardingBanner({
  className,
  onDismiss,
}: OnboardingBannerProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReward, setTotalReward] = useState(0);
  const [earnedReward, setEarnedReward] = useState(0);

  // 获取任务列表
  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions/newbie');
      const data = await response.json();

      if (data.success) {
        setMissions(data.missions);

        // 计算总奖励和已获得奖励
        const total = data.missions.reduce(
          (sum: number, m: Mission) => sum + m.reward,
          0
        );
        const earned = data.missions
          .filter((m: Mission) => m.status === 'claimed')
          .reduce((sum: number, m: Mission) => sum + m.reward, 0);

        setTotalReward(total);
        setEarnedReward(earned);
      }
    } catch (error) {
      console.error('获取任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 领取奖励
  const claimReward = async (missionId: string) => {
    try {
      const response = await fetch('/api/missions/newbie/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      });

      const data = await response.json();

      if (data.success) {
        // 刷新任务列表
        fetchMissions();
      }
    } catch (error) {
      console.error('领取奖励失败:', error);
    }
  };

  // 计算进度百分比
  const completedCount = missions.filter(
    (m) => m.status === 'completed' || m.status === 'claimed'
  ).length;
  const progress =
    missions.length > 0 ? (completedCount / missions.length) * 100 : 0;

  // 如果所有任务都已完成并领取，不显示横幅
  const allClaimed =
    missions.length > 0 && missions.every((m) => m.status === 'claimed');
  if (allClaimed) {
    return null;
  }

  if (loading) {
    return (
      <Card
        className={cn(
          'p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20',
          className
        )}
      >
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'relative overflow-hidden bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50',
        'dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20',
        'border-purple-200 dark:border-purple-800',
        className
      )}
    >
      {/* 装饰性背景图案 */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative p-6">
        {/* 关闭按钮 */}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <div className="space-y-4">
          {/* 标题区域 */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                新手任务奖励
                <Badge variant="secondary" className="ml-2">
                  总计 {totalReward} 积分
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                完成下方任务即可获得丰厚积分奖励，快速体验平台核心功能
              </p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                完成进度: {completedCount} / {missions.length}
              </span>
              <span className="text-muted-foreground">
                已获得 {earnedReward} 积分
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 任务列表 */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {missions.map((mission) => (
              <Card
                key={mission.id}
                className={cn(
                  'p-4 transition-all hover:shadow-md',
                  mission.status === 'claimed' && 'opacity-60',
                  mission.status === 'completed' &&
                    'border-green-300 dark:border-green-700'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* 状态图标 */}
                  <div className="mt-1">
                    {mission.status === 'claimed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : mission.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>

                  {/* 任务信息 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm mb-1">
                      {mission.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {mission.description}
                    </p>

                    {/* 奖励和操作 */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs bg-yellow-50 dark:bg-yellow-950/20"
                      >
                        +{mission.reward} 积分
                      </Badge>

                      {mission.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs"
                          onClick={() => claimReward(mission.id)}
                        >
                          领取
                        </Button>
                      )}

                      {mission.status === 'claimed' && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          已领取
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 鼓励提示 */}
          {completedCount > 0 && completedCount < missions.length && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
              <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-blue-700 dark:text-blue-300">
                太棒了！再完成 {missions.length - completedCount}{' '}
                个任务即可获得全部 {totalReward - earnedReward} 积分奖励
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
