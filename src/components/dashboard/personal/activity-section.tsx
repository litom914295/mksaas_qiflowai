'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  Loader2,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type ActivitySectionProps = {
  activities: {
    dailySignIn: {
      isSigned: boolean;
      streak: number;
      nextReward: number;
    };
    newbieMissions: {
      completed: number;
      total: number;
      progress: number;
    };
  };
};

export default function ActivitySection({ activities }: ActivitySectionProps) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigned, setIsSigned] = useState(activities.dailySignIn.isSigned);
  const [autoSignInAttempted, setAutoSignInAttempted] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  // 同步签到状态：当 props 更新时，同步本地状态
  useEffect(() => {
    setIsSigned(activities.dailySignIn.isSigned);
  }, [activities.dailySignIn.isSigned]);

  // 无感签到：自动触发签到
  useEffect(() => {
    const performAutoSignIn = async () => {
      // 只在未签到且未尝试过自动签到时触发
      if (!isSigned && !autoSignInAttempted) {
        setAutoSignInAttempted(true);
        try {
          const response = await fetch('/api/credits/daily-signin', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && !result.data.already) {
              setIsSigned(true);
              const credits = result.data.earnedCredits || 5;
              setEarnedCredits(credits);
              toast({
                title: '自动签到成功！',
                description: `恭喜获得 ${credits} 积分奖励`,
              });
              // 3秒后清除积分显示
              setTimeout(() => setEarnedCredits(null), 3000);
              // 刷新数据
              router.refresh();
            }
          }
        } catch (error) {
          console.error('Auto sign-in error:', error);
          // 自动签到失败不显示错误提示，保持静默
        }
      }
    };

    performAutoSignIn();
  }, [isSigned, autoSignInAttempted, toast, router]);

  // 从 props 中获取真实任务数据
  const [missions, setMissions] = useState<any[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(true);
  const [claimingMission, setClaimingMission] = useState<string | null>(null);

  // 加载任务数据
  useEffect(() => {
    const loadMissions = async () => {
      try {
        const response = await fetch('/api/missions/newbie');
        
        if (!response.ok) {
          console.error('Failed to load missions - response not ok:', response.status);
          return;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON, content-type:', contentType);
          const text = await response.text();
          console.error('Response body:', text.substring(0, 500));
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          setMissions(data.missions);
        }
      } catch (error) {
        console.error('Failed to load missions:', error);
      } finally {
        setLoadingMissions(false);
      }
    };
    loadMissions();
  }, []);

  // 领取任务奖励
  const handleClaimReward = async (missionId: string) => {
    if (claimingMission) return;

    setClaimingMission(missionId);
    try {
      const response = await fetch('/api/missions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Claim mission failed:', response.status, text.substring(0, 500));
        throw new Error('Failed to claim reward');
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: '领取成功！',
          description: result.message,
        });
        // 更新任务状态
        setMissions(missions.map(m => 
          m.id === missionId ? { ...m, rewardClaimed: true } : m
        ));
        router.refresh();
      } else {
        throw new Error(result.error || '领取失败');
      }
    } catch (error: any) {
      toast({
        title: '领取失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setClaimingMission(null);
    }
  };

  // 手动签到处理函数（已启用无感签到，此函数作为备用）
  const handleSignIn = async () => {
    if (isSigned || isSigningIn) return;

    setIsSigningIn(true);
    try {
      const response = await fetch('/api/credits/daily-signin', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok && response.status !== 400) {
        const text = await response.text();
        console.error('Sign in failed:', response.status, text.substring(0, 500));
        throw new Error('Failed to sign in');
      }

      const result = await response.json();

      if (result.success) {
        if (result.data.already) {
          setIsSigned(true);
          toast({
            title: '已签到',
            description: '您今日已经签到过了！',
            variant: 'default',
          });
        } else {
          setIsSigned(true);
          const credits = result.data.earnedCredits || 5;
          setEarnedCredits(credits);
          toast({
            title: '签到成功！',
            description: `恭喜您获得 ${credits} 积分！`,
          });
          // 刷新页面数据
          router.refresh();
        }
      } else {
        throw new Error(result.error || '签到失败');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: '签到失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
      >
        活动中心
      </motion.h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 每日签到卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 p-2 text-white">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">每日签到</CardTitle>
                    <CardDescription>连续签到获得更多奖励</CardDescription>
                  </div>
                </div>
                {isSigned ? (
                  <Badge className="bg-green-500">已签到</Badge>
                ) : (
                  <Badge variant="outline">未签到</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 连续签到天数 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-muted-foreground">
                      连续签到
                    </span>
                  </div>
                  <span className="text-2xl font-bold">
                    {activities.dailySignIn.streak} 天
                  </span>
                </div>

                {/* 签到进度 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>本周进度</span>
                    <span>{Math.min(activities.dailySignIn.streak, 7)}/7</span>
                  </div>
                  <Progress
                    value={Math.min(activities.dailySignIn.streak, 7) * 14.3}
                    className="h-2"
                  />
                </div>

                {/* 签到奖励提示 */}
                <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-3 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">
                        {earnedCredits ? '本次获得' : '每日签到奖励'}
                      </span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      {earnedCredits ? (
                        <span className="animate-pulse">+{earnedCredits} 积分</span>
                      ) : (
                        '5-20 积分'
                      )}
                    </span>
                  </div>
                </div>

                {/* 签到状态显示 - 已启用无感签到 */}
                <div className="flex items-center justify-center rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
                  {isSigned ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">
                        {earnedCredits ? `今日已签到 +${earnedCredits}积分` : '今日已签到'}
                      </span>
                    </div>
                  ) : !autoSignInAttempted ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>正在自动签到...</span>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleSignIn}
                      disabled={isSigningIn}
                      size="sm"
                      className="w-full"
                    >
                      {isSigningIn ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          签到中...
                        </>
                      ) : (
                        <>点击签到</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 新手任务卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 p-2 text-white">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">新手任务</CardTitle>
                    <CardDescription>完成任务获得丰厚奖励</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  {activities.newbieMissions.completed}/
                  {activities.newbieMissions.total}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 总进度 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>总进度</span>
                    <span className="font-medium">
                      {activities.newbieMissions.progress}%
                    </span>
                  </div>
                  <Progress
                    value={activities.newbieMissions.progress}
                    className="h-2"
                  />
                </div>

                {/* 任务列表 */}
                <div className="space-y-2">
                  {loadingMissions ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    missions.slice(0, 3).map((mission) => (
                      <div
                        key={mission.id}
                        className={`flex items-center justify-between rounded-lg border p-2 transition-colors ${
                          mission.completed
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {mission.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span
                            className={`text-sm ${mission.completed && mission.rewardClaimed ? 'line-through opacity-60' : ''}`}
                          >
                            {mission.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">
                              +{mission.reward}
                            </span>
                          </div>
                          {mission.completed && !mission.rewardClaimed && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={() => handleClaimReward(mission.id)}
                              disabled={claimingMission === mission.id}
                            >
                              {claimingMission === mission.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                '领取'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 查看全部按钮 */}
                <Button variant="outline" className="w-full">
                  查看全部任务
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
