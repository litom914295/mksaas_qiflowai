'use client';

import { AIMasterChatButton } from '@/components/qiflow/ai-master-chat-button';
import BaziAnalysisResult from '@/components/qiflow/analysis/bazi-analysis-result';
import { ComprehensiveAnalysisPanel } from '@/components/qiflow/xuankong/comprehensive-analysis-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import { adaptToFrontend } from '@/lib/qiflow/unified/adapters/frontend-adapter';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  ArrowLeft,
  Calendar,
  Compass,
  Heart,
  Home,
  Loader2,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// 方位转角度映射
const directionToDegrees: Record<string, number> = {
  北: 0,
  东北: 45,
  东: 90,
  东南: 135,
  南: 180,
  西南: 225,
  西: 270,
  西北: 315,
};

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

export default function EnhancedReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [fengshuiAnalysis, setFengshuiAnalysis] =
    useState<ComprehensiveAnalysisResult | null>(null);
  const [isFengshuiLoading, setIsFengshuiLoading] = useState(false);
  const [baziResult, setBaziResult] = useState<any>(null);

  const sessionId = useMemo(() => `enhanced_${Date.now()}`, []);

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

  // 执行风水分析
  useEffect(() => {
    async function performFengshuiAnalysis() {
      if (!formData?.house?.direction || !baziResult) return;

      try {
        setIsFengshuiLoading(true);
        const facingDegrees = Number.parseInt(formData.house.direction);

        console.log('[个性化风水] 开始分析，结合八字信息:', {
          direction: facingDegrees,
          baziElement: baziResult?.dayMaster?.element,
        });

        // 使用统一分析引擎
        const engine = new UnifiedFengshuiEngine();
        const birthDate = new Date(formData.personal.birthDate);

        // 构建八字信息：始终提供有效的 UnifiedBaziInfo 对象
        const baziInfo = {
          birthYear: birthDate.getFullYear(),
          birthMonth: birthDate.getMonth() + 1,
          birthDay: birthDate.getDate(),
          gender: formData.personal.gender as 'male' | 'female',
          // 如果有八字结果，添加额外信息
          dayMaster: baziResult?.dayMaster?.element,
          favorableElements: baziResult?.favorableElements || [],
          unfavorableElements: baziResult?.unfavorableElements || [],
        };

        const unifiedResult = await engine.analyze({
          house: {
            facing: facingDegrees,
            period: 9, // 默认九运
            buildYear: formData.house?.buildingYear || new Date().getFullYear(),
          },
          bazi: baziInfo,
          time: {
            currentYear: new Date().getFullYear(),
            currentMonth: new Date().getMonth() + 1,
            currentDay: new Date().getDate(),
          },
          options: {
            includeLiunian: true,
            includePersonalization: true,
            includeTigua: true,
            includeLingzheng: true,
            includeChengmenjue: true,
            depth: 'comprehensive',
          },
        });

        // 使用适配器转换为前端格式
        const result = adaptToFrontend(unifiedResult);

        setFengshuiAnalysis(result);
      } catch (err) {
        console.error('[个性化风水] 分析失败:', err);
      } finally {
        setIsFengshuiLoading(false);
      }
    }

    performFengshuiAnalysis();
  }, [formData, baziResult]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">正在加载分析报告...</p>
        </div>
      </div>
    );
  }

  if (!formData || !formData.personal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Card className="max-w-md w-full shadow-xl">
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

  const birthData = {
    datetime: `${formData.personal.birthDate}T${formData.personal.birthTime}`,
    gender: formData.personal.gender as 'male' | 'female',
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  const hasHouseInfo = formData.house?.direction;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
      <AIMasterChatButton />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
        </div>

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              {formData.personal.name}的命理风水综合分析
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            {mounted && (
              <>
                生成时间：{new Date().toLocaleDateString('zh-CN')}{' '}
                {new Date().toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            )}
          </p>
          {hasHouseInfo && (
            <Badge className="mt-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              个性化风水分析版
            </Badge>
          )}
        </div>

        {/* 基本信息卡片 */}
        <Card className="mb-8 border-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">姓名</p>
                <p className="font-medium text-lg">{formData.personal.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">性别</p>
                <p className="font-medium text-lg">
                  {formData.personal.gender === 'male' ? '男' : '女'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">出生日期</p>
                <p className="font-medium text-lg">
                  {formData.personal.birthDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">出生时间</p>
                <p className="font-medium text-lg">
                  {formData.personal.birthTime}
                </p>
              </div>
            </div>
            {formData.personal.birthCity && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">出生地</p>
                <p className="font-medium">{formData.personal.birthCity}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 核心价值提示 */}
        {hasHouseInfo && (
          <Card className="mb-8 border-2 border-gradient bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
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

        {/* 分析标签页 */}
        <Tabs defaultValue="bazi" className="space-y-6">
          <TabsList
            className={`grid w-full ${hasHouseInfo ? 'grid-cols-3' : 'grid-cols-1'}`}
          >
            <TabsTrigger
              value="bazi"
              className="flex items-center justify-center gap-2 py-3"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">八字命理</span>
              <span className="sm:hidden">八字</span>
            </TabsTrigger>
            {hasHouseInfo && (
              <>
                <TabsTrigger
                  value="fengshui"
                  className="flex items-center justify-center gap-2 py-3"
                >
                  <Compass className="w-4 h-4" />
                  <span className="hidden sm:inline">个性化风水</span>
                  <span className="sm:hidden">风水</span>
                  <Badge className="ml-2 bg-purple-500">推荐</Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="integrated"
                  className="flex items-center justify-center gap-2 py-3"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">整合建议</span>
                  <span className="sm:hidden">整合</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* 八字命理分析 */}
          <TabsContent value="bazi">
            <BaziAnalysisResult
              birthData={birthData}
              onAnalysisComplete={(result) => setBaziResult(result)}
            />
          </TabsContent>

          {/* 个性化风水分析 */}
          {hasHouseInfo && (
            <TabsContent value="fengshui">
              <Card className="border-2 border-purple-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    基于您八字命理的个性化风水分析
                  </CardTitle>
                  <CardDescription>
                    结合您的五行喜忌，为您量身定制的风水布局方案
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ComprehensiveAnalysisPanel
                    analysisResult={fengshuiAnalysis}
                    isLoading={isFengshuiLoading}
                    onRefresh={() => window.location.reload()}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 整合建议 */}
          {hasHouseInfo && (
            <TabsContent value="integrated">
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
                  {baziResult && fengshuiAnalysis ? (
                    <div className="space-y-6">
                      {/* 五行匹配建议 */}
                      <div className="bg-white rounded-lg p-6 shadow-md">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Home className="w-5 h-5 text-purple-600" />
                          五行能量平衡方案
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {baziResult.favorableElements?.map(
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

                          {baziResult.unfavorableElements?.map(
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
                      <p className="text-gray-600">正在生成个性化整合建议...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* 未填写房屋信息的提示 */}
        {!hasHouseInfo && (
          <Card className="mt-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-blue-900 font-semibold text-xl mb-2">
                  💡 解锁个性化风水分析
                </p>
                <p className="text-blue-800 mb-6 max-w-2xl mx-auto">
                  您已完成八字命理分析，现在可以补充房屋信息，获取基于您命理的个性化风水布局方案！
                  这才是真正的"因人制宜"风水调理。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    size="lg"
                    onClick={() => router.push('/zh-CN/unified-form')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Compass className="w-4 h-4 mr-2" />
                    补充房屋信息
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      // 模拟体验功能
                      alert('体验版功能即将上线！');
                    }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    先看看示例
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
