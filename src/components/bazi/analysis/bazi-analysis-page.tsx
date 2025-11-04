'use client';

import { EnhancedError } from '@/components/bazi/analysis/enhanced-error';
import { EnhancedLoading } from '@/components/bazi/analysis/enhanced-loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type EnhancedBaziResult,
  type EnhancedBirthData,
  computeBaziSmart,
} from '@/lib/bazi';
import {
  type BaziAnalysisModel,
  normalizeBaziResult,
} from '@/lib/bazi/normalize';
import confetti from 'canvas-confetti';
import {
  Activity,
  AlertCircle,
  ArrowUp,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  Download,
  Heart,
  Lightbulb,
  Lock,
  MessageSquare,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CareerWealth } from './career-wealth';
import { DailyFortune } from './daily-fortune';
import { ElementsAnalysis } from './elements-analysis';
import { HealthMarriage } from './health-marriage';
import { LuckCyclesAnalysis } from './luck-cycles';
import { BaziOverview } from './overview';
import { PatternAnalysis } from './pattern-analysis';
import { PersonalityInsight } from './personality-insight';
import { PillarsDetail } from './pillars-detail';
import { ProfessionalAdvice } from './professional-advice';
import { TenGodsAnalysis } from './ten-gods';

interface BaziAnalysisPageProps {
  birthData: {
    datetime: string;
    gender: 'male' | 'female';
    timezone?: string;
    isTimeKnown?: boolean;
    name?: string;
    location?: string;
  };
  onAnalysisComplete?: (result: EnhancedBaziResult | null) => void;
  isPremium?: boolean;
  creditsAvailable?: number;
}

export function BaziAnalysisPage({
  birthData,
  onAnalysisComplete,
  isPremium = false,
  creditsAvailable = 0,
}: BaziAnalysisPageProps) {
  const router = useRouter();
  const [result, setResult] = useState<BaziAnalysisModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 分析八字
  const analyzeBazi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const enhancedBirthData: EnhancedBirthData = {
        ...birthData,
        datetime: birthData.datetime,
        timezone: birthData.timezone || 'Asia/Shanghai',
        isTimeKnown: birthData.isTimeKnown ?? true,
        preferredLocale: 'zh-CN',
      };

      // 执行八字计算
      const analysisResult = await computeBaziSmart(enhancedBirthData);

      if (analysisResult) {
        // 归一化数据
        const normalizedData = normalizeBaziResult(analysisResult, {
          name: birthData.name,
          location: birthData.location,
          datetime: birthData.datetime,
          gender: birthData.gender,
        });

        if (normalizedData) {
          setResult(normalizedData);

          // 触发庆祝动画
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#8B5CF6', '#EC4899', '#3B82F6'],
            });
          }, 500);
        }
      }

      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : '八字分析失败');
    } finally {
      setLoading(false);
    }
  }, [birthData, onAnalysisComplete]);

  useEffect(() => {
    analyzeBazi();
  }, [analyzeBazi]);

  // 处理Tab切换 - 所有内容免费开放
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (loading) {
    return <EnhancedLoading stage="calculating" />;
  }

  if (error) {
    return (
      <EnhancedError
        error={error}
        onRetry={analyzeBazi}
        onReset={() => router.refresh?.()}
        context={{ stage: '计算八字', attempts: 1 }}
      />
    );
  }

  if (!result) {
    return null;
  }

  // Tab配置 - 所有tab均为免费
  const tabs = [
    { id: 'overview', label: '命理总览', icon: BarChart3, free: true },
    { id: 'pillars', label: '四柱排盘', icon: Calendar, free: true },
    { id: 'elements', label: '五行分析', icon: Activity, free: true },
    { id: 'tenGods', label: '十神解读', icon: Star, free: true },
    { id: 'patterns', label: '格局详解', icon: Zap, free: true },
    { id: 'luck', label: '大运流年', icon: TrendingUp, free: true },
    { id: 'personality', label: '性格特征', icon: User, free: true },
    { id: 'career', label: '事业财运', icon: Target, free: true },
    { id: 'health', label: '健康婚姻', icon: Heart, free: true },
    { id: 'daily', label: '今日运势', icon: Clock, free: true },
    { id: 'advice', label: '专业建议', icon: Lightbulb, free: true },
  ];

  return (
    <div className="space-y-4">
      {/* 主内容区 */}
      <div className="space-y-4">
        {/* 精简亮点卡片 */}
        <Card className="mb-4 overflow-hidden border-2 shadow-xl">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 text-white">
            <div className="flex items-start justify-between">
              {/* 左侧：标题与信息 */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">八字专业报告</h1>
                    <p className="text-white/90 text-sm mt-1">
                      {result.base.gender === 'male' ? '男' : '女'} · 日主{result.base.dayMaster.chinese} · {result.base.birth.lunar || '农历计算中'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 右侧：评级徽章 */}
              <div className="flex flex-col items-end gap-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-lg px-6 py-2 shadow-lg">
                  {result.metrics.overall.level}
                </Badge>
                <div className="text-xs text-white/80">
                  {new Date(result.base.birth.datetime).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          </div>

          {/* 综合评分区域 */}
          <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 主评分 */}
              <div className="lg:col-span-1">
                <div className="bg-blue-50 rounded-2xl p-6 text-center border-2 border-blue-700">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-6xl font-bold text-blue-700">
                      {result.metrics.overall.score}
                    </span>
                    <span className="text-2xl text-gray-500">/100</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-700">
                    综合命理评分
                  </p>
                </div>
              </div>

              {/* 统计卡片 */}
              <div className="lg:col-span-3 grid grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {result.elements?.favorable?.length || 0}
                      </div>
                      <p className="text-sm text-gray-600">喜用五行</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-red-600 mb-1">
                        {result.elements?.unfavorable?.length || 0}
                      </div>
                      <p className="text-sm text-gray-600">忌神五行</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-orange-600 mb-1">
                        {result.patterns?.length || 0}
                      </div>
                      <p className="text-sm text-gray-600">特殊格局</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab导航 */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-11 gap-3 h-auto p-0 bg-transparent">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center gap-2 py-3 px-2 text-xs rounded-xl border-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:shadow-md hover:bg-gray-50 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="truncate w-full text-center font-medium">
                      {tab.label}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* 总览 Tab */}
          <TabsContent value="overview" className="space-y-6">
            <BaziOverview data={result} />

            {/* 引导升级卡片 */}
            {!isPremium && (
              <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-900">
                          解锁完整分析报告
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        升级专业版，获取十神解读、大运流年、每日运势等深度内容
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600 line-through">
                          ￥299
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                          ￥99
                        </span>
                        <Badge className="bg-red-100 text-red-700">
                          限时优惠
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-amber-500 to-orange-500"
                      onClick={() => router.push('/settings/credits')}
                    >
                      立即升级
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 四柱排盘 Tab */}
          <TabsContent value="pillars" className="space-y-6">
            <PillarsDetail data={result} />
          </TabsContent>

          {/* 五行分析 Tab */}
          <TabsContent value="elements" className="space-y-6">
            <ElementsAnalysis data={result} />
          </TabsContent>

          {/* 十神解读 Tab */}
          <TabsContent value="tenGods" className="space-y-6">
            <TenGodsAnalysis data={result} />
          </TabsContent>

          {/* 大运流年 Tab */}
          <TabsContent value="luck" className="space-y-6">
            <LuckCyclesAnalysis data={result} />
          </TabsContent>

          {/* 今日运势 Tab */}
          <TabsContent value="daily" className="space-y-6">
            <DailyFortune data={result} />
          </TabsContent>

          {/* 专业建议 Tab */}
          <TabsContent value="advice" className="space-y-6">
            <ProfessionalAdvice data={result} />
          </TabsContent>

          {/* 格局详解 Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <PatternAnalysis data={result} />
          </TabsContent>

          {/* 性格特征 Tab */}
          <TabsContent value="personality" className="space-y-6">
            <PersonalityInsight data={result} />
          </TabsContent>

          {/* 事业财运 Tab */}
          <TabsContent value="career" className="space-y-4">
            <CareerWealth data={result} />
          </TabsContent>

          {/* 健康婚姻 Tab */}
          <TabsContent value="health" className="space-y-4">
            <HealthMarriage data={result} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
