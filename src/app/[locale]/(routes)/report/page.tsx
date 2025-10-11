'use client';

import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
import { BaziAnalysisResult } from '@/components/qiflow/analysis/bazi-analysis-result';
import { ReportFengshuiAnalysis } from '@/components/qiflow/analysis/report-fengshui-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Compass, Loader2, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnalysisContext } from '@/contexts/analysis-context';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const analysisContext = useAnalysisContext();
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isContextSynced, setIsContextSynced] = useState(false);

  // 使用 useMemo 生成稳定的 sessionId，避免 hydration 错误
  const sessionId = useMemo(() => `fengshui_${Date.now()}`, []);
  
  // 在组件顶层定义所有Hook，避免条件渲染影响
  // 使用 useMemo 稳定 birthData 对象，避免不必要的重新渲染
  const birthData = useMemo(() => {
    if (!formData?.personal) return null;
    return {
      datetime: `${formData.personal.birthDate}T${formData.personal.birthTime}`,
      gender: formData.personal.gender as 'male' | 'female',
      timezone: 'Asia/Shanghai',
      isTimeKnown: true,
    };
  }, [formData?.personal?.birthDate, formData?.personal?.birthTime, formData?.personal?.gender]);
  
  // 八字分析完成回调（使用useCallback确保稳定性）
  const handleBaziAnalysisComplete = useCallback((baziResult: any) => {
    if (baziResult && analysisContext) {
      console.log('📢 [Report Page] 八字分析完成，正在同步结果...');
      
      try {
        // 将八字分析结果传递给AnalysisContext
        // 将EnhancedBaziResult转换为ComprehensiveAnalysisResult格式
        const comprehensiveResult = {
          basic: {
            yuanPan: {
              period: 9, // 九运
              years: '2024-2043',
              sitting: baziResult.pillars?.year?.branch || '未知',
              facing: baziResult.pillars?.day?.branch || '未知'
            }
          },
          pillars: baziResult.pillars,
          elements: baziResult.elements,
          yongshen: baziResult.yongshen?.primary,
          pattern: baziResult.pattern?.primary?.name,
          scoring: baziResult.scoring ? {
            overall: {
              score: baziResult.scoring.overall?.score || 75,
              level: baziResult.scoring.overall?.level || '中等',
              dimensions: [
                { dimension: 'health', score: baziResult.scoring.health || 75 },
                { dimension: 'wealth', score: baziResult.scoring.wealth || 75 },
                { dimension: 'relationship', score: baziResult.scoring.relationship || 75 },
                { dimension: 'career', score: baziResult.scoring.career || 75 },
              ]
            }
          } : undefined,
          insights: {
            keyFindings: baziResult.insights?.map((insight: any) => ({
              title: insight.category || '重要发现',
              description: insight.content || insight.message || '无描述',
              impact: insight.importance || 'medium'
            })) || [],
            criticalLocations: []
          },
          warnings: baziResult.warnings?.map((warning: any) => ({
            category: warning.category || '通用',
            title: warning.title || '需要注意',
            severity: warning.severity || 'medium'
          })) || []
        };
        
        analysisContext.setAnalysisResult(comprehensiveResult as any);
        console.log('✅ [Report Page] 八字分析结果已同步到AI上下文');
      } catch (error) {
        console.error('❌ [Report Page] 同步八字分析结果失败:', error);
      }
    }
  }, [analysisContext]);
  
  // 手动同步按钮处理
  const handleManualSync = useCallback(() => {
    if (formData && formData.personal && analysisContext) {
      console.log('🔄 [Report Page] 手动触发数据同步...');
      setIsContextSynced(false); // 重置状态以触发 useEffect
    }
  }, [formData, analysisContext]);

  // 确保客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dataParam = searchParams.get('data');

    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setFormData(data);
      } catch (error) {
        console.error('解析数据失败:', error);
      }
    } else {
      try {
        const history = JSON.parse(localStorage.getItem('formHistory') || '[]');
        if (history.length > 0) {
          setFormData(history[0]);
        }
      } catch (error) {
        console.error('从localStorage加载失败:', error);
      }
    }

    setIsLoading(false);
  }, [searchParams]);

  // 当 formData 加载完成后，自动同步到 AnalysisContext
  useEffect(() => {
    if (formData && formData.personal && analysisContext && !isContextSynced) {
      console.log('📊 [Report Page] 检测到分析数据，开始同步到 AI 聊天上下文...');
      
      try {
        // 解析出生日期和时间
        const birthDate = new Date(formData.personal.birthDate);
        const [birthHourStr] = (formData.personal.birthTime || '00:00').split(':');
        const birthHour = parseInt(birthHourStr, 10);

        // 解析房屋信息（如果有）
        const hasHouseInfo = formData.house?.direction;
        const houseFacing = hasHouseInfo ? parseInt(formData.house.direction, 10) || 180 : 180;
        const buildYear = new Date().getFullYear();

        // 设置用户输入数据
        analysisContext.setUserInput({
          personal: {
            name: formData.personal.name || undefined,
            birthDate: formData.personal.birthDate,
            birthTime: formData.personal.birthTime,
            birthYear: birthDate.getFullYear(),
            birthMonth: birthDate.getMonth() + 1,
            birthDay: birthDate.getDate(),
            birthHour: isNaN(birthHour) ? undefined : birthHour,
            gender: formData.personal.gender as 'male' | 'female',
          },
          house: {
            direction: formData.house?.direction,
            facing: houseFacing,
            buildYear: buildYear,
          },
        });

        // 如果有分析结果，也设置上去
        if (formData.analysisResult) {
          analysisContext.setAnalysisResult(formData.analysisResult);
          console.log('📋 [Report Page] 分析结果也已同步');
        }

        // 激活 AI 聊天上下文
        analysisContext.activateAIChat();
        setIsContextSynced(true);
        
        console.log('✅ [Report Page] 数据已成功同步到 AI 聊天上下文');
        console.log('📊 用户输入:', analysisContext.userInput);
        console.log('📈 分析结果存在:', !!analysisContext.analysisResult);
      } catch (error) {
        console.error('❌ [Report Page] 同步数据到上下文失败:', error);
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

  // birthData 已经在组件顶部定义

  // 检查房屋朝向是否有效（不是空字符串且可以转换为数字）
  const houseDirection = formData.house?.direction;
  const hasHouseDirection = houseDirection && !isNaN(Number.parseInt(houseDirection));
  
  const houseInfo = hasHouseDirection
    ? {
        sittingDirection: getChineseDirection(
          Number.parseInt(houseDirection)
        ),
        facingDirection: getChineseDirection(
          (Number.parseInt(houseDirection) + 180) % 360
        ),
        period: 9,
        buildingYear: new Date().getFullYear(),
      }
    : {
        sittingDirection: '北',
        facingDirection: '南',
        period: 9,
        buildingYear: new Date().getFullYear(),
      };

  // handleBaziAnalysisComplete 和 handleManualSync 已经在组件顶部定义

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
          
          {/* 手动同步按钮 */}
          {analysisContext && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
              title="将当前分析数据同步到 AI 聊天，使 AI 能够基于您的数据回答问题"
            >
              <RefreshCw className={`w-4 h-4 ${!isContextSynced ? 'animate-spin' : ''}`} />
              {isContextSynced ? '数据已同步到 AI 聊天' : '同步数据到 AI 聊天'}
            </Button>
          )}
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {formData.personal.name}的命理风水分析
          </h1>
          <p className="text-gray-600">
            {mounted && (
              <>
                生成时间：{new Date().toLocaleDateString('zh-CN')}{' '}
                {new Date().toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            )}
            {!mounted && '生成时间：加载中...'}
          </p>
        </div>

        {/* 基本信息卡片 */}
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

        {/* 分析标签页 */}
        <Tabs defaultValue="bazi" className="space-y-6">
          <TabsList
            className={`grid w-full ${hasHouseDirection ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            <TabsTrigger
              value="bazi"
              className="flex items-center justify-center gap-2 py-3"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">八字命理分析</span>
              <span className="sm:hidden">八字</span>
            </TabsTrigger>
            {hasHouseDirection && (
              <TabsTrigger
                value="fengshui"
                className="flex items-center justify-center gap-2 py-3"
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">风水布局分析</span>
                <span className="sm:hidden">风水</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="bazi">
            {birthData ? (
              <BaziAnalysisResult 
                birthData={birthData} 
                onAnalysisComplete={handleBaziAnalysisComplete}
              />
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-600">无法加载八字分析，请检查出生信息是否完整。</p>
              </div>
            )}
          </TabsContent>

          {hasHouseDirection && (
            <TabsContent value="fengshui">
              <ReportFengshuiAnalysis houseInfo={houseInfo} />
            </TabsContent>
          )}
        </Tabs>

        {!hasHouseDirection && (
          <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-blue-900 font-semibold mb-2">
                  💡 想获得更准确的风水分析？
                </p>
                <p className="text-blue-800 mb-4">
                  您尚未填写房屋朝向信息，补充后可获得专业风水分析
                </p>
                <Button
                  onClick={() => router.push('/zh-CN/unified-form')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  补充房屋信息
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getChineseDirection(degree: number): string {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}
