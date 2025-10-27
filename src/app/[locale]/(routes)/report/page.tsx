'use client';

import { BaziAnalysisPage } from '@/components/bazi/analysis/bazi-analysis-page';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
import { EnhancedComprehensivePanel } from '@/components/qiflow/xuankong/enhanced-comprehensive-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisContext } from '@/contexts/analysis-context';
import { useCreditBalance } from '@/hooks/use-credits';
import { authClient } from '@/lib/auth-client';
import {
  type ComprehensiveAnalysisResult,
  runComprehensiveAnalysis,
} from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  ArrowLeft,
  Compass,
  Heart,
  Home,
  Loader2,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// 五行与颜色/方位的对应关系
const wuxingMapping = {
  wood: {
    name: '木',
    color: 'green',
    direction: ['东', '东南'],
    element: '🌳',
    description: '适合摆放绿色植物，增强木能量',
  },
  fire: {
    name: '火',
    color: 'red',
    direction: ['南'],
    element: '🔥',
    description: '适合使用红色装饰，提升火能量',
  },
  earth: {
    name: '土',
    color: 'yellow',
    direction: ['中', '西南', '东北'],
    element: '🏔️',
    description: '适合陶瓷装饰，加强土能量',
  },
  metal: {
    name: '金',
    color: 'white',
    direction: ['西', '西北'],
    element: '⚡',
    description: '适合金属摆件，强化金能量',
  },
  water: {
    name: '水',
    color: 'blue',
    direction: ['北'],
    element: '💧',
    description: '适合水景布置，提升水能量',
  },
};

// 24山数据
const mountains = [
  { name: '子', degree: 0, desc: '正北' },
  { name: '癸', degree: 15, desc: '北偏东' },
  { name: '丑', degree: 30, desc: '东北偏北' },
  { name: '艮', degree: 45, desc: '东北' },
  { name: '寅', degree: 60, desc: '东北偏东' },
  { name: '甲', degree: 75, desc: '东偏北' },
  { name: '卯', degree: 90, desc: '正东' },
  { name: '乙', degree: 105, desc: '东偏南' },
  { name: '辰', degree: 120, desc: '东南偏东' },
  { name: '巽', degree: 135, desc: '东南' },
  { name: '巳', degree: 150, desc: '东南偏南' },
  { name: '丙', degree: 165, desc: '南偏东' },
  { name: '午', degree: 180, desc: '正南' },
  { name: '丁', degree: 195, desc: '南偏西' },
  { name: '未', degree: 210, desc: '西南偏南' },
  { name: '坤', degree: 225, desc: '西南' },
  { name: '申', degree: 240, desc: '西南偏西' },
  { name: '庚', degree: 255, desc: '西偏南' },
  { name: '酉', degree: 270, desc: '正西' },
  { name: '辛', degree: 285, desc: '西偏北' },
  { name: '戌', degree: 300, desc: '西北偏西' },
  { name: '乾', degree: 315, desc: '西北' },
  { name: '亥', degree: 330, desc: '西北偏北' },
  { name: '壬', degree: 345, desc: '北偏西' },
];

export default function ReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const analysisContext = useAnalysisContext();
  const { data: session } = authClient.useSession();
  const { data: creditsAvailable = 0 } = useCreditBalance();
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isContextSynced, setIsContextSynced] = useState(false);

  // 玄空增强面板状态
  const [activeMainTab, setActiveMainTab] = useState<
    'bazi' | 'xuankong' | 'integrated'
  >('bazi');
  const [xuankongLoading, setXuankongLoading] = useState(false);
  const [xuankongResult, setXuankongResult] =
    useState<ComprehensiveAnalysisResult | null>(null);
  const [baziResult, setBaziResult] = useState<any>(null);

  // 使用 useMemo 生成稳定的 sessionId，避免 hydration 错误
  const sessionId = useMemo(() => `bazi_${Date.now()}`, []);

  // 检查是否有房屋信息（决定是否显示玄空Tab）
  const hasHouseInfo = useMemo(() => {
    if (!formData?.house) return false;
    // 只要有任何房屋相关信息，就认为用户有风水分析需求
    return !!(
      formData.house.direction ||
      formData.house.roomCount ||
      formData.house.completionYear ||
      formData.house.completionMonth
    );
  }, [
    formData?.house?.direction,
    formData?.house?.roomCount,
    formData?.house?.completionYear,
    formData?.house?.completionMonth,
  ]);

  // 在组件顶层定义所有Hook，避免条件渲染影响
  // 使用 useMemo 稳定 personalData 对象，避免不必要的重新渲染
  const personalData = useMemo(() => {
    if (!formData?.personal) return null;
    const datetime = `${formData.personal.birthDate}T${formData.personal.birthTime || '00:00'}`;
    return {
      datetime,
      gender: formData.personal.gender as 'male' | 'female',
      timezone: formData.personal.birthCity || undefined,
      isTimeKnown: !!formData.personal.birthTime,
    };
  }, [
    formData?.personal?.birthDate,
    formData?.personal?.birthTime,
    formData?.personal?.gender,
    formData?.personal?.birthCity,
  ]);

  // 24山计算工具
  const norm = useCallback((d: number) => ((d % 360) + 360) % 360, []);
  const closest = useCallback(
    (d: number) =>
      mountains.reduce((a, b) =>
        Math.min(
          Math.abs(norm(d) - a.degree),
          Math.abs(norm(d) - a.degree + 360),
          Math.abs(norm(d) - a.degree - 360)
        ) <=
        Math.min(
          Math.abs(norm(d) - b.degree),
          Math.abs(norm(d) - b.degree + 360),
          Math.abs(norm(d) - b.degree - 360)
        )
          ? a
          : b
      ),
    [norm]
  );

  // 房屋朝向计算
  const facingDeg = hasHouseInfo
    ? Number.parseInt(formData.house.direction)
    : 0;
  const facingMountain = hasHouseInfo ? closest(facingDeg) : null;
  const sittingMountain = hasHouseInfo
    ? closest((facingDeg + 180) % 360)
    : null;

  // 八字分析完成回调（使用useCallback确保稳定性）
  const handleBaziAnalysisComplete = useCallback(
    (result: any) => {
      if (!result || !analysisContext || isContextSynced) return;

      // 保存八字结果用于整合建议
      setBaziResult(result);

      try {
        const comprehensiveResult = {
          basic: {
            yuanPan: {
              period: 9,
              years: '2024-2043',
              sitting: result.pillars?.year?.branch || '未知',
              facing: result.pillars?.day?.branch || '未知',
            },
          },
          pillars: result.pillars,
          elements: result.elements,
          yongshen: result.yongshen?.primary,
          pattern: result.pattern?.primary?.name,
          scoring: result.scoring
            ? {
                overall: {
                  score: result.scoring.overall?.score || 75,
                  level: result.scoring.overall?.level || '中等',
                  dimensions: [
                    {
                      dimension: 'health',
                      score: result.scoring.health || 75,
                    },
                    {
                      dimension: 'wealth',
                      score: result.scoring.wealth || 75,
                    },
                    {
                      dimension: 'relationship',
                      score: result.scoring.relationship || 75,
                    },
                    {
                      dimension: 'career',
                      score: result.scoring.career || 75,
                    },
                  ],
                },
              }
            : undefined,
          insights:
            result.insights?.map((insight: any) => ({
              title: insight.category || '重要发现',
              description: insight.content || insight.message || '无描述',
              impact: insight.importance || 'medium',
            })) || [],
          warnings:
            result.warnings?.map((warning: any) => ({
              category: warning.category || '通用',
              title: warning.title || '需要注意',
              severity: warning.severity || 'medium',
            })) || [],
        };

        analysisContext.setAnalysisResult(comprehensiveResult as any);
        setIsContextSynced(true);
      } catch (error) {
        console.error('同步八字分析结果失败:', error);
      }
    },
    [analysisContext, isContextSynced]
  );

  // 玄空：一键生成示例分析（用于在报告页直接查看增强面板）
  const generateXuankong = useCallback(async () => {
    try {
      setXuankongLoading(true);

      // 基于表单推导用户画像（最小集），用于启用个性化分析
      let userProfile: any = undefined;
      try {
        const bd = formData?.personal?.birthDate
          ? new Date(formData.personal.birthDate)
          : null;
        if (bd) {
          const h = (() => {
            const t = (formData.personal.birthTime || '00:00').split(':');
            const hh = Number.parseInt(t[0], 10);
            return Number.isNaN(hh) ? undefined : hh;
          })();
          userProfile = {
            birthYear: bd.getFullYear(),
            birthMonth: bd.getMonth() + 1,
            birthDay: bd.getDate(),
            birthHour: h,
            gender: formData.personal.gender === 'male' ? 'male' : 'female',
            occupation: 'general',
            livingHabits: {
              workFromHome: true,
              frequentTraveling: false,
              hasChildren: false,
              elderlyLiving: false,
              petsOwner: false,
            },
            familyStatus: 'single',
          };
        }
      } catch {}

      const res = await runComprehensiveAnalysis({
        observedAt: new Date(),
        facing: { degrees: 180 },
        includeLiunian: true,
        includePersonalization: !!userProfile,
        includeTiguaAnalysis: true,
        includeLingzheng: true,
        includeChengmenjue: true,
        includeTimeSelection: false,
        userProfile,
        config: { applyTiGua: true, applyFanGua: false },
      });
      setXuankongResult(res);
    } catch (e) {
      console.error('玄空综合分析失败', e);
    } finally {
      setXuankongLoading(false);
    }
  }, [formData]);

  // 自动触发玄空分析：当切换到玄空Tab且尚无结果时
  useEffect(() => {
    if (activeMainTab === 'xuankong' && !xuankongResult && !xuankongLoading) {
      void generateXuankong();
    }
  }, [activeMainTab, xuankongResult, xuankongLoading, generateXuankong]);

  // 后台预加载玄空分析：在八字分析完成且数据同步后自动触发（仅当有房屋信息时）
  useEffect(() => {
    if (
      hasHouseInfo &&
      isContextSynced &&
      formData?.personal &&
      !xuankongResult &&
      !xuankongLoading
    ) {
      // 延迟500ms后开始预加载，避免阻塞八字分析的渲染
      const timer = setTimeout(() => {
        void generateXuankong();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    hasHouseInfo,
    isContextSynced,
    formData,
    xuankongResult,
    xuankongLoading,
    generateXuankong,
  ]);

  // 手动同步按钮处理
  const handleManualSync = useCallback(() => {
    if (formData?.personal && analysisContext) {
      setIsContextSynced(false);
    }
  }, [formData, analysisContext]);

  // 确保客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    try {
      const sessionData = sessionStorage.getItem('analysisFormData');
      if (sessionData) {
        const data = JSON.parse(sessionData);
        setFormData(data);
        sessionStorage.removeItem('analysisFormData');
        setIsLoading(false);
        return;
      }

      const dataParam = searchParams?.get('data');
      if (dataParam) {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setFormData(data);
        setIsLoading(false);
        return;
      }

      const history = JSON.parse(localStorage.getItem('formHistory') || '[]');
      if (history.length > 0) {
        setFormData(history[0]);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }

    setIsLoading(false);
  }, [searchParams]);

  // 当 formData 加载完成后，自动同步到 AnalysisContext
  useEffect(() => {
    if (formData?.personal && analysisContext && !isContextSynced) {
      try {
        const birthDate = new Date(formData.personal.birthDate);
        const [birthHourStr] = (formData.personal.birthTime || '00:00').split(
          ':'
        );
        const birthHour = Number.parseInt(birthHourStr, 10);

        analysisContext.setUserInput({
          personal: {
            name: formData.personal.name || undefined,
            birthDate: formData.personal.birthDate,
            birthTime: formData.personal.birthTime,
            birthYear: birthDate.getFullYear(),
            birthMonth: birthDate.getMonth() + 1,
            birthDay: birthDate.getDate(),
            birthHour: Number.isNaN(birthHour) ? undefined : birthHour,
            gender: formData.personal.gender as 'male' | 'female',
          },
        });

        if (formData.analysisResult) {
          analysisContext.setAnalysisResult(formData.analysisResult);
        }

        analysisContext.activateAIChat();
        setIsContextSynced(true);
      } catch (error) {
        console.error('同步数据到上下文失败:', error);
      }
    }
  }, [formData, analysisContext, isContextSynced]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">正在加载分析报告...</p>
        </div>
      </div>
    );
  }

  if (!formData || !formData.personal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>未找到数据</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">请先填写分析表单</p>
            <Button
              onClick={() => router.push('/zh-CN/unified-form')}
              className="w-full"
            >
              返回填写表单
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 flex flex-col">
      {/* 导航栏 */}
      <Navbar scroll={true} />

      {/* 主内容区域 */}
      <div className="flex-1">
        <AIChatWithContext />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>

            {analysisContext && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                title="将当前分析数据同步到 AI 聊天，使 AI 能够基于您的数据回答问题"
              >
                <RefreshCw
                  className={`w-4 h-4 ${!isContextSynced ? 'animate-spin' : ''}`}
                />
                {isContextSynced
                  ? '数据已同步到 AI 聊天'
                  : '同步数据到 AI 聊天'}
              </Button>
            )}
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {formData.personal.name}的分析报告
            </h1>
            <p className="text-gray-600">
              {mounted ? (
                <>
                  生成时间：{new Date().toLocaleDateString('zh-CN')}{' '}
                  {new Date().toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              ) : (
                '生成时间：加载中...'
              )}
            </p>
          </div>

          {/* 房屋朝向卡片（仅在有房屋信息时显示） */}
          {hasHouseInfo && (
            <Card className="mb-6 border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5" /> 房屋朝向（二十四山）
                </CardTitle>
                <CardDescription>
                  基于您填写的角度，自动换算二十四山坐向
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div className="rounded border bg-card p-3">
                    <div className="text-muted-foreground mb-1">度数</div>
                    <div className="font-mono text-lg">{facingDeg}°</div>
                  </div>
                  <div className="rounded border bg-card p-3">
                    <div className="text-muted-foreground mb-1">朝向</div>
                    <div className="font-semibold text-lg">
                      {facingMountain?.name}（{facingMountain?.desc}）
                    </div>
                  </div>
                  <div className="rounded border bg-card p-3">
                    <div className="text-muted-foreground mb-1">坐向</div>
                    <div className="font-semibold text-lg">
                      {sittingMountain?.name}（{sittingMountain?.desc}）
                    </div>
                  </div>
                  <div className="rounded border bg-card p-3">
                    <div className="text-muted-foreground mb-1">北向基准</div>
                    <div className="font-semibold text-lg">
                      {formData?.house?.northRef === 'true'
                        ? '真北'
                        : formData?.house?.northRef === 'magnetic'
                          ? '磁北'
                          : '—'}
                    </div>
                  </div>
                  <div className="rounded border bg-card p-3">
                    <div className="text-muted-foreground mb-1">磁偏角</div>
                    <div className="font-mono text-lg">
                      {typeof formData?.house?.declination !== 'undefined' &&
                      formData?.house?.declination !== null &&
                      formData?.house?.declination !== ''
                        ? `${Number(formData.house.declination).toFixed(1)}°`
                        : '—'}
                    </div>
                  </div>
                  <div className="rounded border bg-card p-3 md:col-span-2 col-span-2">
                    <div className="text-muted-foreground mb-1">坐朝文案</div>
                    <div className="font-semibold">
                      坐{sittingMountain?.name}（{sittingMountain?.desc}）朝
                      {facingMountain?.name}（{facingMountain?.desc}）
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 核心价值提示卡片（仅在有房屋信息时显示） */}
          {hasHouseInfo && (
            <Card className="mb-6 border-2 border-gradient bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Zap className="w-5 h-5" />
                  为什么需要结合八字做风水分析？
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        个性化匹配
                      </h4>
                      <p className="text-sm text-gray-600">
                        根据您的八字五行喜忌，推荐最适合您的风水布局
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        命理协同
                      </h4>
                      <p className="text-sm text-gray-600">
                        风水布局与您的命格相配合，事半功倍
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        避免冲突
                      </h4>
                      <p className="text-sm text-gray-600">
                        避免使用与您命理相冲的风水布局方案
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 顶层：并列两个Tab（八字 / 玄空飞星增强版）*/}
          {/* 如果没有房屋信息，隐藏 Tabs，直接显示八字分析 */}
          {!hasHouseInfo ? (
            // 仅八字分析（无Tab）
            <div className="space-y-6">
              <Card className="mb-6 border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">姓名</p>
                      <p className="font-medium">{formData.personal.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">性别</p>
                      <p className="font-medium">
                        {formData.personal.gender === 'male' ? '男' : '女'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">出生日期</p>
                      <p className="font-medium">
                        {formData.personal.birthDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">出生时间</p>
                      <p className="font-medium">
                        {formData.personal.birthTime}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {personalData ? (
                <BaziAnalysisPage
                  birthData={{
                    ...personalData,
                    name: formData.personal.name,
                    location: formData.personal.birthCity,
                  }}
                  onAnalysisComplete={handleBaziAnalysisComplete}
                  isPremium={session?.user?.id ? true : false}
                  creditsAvailable={creditsAvailable}
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">
                      无法加载八字分析，请检查出生信息是否完整。
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // 八字 + 风水组合分析（有Tab）
            <Tabs
              value={activeMainTab}
              onValueChange={(v) => setActiveMainTab(v as any)}
              className="space-y-6"
            >
              <TabsList className="grid grid-cols-3 h-auto p-1 bg-white/80 backdrop-blur">
                <TabsTrigger value="bazi">八字专业报告</TabsTrigger>
                <TabsTrigger value="xuankong">玄空飞星（增强版）</TabsTrigger>
                <TabsTrigger value="integrated">
                  <Sparkles className="w-4 h-4 mr-1" />
                  整合建议
                </TabsTrigger>
              </TabsList>

              {/* 八字 Tab */}
              <TabsContent value="bazi" className="space-y-6">
                <Card className="mb-6 border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <CardTitle>基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">姓名</p>
                        <p className="font-medium">{formData.personal.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">性别</p>
                        <p className="font-medium">
                          {formData.personal.gender === 'male' ? '男' : '女'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">出生日期</p>
                        <p className="font-medium">
                          {formData.personal.birthDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">出生时间</p>
                        <p className="font-medium">
                          {formData.personal.birthTime}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {personalData ? (
                  <BaziAnalysisPage
                    birthData={{
                      ...personalData,
                      name: formData.personal.name,
                      location: formData.personal.birthCity,
                    }}
                    onAnalysisComplete={handleBaziAnalysisComplete}
                    isPremium={session?.user?.id ? true : false}
                    creditsAvailable={creditsAvailable}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-600">
                        无法加载八字分析，请检查出生信息是否完整。
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* 玄空飞星增强版 Tab */}
              <TabsContent value="xuankong" className="space-y-6">
                <Card className="border-2 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100">
                    <CardTitle>玄空飞星综合分析（增强版）</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <EnhancedComprehensivePanel
                      analysisResult={xuankongResult}
                      isLoading={xuankongLoading}
                      onRefresh={generateXuankong}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 整合建议 Tab */}
              <TabsContent value="integrated" className="space-y-6">
                <Card className="border-2 border-gradient shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      八字与风水的完美结合
                    </CardTitle>
                    <CardDescription>
                      综合您的命理与居住环境，提供最佳优化方案
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {baziResult && xuankongResult ? (
                      <div className="space-y-6">
                        {/* 五行匹配建议 */}
                        <div className="bg-white rounded-lg p-6 shadow-md">
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Home className="w-5 h-5 text-purple-600" />
                            五行能量平衡方案
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(baziResult.favorableElements) &&
                              baziResult.favorableElements.map(
                                (element: string) => {
                                  const mapping =
                                    wuxingMapping[
                                      element as keyof typeof wuxingMapping
                                    ];
                                  if (!mapping) return null;

                                  return (
                                    <div
                                      key={element}
                                      className="border-2 border-green-200 rounded-lg p-4 bg-green-50"
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">
                                          {mapping.element}
                                        </span>
                                        <h4 className="font-semibold text-green-900">
                                          强化{mapping.name}能量（喜用神）
                                        </h4>
                                      </div>
                                      <p className="text-sm text-green-800 mb-2">
                                        {mapping.description}
                                      </p>
                                      <p className="text-xs text-green-700">
                                        推荐方位：{mapping.direction.join('、')}
                                      </p>
                                    </div>
                                  );
                                }
                              )}

                            {Array.isArray(baziResult.unfavorableElements) &&
                              baziResult.unfavorableElements.map(
                                (element: string) => {
                                  const mapping =
                                    wuxingMapping[
                                      element as keyof typeof wuxingMapping
                                    ];
                                  if (!mapping) return null;

                                  return (
                                    <div
                                      key={element}
                                      className="border-2 border-red-200 rounded-lg p-4 bg-red-50"
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">
                                          {mapping.element}
                                        </span>
                                        <h4 className="font-semibold text-red-900">
                                          避免{mapping.name}能量（忌神）
                                        </h4>
                                      </div>
                                      <p className="text-sm text-red-800 mb-2">
                                        减少{mapping.color}色装饰，避免过多
                                        {mapping.name}属性物品
                                      </p>
                                      <p className="text-xs text-red-700">
                                        注意方位：{mapping.direction.join('、')}
                                      </p>
                                    </div>
                                  );
                                }
                              )}

                            {/* 如果没有五行数据，显示提示 */}
                            {!Array.isArray(baziResult.favorableElements) &&
                              !Array.isArray(
                                baziResult.unfavorableElements
                              ) && (
                                <div className="col-span-full text-center py-8">
                                  <p className="text-gray-600">
                                    八字分析结果中没有五行喜忌信息
                                  </p>
                                  <p className="text-sm text-gray-500 mt-2">
                                    请稍后再试或重新进行八字分析
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* 行动建议 */}
                        <div className="bg-white rounded-lg p-6 shadow-md">
                          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            立即可执行的优化步骤
                          </h3>
                          <ol className="space-y-3">
                            <li className="flex items-start gap-3">
                              <Badge className="mt-1">1</Badge>
                              <div>
                                <p className="font-medium">
                                  根据八字喜用神调整主卧颜色
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  选择与您喜用神相对应的色系进行装饰
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <Badge className="mt-1">2</Badge>
                              <div>
                                <p className="font-medium">
                                  在吉位摆放对应五行的物品
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  结合风水飞星吉位与您的喜用神，放置相应元素
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <Badge className="mt-1">3</Badge>
                              <div>
                                <p className="font-medium">
                                  避开凶位与忌神的组合
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  减少在凶位使用与您忌神相关的颜色和物品
                                </p>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                        <p className="text-gray-600">
                          正在生成个性化整合建议...
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          请先完成八字分析和玄空风水分析
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
