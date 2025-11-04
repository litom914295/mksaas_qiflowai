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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Copy,
  Gift,
  Link2,
  MessageCircle,
  QrCode,
  Share2,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { useState } from 'react';

type ReferralData = {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  successfulReferrals: number;
  pendingRewards: number;
  totalEarned: number;
  referralHistory: Array<{
    id: string;
    username: string;
    status: 'active' | 'pending' | 'expired';
    reward: number;
    date: string;
  }>;
};

export default function ReferralRewards() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const referralData: ReferralData = {
    referralCode: 'QIFLOW2024',
    referralLink: 'https://qiflow.ai/ref/QIFLOW2024',
    totalReferrals: 12,
    successfulReferrals: 8,
    pendingRewards: 200,
    totalEarned: 850,
    referralHistory: [
      {
        id: '1',
        username: '用户A***',
        status: 'active',
        reward: 50,
        date: '2024-01-14',
      },
      {
        id: '2',
        username: '用户B***',
        status: 'active',
        reward: 50,
        date: '2024-01-12',
      },
      {
        id: '3',
        username: '用户C***',
        status: 'pending',
        reward: 50,
        date: '2024-01-10',
      },
      {
        id: '4',
        username: '用户D***',
        status: 'active',
        reward: 50,
        date: '2024-01-08',
      },
      {
        id: '5',
        username: '用户E***',
        status: 'expired',
        reward: 0,
        date: '2024-01-05',
      },
    ],
  };

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: '复制成功',
      description: `${type}已复制到剪贴板`,
    });
  }

  async function shareToSocial(platform: string) {
    const shareText = `🎉 来QiFlow AI体验专业的命理分析！使用我的邀请码 ${referralData.referralCode} 注册，立即获得50积分奖励！`;
    const shareUrl = referralData.referralLink;

    if (platform === 'wechat') {
      toast({
        title: '请使用微信扫码分享',
        description: '二维码已生成',
      });
    } else if (platform === 'weibo') {
      window.open(
        `https://weibo.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
      );
    } else {
      // 通用分享
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'QiFlow AI邀请',
            text: shareText,
            url: shareUrl,
          });
        } catch (error) {
          console.log('分享取消');
        }
      }
    }
  }

  const successRate =
    (referralData.successfulReferrals / referralData.totalReferrals) * 100;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 p-2 text-white">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">推荐奖励</CardTitle>
            <CardDescription>邀请好友注册，赚取积分奖励</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="share">分享邀请</TabsTrigger>
            <TabsTrigger value="history">推荐记录</TabsTrigger>
          </TabsList>

          {/* 概览 Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* 奖励统计 */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 p-4 dark:from-purple-900/20 dark:to-blue-900/20"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <p className="text-sm text-muted-foreground">总推荐</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-purple-600">
                  {referralData.totalReferrals}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-muted-foreground">成功推荐</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {referralData.successfulReferrals}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-900/20 dark:to-red-900/20"
              >
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-orange-600" />
                  <p className="text-sm text-muted-foreground">待领取</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-orange-600">
                  {referralData.pendingRewards}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 p-4 dark:from-cyan-900/20 dark:to-blue-900/20"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-600" />
                  <p className="text-sm text-muted-foreground">累计收益</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-cyan-600">
                  {referralData.totalEarned}
                </p>
              </motion.div>
            </div>

            {/* 成功率 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-lg border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">推荐成功率</p>
                <span className="text-2xl font-bold text-primary">
                  {successRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={successRate} className="h-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                每成功推荐1位好友，您和好友都将获得50积分奖励！
              </p>
            </motion.div>

            {/* 推荐规则 */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-semibold mb-3">推荐规则</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ 好友使用您的推荐码注册，立即获得50积分</li>
                <li>✓ 好友完成首次付费，您获得50积分奖励</li>
                <li>✓ 推荐人数无上限，奖励累计发放</li>
                <li>✓ 推荐码永久有效，可重复使用</li>
              </ul>
            </div>
          </TabsContent>

          {/* 分享邀请 Tab */}
          <TabsContent value="share" className="space-y-6">
            {/* 推荐码 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border p-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">
                您的专属推荐码
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <p className="text-3xl font-bold text-primary">
                  {referralData.referralCode}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(referralData.referralCode, '推荐码')
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 max-w-md mx-auto">
                <Input value={referralData.referralLink} readOnly />
                <Button
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(referralData.referralLink, '推荐链接')
                  }
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            {/* 分享方式 */}
            <div>
              <h3 className="font-semibold mb-3">快速分享</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => shareToSocial('wechat')}
                >
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <span className="text-xs">微信</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => shareToSocial('weibo')}
                >
                  <Share2 className="h-6 w-6 text-red-600" />
                  <span className="text-xs">微博</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => shareToSocial('qrcode')}
                >
                  <QrCode className="h-6 w-6 text-blue-600" />
                  <span className="text-xs">二维码</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() =>
                    copyToClipboard(referralData.referralLink, '链接')
                  }
                >
                  <Copy className="h-6 w-6 text-purple-600" />
                  <span className="text-xs">复制链接</span>
                </Button>
              </div>
            </div>

            {/* 分享文案 */}
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-semibold mb-3">推荐文案</h3>
              <div className="space-y-3">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-sm">
                    🎯
                    发现了一个超准的AI命理分析平台！结合传统易学和现代AI技术，分析准确度惊人。
                    用我的邀请码 {referralData.referralCode}{' '}
                    注册还送50积分，快来试试！
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      copyToClipboard(
                        `🎯 发现了一个超准的AI命理分析平台！结合传统易学和现代AI技术，分析准确度惊人。用我的邀请码 ${referralData.referralCode} 注册还送50积分，快来试试！`,
                        '文案'
                      )
                    }
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    复制文案
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 推荐记录 Tab */}
          <TabsContent value="history" className="space-y-4">
            {referralData.referralHistory.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                    {record.username.charAt(2)}
                  </div>
                  <div>
                    <p className="font-medium">{record.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {record.status === 'active' && (
                    <>
                      <Badge className="bg-green-100 text-green-700">
                        已激活
                      </Badge>
                      <span className="font-semibold text-green-600">
                        +{record.reward}
                      </span>
                    </>
                  )}
                  {record.status === 'pending' && (
                    <>
                      <Badge variant="secondary">待激活</Badge>
                      <span className="text-muted-foreground">
                        {record.reward}
                      </span>
                    </>
                  )}
                  {record.status === 'expired' && (
                    <>
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        已失效
                      </Badge>
                      <span className="text-muted-foreground line-through">
                        {record.reward}
                      </span>
                    </>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}

            <Button variant="link" className="w-full">
              查看更多记录 →
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
