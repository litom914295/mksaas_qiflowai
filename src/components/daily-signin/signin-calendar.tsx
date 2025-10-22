'use client';

import { performDailySignIn } from '@/app/actions/daily-signin/perform-signin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { creditsKeys } from '@/hooks/use-credits';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isToday,
  startOfMonth,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Calendar, Check, Gift, Sparkles, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';

type SignInCalendarProps = {
  signInData: {
    isSigned: boolean;
    streak: number;
    nextReward: number;
    totalSignIns: number;
    signInHistory: Array<{ date: string; points: number }>;
    rewards: {
      day1: number;
      day7: number;
      day14: number;
      day30: number;
    };
  };
};

export default function SignInCalendar({ signInData }: SignInCalendarProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSigning, setIsSigning] = useState(false);
  const [localSignInData, setLocalSignInData] = useState(signInData);

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 检查某天是否已签到
  function isSignedIn(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    return localSignInData.signInHistory.some(
      (record) => record.date === dateStr
    );
  }

  // 执行签到
  async function handleSignIn() {
    if (localSignInData.isSigned) {
      toast({
        title: '已签到',
        description: '今天已经签到过了，明天再来吧！',
        variant: 'default',
      });
      return;
    }

    setIsSigning(true);
    try {
      // 直接调用 API，避免 Server Action 的认证问题
      const response = await fetch('/api/credits/daily-signin', {
        method: 'POST',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '签到失败');
      }

      if (result.success && result.data) {
        const points = 10; // 从配置获取
        const isAlreadySigned = result.data.already || false;

        // 更新本地状态
        setLocalSignInData((prev) => ({
          ...prev,
          isSigned: true,
          streak: result.data.streak || prev.streak + 1,
          nextReward: points,
          totalSignIns: result.data.streak || prev.totalSignIns + 1,
          signInHistory: [
            {
              date: format(new Date(), 'yyyy-MM-dd'),
              points: points,
            },
            ...prev.signInHistory,
          ],
        }));

        // 🔥 关键修复：刷新积分余额缓存
        if (!isAlreadySigned) {
          // 立即刷新积分余额,确保其他组件能看到最新积分
          queryClient.invalidateQueries({
            queryKey: creditsKeys.balance(),
          });
          queryClient.invalidateQueries({
            queryKey: creditsKeys.stats(),
          });
          console.log('✅ 签到成功,已刷新积分缓存');
        }

        toast({
          title: isAlreadySigned ? '今日已签到' : '签到成功！',
          description: isAlreadySigned
            ? '明天再来吧！'
            : `获得 ${points} 积分，连续签到 ${result.data.streak || 1} 天`,
        });
      }
    } catch (error) {
      toast({
        title: '签到失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsSigning(false);
    }
  }

  // 获取里程碑奖励进度
  function getMilestoneProgress() {
    const milestones = [
      { days: 1, reward: localSignInData.rewards.day1, label: '首签' },
      { days: 7, reward: localSignInData.rewards.day7, label: '周签' },
      { days: 14, reward: localSignInData.rewards.day14, label: '双周' },
      { days: 30, reward: localSignInData.rewards.day30, label: '月签' },
    ];

    return milestones.map((milestone) => ({
      ...milestone,
      achieved: localSignInData.streak >= milestone.days,
      isCurrent:
        localSignInData.streak < milestone.days &&
        (milestones.find(
          (m) =>
            localSignInData.streak >= m.days &&
            localSignInData.streak < milestone.days
        ) === undefined ||
          milestone.days === 7),
    }));
  }

  const milestones = getMilestoneProgress();

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 p-2 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">每日签到</CardTitle>
              <CardDescription>坚持签到获得更多积分奖励</CardDescription>
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleSignIn}
            disabled={localSignInData.isSigned || isSigning}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {isSigning ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                签到中...
              </>
            ) : localSignInData.isSigned ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                已签到
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                立即签到
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 签到统计 */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-900/20 dark:to-cyan-900/20"
          >
            <p className="text-sm text-muted-foreground">连续签到</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {localSignInData.streak} 天
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20"
          >
            <p className="text-sm text-muted-foreground">累计签到</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {localSignInData.totalSignIns} 天
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-900/20 dark:to-red-900/20"
          >
            <p className="text-sm text-muted-foreground">下次奖励</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              +{localSignInData.nextReward}
            </p>
          </motion.div>
        </div>

        {/* 里程碑奖励 */}
        <div>
          <h3 className="mb-3 font-semibold">里程碑奖励</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.days}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-lg border-2 p-3 text-center transition-all ${
                  milestone.achieved
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : milestone.isCurrent
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-center">
                  {milestone.achieved ? (
                    <Trophy className="h-6 w-6 text-green-600" />
                  ) : (
                    <Gift className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {milestone.label}
                </p>
                <p className="font-semibold">{milestone.days}天</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  +{milestone.reward}积分
                </Badge>
                {milestone.achieved && (
                  <div className="absolute right-1 top-1">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 签到日历 */}
        <div>
          <h3 className="mb-3 font-semibold">
            {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {/* 星期标题 */}
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* 日期 */}
            {/* 补充开始空白 */}
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {/* 日期网格 */}
            {daysInMonth.map((date, index) => {
              const signed = isSignedIn(date);
              const today = isToday(date);

              return (
                <motion.div
                  key={date.toISOString()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-all ${
                    signed
                      ? 'bg-green-500 font-semibold text-white'
                      : today
                        ? 'border-2 border-orange-500 font-semibold text-orange-600'
                        : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {signed ? <Check className="h-4 w-4" /> : format(date, 'd')}
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
