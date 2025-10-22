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
import { useState } from 'react';

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
  const { toast } = useToast();
  const router = useRouter();

  const missions = [
    { id: 1, title: '完善个人资料', reward: 20, completed: true },
    { id: 2, title: '首次八字分析', reward: 30, completed: true },
    { id: 3, title: '绑定微信账号', reward: 15, completed: false },
    { id: 4, title: '邀请好友注册', reward: 50, completed: false },
    { id: 5, title: '分享分析结果', reward: 15, completed: false },
  ];

  // 签到处理函数
  const handleSignIn = async () => {
    if (isSigned || isSigningIn) return;

    setIsSigningIn(true);
    try {
      const response = await fetch('/api/credits/daily-signin', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setIsSigned(true);
        toast({
          title: '签到成功！',
          description: `恭喜您获得 ${activities.dailySignIn.nextReward} 积分！`,
        });
        // 刷新页面数据
        router.refresh();
      } else if (result.data?.already) {
        setIsSigned(true);
        toast({
          title: '已签到',
          description: '您今日已经签到过了！',
          variant: 'default',
        });
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

                {/* 下次奖励 */}
                <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-3 dark:from-yellow-900/20 dark:to-orange-900/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">下次签到奖励</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      +{activities.dailySignIn.nextReward} 积分
                    </span>
                  </div>
                </div>

                {/* 签到按钮 */}
                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  disabled={isSigned || isSigningIn}
                  onClick={handleSignIn}
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      签到中...
                    </>
                  ) : isSigned ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      今日已签到
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      立即签到
                    </>
                  )}
                </Button>
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
                  {missions.slice(0, 3).map((mission) => (
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
                          className={`text-sm ${mission.completed ? 'line-through opacity-60' : ''}`}
                        >
                          {mission.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm font-medium">
                          +{mission.reward}
                        </span>
                      </div>
                    </div>
                  ))}
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
