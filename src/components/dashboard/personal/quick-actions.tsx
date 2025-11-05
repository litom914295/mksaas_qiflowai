'use client';

import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Compass,
  CreditCard,
  FileText,
  Home,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const quickActions = [
  {
    id: 'bazi-analysis',
    icon: <Sparkles className="h-6 w-6" />,
    title: '八字分析',
    description: '深度解析命理运势',
    link: '/unified-form',
    gradient: 'from-purple-500 to-pink-500',
    badge: '热门',
  },
  {
    id: 'fengshui-analysis',
    icon: <Home className="h-6 w-6" />,
    title: '玄空风水',
    description: '智能飞星布局分析',
    link: '/unified-form',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'v6.0',
  },
  {
    id: 'compass',
    icon: <Compass className="h-6 w-6" />,
    title: '罗盘工具',
    description: 'AI智能方位识别',
    link: '/tools/compass',
    gradient: 'from-green-500 to-emerald-500',
    badge: '新',
  },
  {
    id: 'credits',
    icon: <CreditCard className="h-6 w-6" />,
    title: '积分充值',
    description: '解锁更多分析次数',
    link: '/settings/credits',
    gradient: 'from-orange-500 to-red-500',
    badge: '优惠',
  },
  {
    id: 'date-picker',
    icon: <Calendar className="h-6 w-6" />,
    title: '择吉日',
    description: '选择吉日良辰',
    link: '/tools/date-picker',
    gradient: 'from-indigo-500 to-purple-500',
    badge: null,
  },
  {
    id: 'ai-chat',
    icon: <MessageCircle className="h-6 w-6" />,
    title: 'AI助手',
    description: '智能问答解疑',
    link: '/ai-chat',
    gradient: 'from-pink-500 to-rose-500',
    badge: null,
  },
  {
    id: 'history',
    icon: <FileText className="h-6 w-6" />,
    title: '历史记录',
    description: '查看分析历史',
    link: '/analysis',
    gradient: 'from-gray-500 to-gray-700',
    badge: null,
  },
  {
    id: 'personal',
    icon: <BarChart3 className="h-6 w-6" />,
    title: '个人中心',
    description: '用户资料与设置',
    link: '/personal',
    gradient: 'from-teal-500 to-green-500',
    badge: null,
  },
];

export default function QuickActionsGrid() {
  const router = useRouter();
  const [hasAnalysis, setHasAnalysis] = useState<{
    bazi: boolean;
    fengshui: boolean;
  } | null>(null);

  // 检查用户是否有分析记录
  useEffect(() => {
    const checkAnalysisHistory = async () => {
      try {
        const response = await fetch('/api/analysis/check-history');

        // 检查响应状态
        if (!response.ok) {
          console.error(
            'API response not OK:',
            response.status,
            response.statusText
          );
          return;
        }

        // 检查 Content-Type 是否为 JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Response is not JSON, content-type:', contentType);
          const text = await response.text();
          console.error('Response body:', text.substring(0, 500));
          return;
        }

        const data = await response.json();
        if (data.success) {
          setHasAnalysis(data.hasAnalysis);
        }
      } catch (error) {
        console.error('Failed to check analysis history:', error);
      }
    };
    checkAnalysisHistory();
  }, []);

  // 智能跳转处理
  const handleAnalysisClick = (type: 'bazi' | 'fengshui') => {
    if (hasAnalysis === null) {
      // 还在加载中，默认跳转到表单
      router.push('/unified-form');
      return;
    }

    if (type === 'bazi' && hasAnalysis.bazi) {
      // 有八字分析记录，跳转到历史
      router.push('/analysis?filter=bazi');
    } else if (type === 'fengshui' && hasAnalysis.fengshui) {
      // 有风水分析记录，跳转到历史
      router.push('/analysis?filter=fengshui');
    } else {
      // 没有记录，跳转到表单
      router.push('/unified-form');
    }
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
      >
        快速开始
      </motion.h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {quickActions.map((action, index) => {
          // 判断是否是八字或风水按钮
          const isSmartButton =
            action.id === 'bazi-analysis' || action.id === 'fengshui-analysis';

          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSmartButton ? (
                <div
                  onClick={() =>
                    handleAnalysisClick(
                      action.id === 'bazi-analysis' ? 'bazi' : 'fengshui'
                    )
                  }
                  className="cursor-pointer"
                >
                  <Card className="group relative h-full cursor-pointer overflow-hidden border-0 shadow-md transition-all hover:shadow-xl">
                    {/* 渐变背景 */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                    />

                    {/* 徽章 */}
                    {action.badge && (
                      <div className="absolute right-2 top-2">
                        <span
                          className={`rounded-full bg-gradient-to-r ${action.gradient} px-2 py-0.5 text-[10px] font-semibold text-white`}
                        >
                          {action.badge}
                        </span>
                      </div>
                    )}

                    <CardContent className="relative flex flex-col items-center p-4 text-center">
                      {/* 图标容器 */}
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`mb-3 rounded-xl bg-gradient-to-br ${action.gradient} p-3 text-white shadow-lg`}
                      >
                        {action.icon}
                      </motion.div>

                      {/* 标题 */}
                      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {action.title}
                      </h3>

                      {/* 描述 */}
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>

                      {/* 悬停时的装饰线 */}
                      <div
                        className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${action.gradient} scale-x-0 transition-transform group-hover:scale-x-100`}
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Link href={action.link}>
                  <Card className="group relative h-full cursor-pointer overflow-hidden border-0 shadow-md transition-all hover:shadow-xl">
                    {/* 渐变背景 */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity group-hover:opacity-5`}
                    />

                    {/* 徽章 */}
                    {action.badge && (
                      <div className="absolute right-2 top-2">
                        <span
                          className={`rounded-full bg-gradient-to-r ${action.gradient} px-2 py-0.5 text-[10px] font-semibold text-white`}
                        >
                          {action.badge}
                        </span>
                      </div>
                    )}

                    <CardContent className="relative flex flex-col items-center p-4 text-center">
                      {/* 图标容器 */}
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`mb-3 rounded-xl bg-gradient-to-br ${action.gradient} p-3 text-white shadow-lg`}
                      >
                        {action.icon}
                      </motion.div>

                      {/* 标题 */}
                      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {action.title}
                      </h3>

                      {/* 描述 */}
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>

                      {/* 悬停时的装饰线 */}
                      <div
                        className={`absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r ${action.gradient} scale-x-0 transition-transform group-hover:scale-x-100`}
                      />
                    </CardContent>
                  </Card>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
