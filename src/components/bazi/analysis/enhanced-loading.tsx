/**
 * 增强的八字分析加载组件
 * 提供更丰富的加载状态、进度指示和用户友好的等待体验
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Crown,
  Lightbulb,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EnhancedLoadingProps {
  stage?:
    | 'initializing'
    | 'calculating'
    | 'analyzing'
    | 'generating'
    | 'finalizing';
  progress?: number;
  message?: string;
}

const loadingStages = [
  {
    id: 'initializing',
    label: '初始化分析',
    description: '准备八字计算环境',
    icon: Clock,
    duration: 1000,
  },
  {
    id: 'calculating',
    label: '四柱计算',
    description: '计算年月日时四柱干支',
    icon: Calendar,
    duration: 2000,
  },
  {
    id: 'analyzing',
    label: '五行分析',
    description: '分析五行力量与平衡',
    icon: Activity,
    duration: 1500,
  },
  {
    id: 'generating',
    label: '深度解读',
    description: '生成十神格局分析',
    icon: Star,
    duration: 2500,
  },
  {
    id: 'finalizing',
    label: '生成报告',
    description: '整合分析结果',
    icon: BarChart3,
    duration: 1000,
  },
];

const tips = [
  '八字命理学有着3000多年的历史传承',
  '准确的出生时间是精确分析的关键',
  '五行平衡理论是中医养生的理论基础',
  '十神系统能够揭示性格和命运特征',
  '大运流年分析可以预测人生重要阶段',
  '用神喜忌是改运调理的核心依据',
  '节气变化直接影响个人运势走向',
  '合理的风水布局能够改善运势',
];

export function EnhancedLoading({
  stage = 'calculating',
  progress,
  message,
}: EnhancedLoadingProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [animatedElements, setAnimatedElements] = useState<string[]>([]);

  // 模拟加载进度
  useEffect(() => {
    if (progress !== undefined) {
      setLoadingProgress(progress);
      return;
    }

    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [progress]);

  // 切换加载阶段
  useEffect(() => {
    const currentStageIndex = loadingStages.findIndex((s) => s.id === stage);
    if (currentStageIndex !== -1) {
      setCurrentStage(currentStageIndex);
    }

    const timer = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % loadingStages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [stage]);

  // 切换小贴士
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // 动画元素效果
  useEffect(() => {
    const elements = ['year', 'month', 'day', 'hour', 'elements', 'gods'];
    const timer = setInterval(() => {
      const randomElement =
        elements[Math.floor(Math.random() * elements.length)];
      setAnimatedElements((prev) => {
        const newElements = [...prev, randomElement];
        return newElements.slice(-3); // 保持最多3个动画元素
      });
    }, 800);

    return () => clearInterval(timer);
  }, []);

  const currentStageData = loadingStages[currentStage];
  const Icon = currentStageData?.icon || Calendar;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto px-4">
        {/* 主标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              AI八字命理分析系统
            </h1>
          </div>
          <p className="text-gray-600">
            结合传统命理学与现代算法，为您生成专属分析报告
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-sm text-purple-600 font-medium">
              准确率高达95%以上
            </span>
          </div>
        </div>

        {/* 主加载卡片 */}
        <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur shadow-xl">
          <CardContent className="pt-6">
            {/* 当前阶段指示 */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -inset-2 rounded-full border-2 border-purple-300 animate-spin opacity-60" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {message || currentStageData?.label || 'AI正在分析您的八字'}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentStageData?.description || '请稍候，正在为您计算...'}
              </p>
            </div>

            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">分析进度</span>
                <span className="text-sm font-medium text-purple-600">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
              <Progress value={loadingProgress} className="h-3 bg-gray-100" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>开始分析</span>
                <span>即将完成</span>
              </div>
            </div>

            {/* 加载阶段指示器 */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {loadingStages.map((stageData, index) => {
                const StageIcon = stageData.icon;
                const isActive = index === currentStage;
                const isCompleted = index < currentStage;

                return (
                  <div key={stageData.id} className="text-center">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all duration-300
                      ${
                        isActive
                          ? 'bg-purple-500 text-white scale-110'
                          : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                      }
                    `}
                    >
                      <StageIcon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs ${
                        isActive
                          ? 'text-purple-600 font-medium'
                          : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                      }`}
                    >
                      {stageData.label.slice(0, 4)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 实时计算展示 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: '年柱', icon: Calendar, key: 'year' },
                { label: '月柱', icon: Calendar, key: 'month' },
                { label: '日柱', icon: Calendar, key: 'day' },
                { label: '时柱', icon: Calendar, key: 'hour' },
              ].map(({ label, icon: ItemIcon, key }) => {
                const isAnimated = animatedElements.includes(key);
                return (
                  <div
                    key={key}
                    className={`
                    p-3 rounded-lg border transition-all duration-500
                    ${isAnimated ? 'border-purple-300 bg-purple-50 shadow-md' : 'border-gray-200 bg-gray-50'}
                  `}
                  >
                    <div className="flex items-center justify-center mb-1">
                      <ItemIcon
                        className={`w-4 h-4 ${
                          isAnimated ? 'text-purple-600' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-600">{label}</p>
                    <div className="text-center mt-1">
                      {isAnimated ? (
                        <LoadingSpinner className="w-4 h-4 text-purple-600" />
                      ) : (
                        <div className="w-4 h-1 bg-gray-300 rounded" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 知识小贴士 */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">
                      命理小知识
                    </h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {tips[currentTip]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 底部功能预览 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                即将为您展示
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: '四柱排盘', icon: Calendar },
                  { label: '五行分析', icon: Activity },
                  { label: '十神解读', icon: Star },
                  { label: '大运流年', icon: TrendingUp },
                  { label: '性格特征', icon: User },
                  { label: '专业建议', icon: Zap },
                ].map(({ label, icon: ItemIcon }) => (
                  <Badge key={label} variant="outline" className="text-xs">
                    <ItemIcon className="w-3 h-3 mr-1" />
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>分析时间通常需要10-15秒，请耐心等待...</p>
        </div>
      </div>
    </div>
  );
}
