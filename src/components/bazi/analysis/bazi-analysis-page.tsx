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

  // 处理Tab切换 - 部分内容需要付费
  const handleTabChange = (value: string) => {
    const premiumTabs = ['tenGods', 'luck', 'career', 'daily', 'advice'];

    if (premiumTabs.includes(value) && !isPremium && creditsAvailable < 10) {
      setShowUpgradeModal(true);
      return;
    }

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

  // Tab配置
  const tabs = [
    { id: 'overview', label: '命理总览', icon: BarChart3, free: true },
    { id: 'pillars', label: '四柱排盘', icon: Calendar, free: true },
    { id: 'elements', label: '五行分析', icon: Activity, free: true },
    { id: 'tenGods', label: '十神解读', icon: Star, premium: true },
    { id: 'patterns', label: '格局详解', icon: Zap, free: true },
    { id: 'luck', label: '大运流年', icon: TrendingUp, premium: true },
    { id: 'personality', label: '性格特征', icon: User, free: true },
    { id: 'career', label: '事业财运', icon: Target, premium: true },
    { id: 'health', label: '健康婚姻', icon: Heart, free: true },
    { id: 'daily', label: '今日运势', icon: Clock, premium: true },
    { id: 'advice', label: '专业建议', icon: Lightbulb, premium: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* 顶部信息栏 */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  八字命理分析报告
                </h1>
              </div>
              {result.base.name && (
                <Badge variant="secondary" className="text-sm">
                  {result.base.name}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* 积分/会员状态 */}
              {isPremium ? (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Crown className="w-3 h-3 mr-1" />
                  专业版
                </Badge>
              ) : (
                <Badge variant="outline">剩余积分: {creditsAvailable}</Badge>
              )}

              {/* 操作按钮 */}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                导出PDF
              </Button>

              {!isPremium && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                  onClick={() => router.push('/settings/credits')}
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  升级专业版
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-8">
        {/* 基础信息展示 */}
        <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">性别:</span>
                  <span className="ml-2 font-medium">
                    {result.base.gender === 'male' ? '男' : '女'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">出生时间:</span>
                  <span className="ml-2 font-medium">
                    {new Date(result.base.birth.datetime).toLocaleString(
                      'zh-CN'
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">农历:</span>
                  <span className="ml-2 font-medium">
                    {result.base.birth.lunar || '计算中...'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">日主:</span>
                  <span className="ml-2 font-medium text-purple-600">
                    {result.base.dayMaster.chinese}
                  </span>
                </div>
              </div>

              {/* 评分展示 */}
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {result.metrics.overall.score}
                </div>
                <div className="text-xs text-gray-600">综合评分</div>
                <Badge className="mt-1" variant="outline">
                  {result.metrics.overall.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab导航内容 */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-11 h-auto p-1 bg-white/80 backdrop-blur">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isLocked =
                tab.premium && !isPremium && creditsAvailable < 10;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 py-2 px-1 text-xs relative"
                  disabled={isLocked}
                >
                  <div className="relative">
                    <Icon className="w-4 h-4" />
                    {isLocked && (
                      <Lock className="w-3 h-3 absolute -top-1 -right-1 text-gray-400" />
                    )}
                    {tab.premium && !isLocked && (
                      <Crown className="w-3 h-3 absolute -top-1 -right-1 text-amber-500" />
                    )}
                  </div>
                  <span className="truncate w-full text-center">
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

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

          {/* 十神解读 Tab - 付费内容 */}
          <TabsContent value="tenGods" className="space-y-6">
            {isPremium || creditsAvailable >= 10 ? (
              <TenGodsAnalysis data={result} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 space-y-4">
                    <Lock className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="text-lg font-semibold">升级解锁十神解读</h3>
                    <p className="text-gray-600">
                      深度解析您的性格特质、职业倾向、人际关系模式
                    </p>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => router.push('/settings/credits')}
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      立即升级
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 大运流年 Tab - 付费内容 */}
          <TabsContent value="luck" className="space-y-6">
            {isPremium || creditsAvailable >= 10 ? (
              <LuckCyclesAnalysis data={result} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 space-y-4">
                    <Lock className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="text-lg font-semibold">升级解锁大运流年</h3>
                    <p className="text-gray-600">
                      查看一生运势走向、关键时期提醒、流年详细分析
                    </p>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => router.push('/settings/credits')}
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      立即升级
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 每日运势 Tab - 付费内容 */}
          <TabsContent value="daily" className="space-y-6">
            {isPremium || creditsAvailable >= 10 ? (
              <DailyFortune data={result} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 space-y-4">
                    <Lock className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="text-lg font-semibold">升级解锁每日运势</h3>
                    <p className="text-gray-600">
                      基于节气变化的每日运势、时辰吉凶、专业建议
                    </p>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => router.push('/settings/credits')}
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      立即升级
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 专业建议 Tab - 付费内容 */}
          <TabsContent value="advice" className="space-y-6">
            {isPremium || creditsAvailable >= 10 ? (
              <ProfessionalAdvice data={result} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 space-y-4">
                    <Lock className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="text-lg font-semibold">升级解锁专业建议</h3>
                    <p className="text-gray-600">
                      个性化改运方案、风水布局、生活指导、21天改运计划
                    </p>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => router.push('/settings/credits')}
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      立即升级
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 格局详解 Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <PatternAnalysis data={result} />
          </TabsContent>

          {/* 性格特征 Tab - 免费内容 */}
          <TabsContent value="personality" className="space-y-6">
            <PersonalityInsight data={result} />
          </TabsContent>

          {/* 事业财运 Tab - 付费内容 */}
          <TabsContent value="career" className="space-y-6">
            {isPremium || creditsAvailable >= 10 ? (
              <CareerWealth data={result} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 space-y-4">
                    <Lock className="w-12 h-12 mx-auto text-gray-400" />
                    <h3 className="text-lg font-semibold">
                      升级解锁事业财运分析
                    </h3>
                    <p className="text-gray-600">
                      深度解析职业方向、财运模式、发展机遇和关键时期
                    </p>
                    <Button
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => router.push('/settings/credits')}
                    >
                      <Crown className="w-4 h-4 mr-1" />
                      立即升级
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 健康婚姻 Tab - 免费内容 */}
          <TabsContent value="health" className="space-y-6">
            <HealthMarriage data={result} />
          </TabsContent>
        </Tabs>

        {/* 底部引导区 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-purple-200">
            <CardContent className="pt-6 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <h4 className="font-semibold mb-1">AI大师咨询</h4>
              <p className="text-sm text-gray-600 mb-3">一对一解答您的疑问</p>
              <Button variant="outline" size="sm">
                立即咨询
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <h4 className="font-semibold mb-1">流年运势</h4>
              <p className="text-sm text-gray-600 mb-3">查看未来一年详细运势</p>
              <Button variant="outline" size="sm">
                查看详情
              </Button>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <h4 className="font-semibold mb-1">风水布局</h4>
              <p className="text-sm text-gray-600 mb-3">个性化家居风水建议</p>
              <Button variant="outline" size="sm">
                立即测算
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
