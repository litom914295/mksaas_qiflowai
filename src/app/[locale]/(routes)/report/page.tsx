'use client';

import { BaziAnalysisPage } from '@/components/bazi/analysis/bazi-analysis-page';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
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
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  Compass,
  Crown,
  Download,
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
import dynamic from 'next/dynamic';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

// 动态导入玄空面板与AI聊天，避免首屏打包体积过大
const EnhancedComprehensivePanel = dynamic(
  () => import('@/components/qiflow/xuankong/enhanced-comprehensive-panel').then(m => ({ default: m.EnhancedComprehensivePanel })),
  { 
    ssr: false,
    loading: () => (
      <div className="p-6 space-y-4">
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }
);

const AIChatWithContext = dynamic(
  () => import('@/components/qiflow/ai-chat-with-context').then(m => ({ default: m.AIChatWithContext })),
  { ssr: false }
);
import { toast } from 'sonner';

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

  // 智能后台预加载玄空分析：在八字分析完成后自动开始
  useEffect(() => {
    if (
      hasHouseInfo &&
      baziResult && // 等待八字分析完成
      !xuankongResult &&
      !xuankongLoading
    ) {
      // 延迟2秒后开始后台预加载，给八字结果渲染时间
      console.log('✨ 八字分析完成,准备后台预加载玄空分析...');
      const timer = setTimeout(() => {
        console.log('🚀 开始后台预加载玄空分析');
        void generateXuankong();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    hasHouseInfo,
    baziResult, // 依赖八字分析结果
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

  // 导出v2.2专业报告（HTML下载）
  const handleExportReport = useCallback(async () => {
    const toastId = toast.loading('正在生成专业报告...');
    try {
      const payload = {
        type: hasHouseInfo ? 'combined' as const : 'bazi' as const,
        format: 'html' as const,
        data: {
          bazi: baziResult || null,
          fengshui: xuankongResult || null,
        },
        inputs: {
          name: formData?.personal?.name,
          gender: formData?.personal?.gender,
          birthDate: formData?.personal?.birthDate,
          birthTime: formData?.personal?.birthTime || '00:00',
          birthCity: formData?.personal?.birthCity || '',
          fengshuiInput: {
            facing: hasHouseInfo ? formData?.house?.direction || '' : '',
            facingDeg: hasHouseInfo ? formData?.house?.directionDegree || 0 : 0,
            period: 9,
          },
        },
        options: {
          template: 'professional-v2.2',
          includeCharts: true,
          includeRecommendations: true,
          language: 'zh-CN',
          watermark: 'QiFlow Pro',
        },
      };

      const res = await fetch('/api/report/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || '导出失败');
      }

      // 期望返回HTML内容
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${formData?.personal?.name || '报告'}_专业版_${new Date()
        .toISOString()
        .slice(0, 10)}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success('报告已生成并下载', { id: toastId });
    } catch (e) {
      console.error('导出失败:', e);
      toast.error('导出失败，请稍后重试', { id: toastId });
    }
  }, [hasHouseInfo, baziResult, xuankongResult, formData]);

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
        <Suspense fallback={null}>
          <AIChatWithContext />
        </Suspense>

        <div className="container mx-auto px-4 py-8">
          {/* 顶部操作栏 */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>

            {/* 右侧操作按钮组 */}
            <div className="flex items-center gap-3">
              {/* 积分状态 */}
              {session?.user?.id ? (
                <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  专业版
                </Badge>
              ) : creditsAvailable > 0 ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-300"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  积分: {creditsAvailable}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-300"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  积分已用完
                </Badge>
              )}

              {/* 生成并预览 v2.2 专业报告 */}
              {activeMainTab === 'integrated' && (
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/reports/v2-2/generate', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            personal: {
                              name: formData?.personal?.name,
                              gender: formData?.personal?.gender,
                              birthDate: formData?.personal?.birthDate,
                              birthTime: formData?.personal?.birthTime,
                              birthCity: formData?.personal?.birthCity,
                            },
                            house: hasHouseInfo ? formData?.house : undefined,
                            userContext: {},
                          }),
                        });
                        const json = await res.json();
                        if (json?.viewUrl) {
                          window.open(json.viewUrl, '_blank');
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                  >
                    生成专业报告
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportReport}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    导出专业报告
                  </Button>
                </div>
              )}

              {/* 升级按钮 */}
              {!session?.user?.id && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={() => router.push('/settings/credits')}
                >
                  <ArrowUp className="w-4 h-4 mr-1" />
                  升级专业版
                </Button>
              )}

              {/* AI同步按钮 */}
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
          </div>

          {/* 标题区 */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {formData.personal.name}的分析报告
            </h1>
            {/* 出生信息 */}
            <div className="text-sm text-gray-600 mb-2">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span>
                  性别：{formData.personal.gender === 'male' ? '男' : '女'}
                </span>
                <span className="text-gray-400">|</span>
                <span>
                  阳历：{formData.personal.birthDate}{' '}
                  {formData.personal.birthTime || '00:00'}
                </span>
                {formData.personal.birthCity && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span>出生地：{formData.personal.birthCity}</span>
                  </>
                )}
                {hasHouseInfo && (
                  <>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3 h-3" />坐{sittingMountain?.name}（
                      {sittingMountain?.desc}）朝{facingMountain?.name}（
                      {facingMountain?.desc}）
                    </span>
                  </>
                )}
              </div>
            </div>
            {/* 生成时间 */}
            <div className="text-xs text-gray-500">
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
            </div>
          </div>

          {/* 顶层：并列两个Tab（八字 / 玄空飞星增强版）*/}
          {!hasHouseInfo ? (
            <div className="space-y-6">
              {personalData ? (
                <Suspense
                  fallback={
                    <div className="p-6 space-y-4">
                      <div className="h-32 animate-pulse rounded-lg bg-muted" />
                      <div className="h-48 animate-pulse rounded-lg bg-muted" />
                    </div>
                  }
                >
                  <BaziAnalysisPage
                    birthData={{
                      ...personalData,
                      name: formData.personal.name,
                      location: formData.personal.birthCity,
                    }}
                    onAnalysisComplete={handleBaziAnalysisComplete}
                    isPremium={!!session?.user?.id}
                    creditsAvailable={creditsAvailable}
                  />
                </Suspense>
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
            <Tabs
              value={activeMainTab}
              onValueChange={(v) => setActiveMainTab(v as any)}
              className="space-y-4"
            >
              <TabsList className="grid grid-cols-3 h-auto p-1 bg-white/80 backdrop-blur">
                <TabsTrigger value="bazi">八字专业报告</TabsTrigger>
                <TabsTrigger value="xuankong">玄空风水分析</TabsTrigger>
                <TabsTrigger value="integrated">
                  <Sparkles className="w-4 h-4 mr-1" />
                  整合建议
                </TabsTrigger>
              </TabsList>

              {/* 八字 Tab */}
              <TabsContent value="bazi" className="space-y-6">
                {personalData ? (
                  <Suspense fallback={
                    <div className="p-6 space-y-4">
                      <div className="h-32 animate-pulse rounded-lg bg-muted" />
                      <div className="h-48 animate-pulse rounded-lg bg-muted" />
                    </div>
                  }>
                    <BaziAnalysisPage
                    birthData={{
                      ...personalData,
                      name: formData.personal.name,
                      location: formData.personal.birthCity,
                    }}
                    onAnalysisComplete={handleBaziAnalysisComplete}
                    isPremium={!!session?.user?.id}
                    creditsAvailable={creditsAvailable}
                  />
                  </Suspense>
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

              {/* 玄空风水 Tab */}
              <TabsContent value="xuankong" className="space-y-4">
                <EnhancedComprehensivePanel
                  analysisResult={xuankongResult}
                  isLoading={xuankongLoading}
                  onRefresh={generateXuankong}
                />
              </TabsContent>

              {/* 整合建议 Tab */}
              <TabsContent value="integrated" className="space-y-4">
                <div className="space-y-4">
                  {/* 总体评估卡片 */}
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        命理与风水综合评估
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {baziResult ? '85' : '—'}
                          </div>
                          <div className="text-sm text-gray-600">
                            命理契合度
                          </div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {xuankongResult ? '78' : '—'}
                          </div>
                          <div className="text-sm text-gray-600">
                            风水适配度
                          </div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-purple-600 mb-1">
                            {baziResult && xuankongResult ? '82' : '—'}
                          </div>
                          <div className="text-sm text-gray-600">
                            综合运势指数
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>总体评价：</strong>
                          {baziResult && xuankongResult
                            ? '您的命理与居住环境整体匹配良好，通过适当调整可进一步提升运势。'
                            : '请先完成八字和风水分析，以获得综合评估。'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {baziResult || xuankongResult ? (
                    <>
                      {/* 空间布局建议 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Home className="w-5 h-5 text-purple-600" />
                            个性化空间布局建议
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 border-l-4 border-green-500 bg-green-50">
                              <h4 className="font-semibold text-green-900 mb-2">
                                财位布局
                              </h4>
                              <p className="text-sm text-gray-700 mb-2">
                                根据您的八字，财位在
                                {hasHouseInfo ? '东南方' : '家中东南方'}。
                              </p>
                              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                <li>• 摆放绿色植物或水晶</li>
                                <li>• 保持该区域明亮整洁</li>
                                <li>• 可放置金蟾或招财猫</li>
                              </ul>
                            </div>

                            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
                              <h4 className="font-semibold text-blue-900 mb-2">
                                事业位布局
                              </h4>
                              <p className="text-sm text-gray-700 mb-2">
                                您的事业位在
                                {hasHouseInfo ? '正北方' : '家中正北方'}
                                ，建议强化该区域。
                              </p>
                              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                <li>• 设置书桌或办公区域</li>
                                <li>• 摆放文昌塔或毛笔</li>
                                <li>• 使用蓝色或黑色装饰</li>
                              </ul>
                            </div>

                            <div className="p-4 border-l-4 border-pink-500 bg-pink-50">
                              <h4 className="font-semibold text-pink-900 mb-2">
                                桃花位布局
                              </h4>
                              <p className="text-sm text-gray-700 mb-2">
                                感情运势位在
                                {hasHouseInfo ? '西南方' : '家中西南方'}。
                              </p>
                              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                                <li>• 摆放粉色水晶或鲜花</li>
                                <li>• 保持该区域温馨浪漫</li>
                                <li>• 避免摆放尖锐物品</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 五行平衡方案 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-600" />
                            五行能量平衡方案
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 喜用五行 */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-green-800">
                                ✨ 增强喜用五行
                              </h4>
                              {['木', '火'].map((element) => {
                                const mapping =
                                  wuxingMapping[
                                    element === '木' ? 'wood' : 'fire'
                                  ];
                                return (
                                  <div
                                    key={element}
                                    className="p-3 bg-green-50 rounded-lg border border-green-200"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xl">
                                        {mapping.element}
                                      </span>
                                      <span className="font-medium">
                                        {mapping.name}元素
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      {mapping.description}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* 忌用五行 */}
                            <div className="space-y-3">
                              <h4 className="font-semibold text-red-800">
                                ⚠️ 减少忌用五行
                              </h4>
                              {['金', '水'].map((element) => {
                                const mapping =
                                  wuxingMapping[
                                    element === '金' ? 'metal' : 'water'
                                  ];
                                return (
                                  <div
                                    key={element}
                                    className="p-3 bg-red-50 rounded-lg border border-red-200"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xl">
                                        {mapping.element}
                                      </span>
                                      <span className="font-medium">
                                        {mapping.name}元素
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      避免过多{mapping.color}色，减少
                                      {mapping.name}属性装饰
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 时间运势指导 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-600" />
                            流年运势与化解建议
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">
                                  2024年运势重点
                                </h4>
                                <Badge variant="outline">甲辰年</Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-green-700">
                                    ✅ 有利月份：
                                  </span>
                                  <p className="text-gray-600">
                                    3月、7月、11月
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-orange-700">
                                    ⚡ 注意月份：
                                  </span>
                                  <p className="text-gray-600">5月、9月</p>
                                </div>
                                <div>
                                  <span className="font-medium text-blue-700">
                                    🎯 重点方向：
                                  </span>
                                  <p className="text-gray-600">
                                    事业发展、人际关系
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 border rounded-lg">
                                <h5 className="font-medium mb-2 text-sm">
                                  💰 财运提升
                                </h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• 佩戴黄水晶或琥珀</li>
                                  <li>• 办公桌放置貔貅朝外</li>
                                  <li>• 钱包选用棕色或黄色</li>
                                </ul>
                              </div>
                              <div className="p-3 border rounded-lg">
                                <h5 className="font-medium mb-2 text-sm">
                                  🛡️ 化解小人
                                </h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• 办公室摆放仙人掌</li>
                                  <li>• 佩戴黑曜石手链</li>
                                  <li>• 避免背对门窗而坐</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 行动计划 */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600" />
                            30天改运行动计划
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ol className="space-y-3">
                            <li className="flex items-start gap-3">
                              <Badge className="mt-1 bg-blue-100 text-blue-700">
                                第1周
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">
                                  环境清理与能量净化
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  清理杂物，特别是
                                  {hasHouseInfo ? '东南财位' : '财位'}
                                  区域，点香薰或使用海盐净化空间
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <Badge className="mt-1 bg-blue-100 text-blue-700">
                                第2周
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">五行元素调整</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  根据喜用神添加对应颜色装饰，调整家具摆放方向
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <Badge className="mt-1 bg-blue-100 text-blue-700">
                                第3周
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">吉祥物品布置</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  在对应方位摆放开运物品，如水晶、植物、风水轮等
                                </p>
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <Badge className="mt-1 bg-blue-100 text-blue-700">
                                第4周
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">
                                  习惯养成与能量维护
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  保持空间整洁，定期更换鲜花，维持正能量循环
                                </p>
                              </div>
                            </li>
                          </ol>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                          <p className="text-gray-600">
                            正在生成个性化整合建议...
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            请先完成八字分析和玄空风水分析
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
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
