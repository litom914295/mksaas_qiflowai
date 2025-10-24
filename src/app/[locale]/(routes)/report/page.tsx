'use client';

import { BaziAnalysisPage } from '@/components/bazi/analysis/bazi-analysis-page';
import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
import { EnhancedComprehensivePanel } from '@/components/qiflow/xuankong/enhanced-comprehensive-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisContext } from '@/contexts/analysis-context';
import { useCreditBalance } from '@/hooks/use-credits';
import { authClient } from '@/lib/auth-client';
import {
  type ComprehensiveAnalysisResult,
  runComprehensiveAnalysis,
} from '@/lib/qiflow/xuankong/comprehensive-engine';
import { ArrowLeft, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const [activeMainTab, setActiveMainTab] = useState<'bazi' | 'xuankong'>(
    'bazi'
  );
  const [xuankongLoading, setXuankongLoading] = useState(false);
  const [xuankongResult, setXuankongResult] =
    useState<ComprehensiveAnalysisResult | null>(null);

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

  // 八字分析完成回调（使用useCallback确保稳定性）
  const handleBaziAnalysisComplete = useCallback(
    (baziResult: any) => {
      if (!baziResult || !analysisContext || isContextSynced) return;

      try {
        const comprehensiveResult = {
          basic: {
            yuanPan: {
              period: 9,
              years: '2024-2043',
              sitting: baziResult.pillars?.year?.branch || '未知',
              facing: baziResult.pillars?.day?.branch || '未知',
            },
          },
          pillars: baziResult.pillars,
          elements: baziResult.elements,
          yongshen: baziResult.yongshen?.primary,
          pattern: baziResult.pattern?.primary?.name,
          scoring: baziResult.scoring
            ? {
                overall: {
                  score: baziResult.scoring.overall?.score || 75,
                  level: baziResult.scoring.overall?.level || '中等',
                  dimensions: [
                    {
                      dimension: 'health',
                      score: baziResult.scoring.health || 75,
                    },
                    {
                      dimension: 'wealth',
                      score: baziResult.scoring.wealth || 75,
                    },
                    {
                      dimension: 'relationship',
                      score: baziResult.scoring.relationship || 75,
                    },
                    {
                      dimension: 'career',
                      score: baziResult.scoring.career || 75,
                    },
                  ],
                },
              }
            : undefined,
          insights:
            baziResult.insights?.map((insight: any) => ({
              title: insight.category || '重要发现',
              description: insight.content || insight.message || '无描述',
              impact: insight.importance || 'medium',
            })) || [],
          warnings:
            baziResult.warnings?.map((warning: any) => ({
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

      const dataParam = searchParams.get('data');
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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 py-8">
      <AIChatWithContext />

      <div className="container mx-auto px-4">
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
              {isContextSynced ? '数据已同步到 AI 聊天' : '同步数据到 AI 聊天'}
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
                    <p className="font-medium">{formData.personal.birthDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">出生时间</p>
                    <p className="font-medium">{formData.personal.birthTime}</p>
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
            <TabsList className="grid grid-cols-2 h-auto p-1 bg-white/80 backdrop-blur">
              <TabsTrigger value="bazi">八字专业报告</TabsTrigger>
              <TabsTrigger value="xuankong">玄空飞星（增强版）</TabsTrigger>
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
          </Tabs>
        )}
      </div>
    </div>
  );
}
