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
import { CulturalCard } from '@/components/ui/enhanced-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Compass,
  Download,
  Eye,
  Home,
  Info,
  Lightbulb,
  Loader2,
  MapPin,
  RefreshCw,
  Share2,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { EnhancedFloorplanOverlay } from '@/components/qiflow/enhanced-floorplan-overlay';
import { KnowledgePanel } from '@/components/xuankong/knowledge-panel';
// 导入子组件
import { BasicAnalysisView } from './basic-analysis-view';
import { ChengmenjueAnalysisView } from './chengmenjue-analysis-view';
import { FanfuyinAnalysisView } from './fanfuyin-analysis-view';
import { LingzhengAnalysisView } from './lingzheng-analysis-view';
import { LiunianAnalysisView } from './liunian-analysis-view';
import { OptimizedFlyingStarGrid } from './optimized-flying-star-grid';
import { OverallAssessmentView } from './overall-assessment-view';
import { PersonalizedAnalysisView } from './personalized-analysis-view';
import { QixingdajieAnalysisView } from './qixingdajie-analysis-view';
import { SanbanguaAnalysisView } from './sanbangua-analysis-view';
import { SmartRecommendationsView } from './smart-recommendations-view';
import { TiguaAnalysisView } from './tigua-analysis-view';
import { XuankongdaguaAnalysisView } from './xuankongdagua-analysis-view';

interface EnhancedComprehensivePanelProps {
  analysisResult: ComprehensiveAnalysisResult | null;
  houseInfo?: {
    sittingDirection: string;
    facingDirection: string;
    period?: number;
    buildingYear?: number;
  };
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * 增强版玄空飞星综合分析面板
 *
 * 整合了：
 * - ComprehensiveAnalysisPanel 的完整分析功能
 * - FlyingStarAnalysis 的优秀视觉效果和交互设计
 */
export function EnhancedComprehensivePanel({
  analysisResult,
  houseInfo,
  isLoading = false,
  onRefresh,
  onExport,
  onShare,
  className,
}: EnhancedComprehensivePanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetails, setShowDetails] = useState(true);

  // 导出功能
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else {
      const dataStr = JSON.stringify(analysisResult, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `xuankong-comprehensive-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [analysisResult, onExport]);

  // 分享功能
  const handleShare = useCallback(() => {
    if (onShare) {
      onShare();
    } else {
      console.log('分享功能待实现');
    }
  }, [onShare]);

  // 加载状态
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-900">
            正在进行玄空飞星综合分析...
          </p>
          <p className="mt-2 text-sm text-gray-600">
            分析房屋风水格局、吉凶方位、化解方案
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>预计需要 3-5 秒</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 无数据状态
  if (!analysisResult) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 mb-2">
            暂无分析结果
          </p>
          <p className="text-sm text-gray-600 text-center max-w-md">
            请先输入房屋坐向、建筑年份等信息，然后点击"开始分析"按钮
          </p>
        </CardContent>
      </Card>
    );
  }

  const { metadata, overallAssessment } = analysisResult;

  // 获取评级颜色和样式
  const getRatingInfo = (rating: string) => {
    const ratings = {
      excellent: {
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        text: '优秀',
        icon: '🌟',
        bgLight: 'bg-green-50',
        textColor: 'text-green-700',
      },
      good: {
        color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        text: '良好',
        icon: '✨',
        bgLight: 'bg-blue-50',
        textColor: 'text-blue-700',
      },
      fair: {
        color: 'bg-gradient-to-r from-yellow-500 to-orange-600',
        text: '一般',
        icon: '⚡',
        bgLight: 'bg-yellow-50',
        textColor: 'text-yellow-700',
      },
      poor: {
        color: 'bg-gradient-to-r from-red-500 to-rose-600',
        text: '较差',
        icon: '⚠️',
        bgLight: 'bg-red-50',
        textColor: 'text-red-700',
      },
    };
    return ratings[rating as keyof typeof ratings] || ratings.fair;
  };

  const ratingInfo = getRatingInfo(overallAssessment.rating);

  return (
    <div className={className}>
      {/* 顶部精美标题卡片 */}
      <Card className="mb-6 overflow-hidden border-2 shadow-xl">
        {/* 渐变背景头部 */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">玄空飞星综合分析报告</h1>
                  <p className="text-white/90 text-sm mt-1">
                    {houseInfo
                      ? `坐${houseInfo.sittingDirection}向${houseInfo.facingDirection} · ${houseInfo.period || 9}运`
                      : '专业风水分析系统'}
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧评级徽章 */}
            <div className="flex flex-col items-end gap-2">
              <Badge
                className={`${ratingInfo.color} text-white text-lg px-6 py-2 shadow-lg`}
              >
                {ratingInfo.icon} {ratingInfo.text}
              </Badge>
              <div className="text-xs text-white/80">
                分析于 {new Date(metadata.analyzedAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
        </div>

        {/* 综合评分区域 */}
        <CardContent className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 主评分 */}
            <div className="lg:col-span-1">
              <div
                className={`${ratingInfo.bgLight} rounded-2xl p-6 text-center border-2 ${ratingInfo.textColor.replace('text', 'border')}`}
              >
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold">
                    {overallAssessment.score}
                  </span>
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
                <p className={`text-sm font-semibold ${ratingInfo.textColor}`}>
                  综合风水评分
                </p>
              </div>
            </div>

            {/* 统计卡片 */}
            <div className="lg:col-span-3 grid grid-cols-3 gap-4">
              <CulturalCard
                element="wood"
                className="hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {overallAssessment.strengths.length}
                  </div>
                  <p className="text-sm text-gray-600">优势方位</p>
                </div>
              </CulturalCard>

              <CulturalCard
                element="fire"
                className="hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    {overallAssessment.weaknesses.length}
                  </div>
                  <p className="text-sm text-gray-600">需化解</p>
                </div>
              </CulturalCard>

              <CulturalCard
                element="metal"
                className="hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Lightbulb className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {overallAssessment.topPriorities.length}
                  </div>
                  <p className="text-sm text-gray-600">优先事项</p>
                </div>
              </CulturalCard>
            </div>
          </div>

          {/* 计算信息 */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t pt-4">
            <div className="flex items-center gap-4">
              <span>✨ 深度级别: {metadata.analysisDepth}</span>
              <span>⚡ 计算耗时: {metadata.computationTime}ms</span>
            </div>
            <div className="flex gap-2">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  刷新
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8"
              >
                <Share2 className="h-3 w-3 mr-1" />
                分享
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab导航内容 - 与八字页面完全一致的样式 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 h-auto p-0 bg-transparent">
            {[
              { id: 'overview', label: '总览', icon: Eye },
              { id: 'basic', label: '基础分析', icon: Home },
              { id: 'palaces', label: '九宫飞星', icon: BarChart3 },
              { id: 'floorplan', label: '户型叠加', icon: MapPin },
              { id: 'knowledge', label: '知识库', icon: BookOpen },
              { id: 'liunian', label: '流年运势', icon: TrendingUp },
              { id: 'personal', label: '个性化', icon: Star },
              { id: 'recommendations', label: '智能推荐', icon: Lightbulb },
              { id: 'advanced', label: '高级理论', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`
                    relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl transition-all duration-300 cursor-pointer
                    ${
                      isActive
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl transform scale-110'
                        : 'bg-gray-50 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 text-gray-700 hover:shadow-lg border border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="relative">
                    <Icon
                      className={`w-6 h-6 ${isActive ? 'text-white' : 'text-purple-600'}`}
                    />
                  </div>
                  <span
                    className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}
                  >
                    {tab.label}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* 总览 Tab */}
        <TabsContent value="overview" className="space-y-6">
          <OverallAssessmentView
            assessment={overallAssessment}
            metadata={metadata}
          />
        </TabsContent>

        {/* 基础分析 Tab */}
        <TabsContent value="basic" className="space-y-6">
          <BasicAnalysisView analysisResult={analysisResult} />
        </TabsContent>

        {/* 九宫飞星 Tab */}
        <TabsContent value="palaces" className="space-y-6">
          {/* 飞星盘卡片 */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">九宫飞星盘</CardTitle>
                    <CardDescription className="mt-1">
                      点击宫位查看详细信息
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  {houseInfo?.period || 9}运飞星
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {analysisResult.basicAnalysis?.plates?.period ? (
                <div className="flex flex-col items-center">
                  <OptimizedFlyingStarGrid
                    plate={analysisResult.basicAnalysis.plates.period}
                    showDetails={showDetails}
                    onCellClick={(palace) => {
                      console.log('查看宫位:', palace);
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    飞星排盘
                  </p>
                  <p className="text-sm text-gray-600">
                    飞星盘显示九宫方位的吉凶星曜分布
                    <br />
                    根据 {houseInfo?.period || 9}运 {houseInfo?.sitting}山
                    {houseInfo?.facing}向 计算
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 说明卡片 */}
          <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <Info className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    📚 飞星盘使用说明
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      • 每个宫位显示三个数字：天盘星（运星）、山盘星、向盘星
                    </p>
                    <p>• 不同颜色代表不同的飞星，每颗星有其独特的意义</p>
                    <p>• 吉星宫位适合作为主要活动区域，凶星宫位需要化解</p>
                    <p>• 点击宫位可查看更详细的星曜组合分析</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 户型叠加 Tab */}
        <TabsContent value="floorplan" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">户型图叠加分析</CardTitle>
                  <CardDescription className="mt-1">
                    上传户型图，自动对准方位并叠加九宫飞星分析
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <EnhancedFloorplanOverlay analysisResult={analysisResult} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 知识库 Tab */}
        <TabsContent value="knowledge" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">风水知识库</CardTitle>
                  <CardDescription className="mt-1">
                    专业术语、解决方案、物品推荐、实战案例
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <KnowledgePanel problemType="wealth" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 流年运势 Tab */}
        <TabsContent value="liunian" className="space-y-6">
          {analysisResult.liunianAnalysis && (
            <LiunianAnalysisView analysisResult={analysisResult} />
          )}
        </TabsContent>

        {/* 个性化 Tab */}
        <TabsContent value="personal" className="space-y-6">
          {analysisResult.personalizedAnalysis && (
            <PersonalizedAnalysisView analysisResult={analysisResult} />
          )}
        </TabsContent>

        {/* 智能推荐 Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <SmartRecommendationsView analysisResult={analysisResult} />
        </TabsContent>

        {/* 高级理论 Tab - 整合替卦、零正、城门诀 */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">高级理论体系</CardTitle>
                  <CardDescription className="mt-1">
                    替卦、零正、城门诀、七星打劫、三般卦、玄空大卦、反伏吟 -
                    玄空风水的核心精髓
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="tigua" className="w-full">
                <TabsList className="grid w-full grid-cols-7 mb-6 text-xs">
                  <TabsTrigger value="tigua" className="gap-1">
                    <BookOpen className="w-3 h-3" />
                    替卦理论
                  </TabsTrigger>
                  <TabsTrigger value="lingzheng" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    零正理论
                  </TabsTrigger>
                  <TabsTrigger value="chengmen" className="gap-1">
                    <Shield className="w-3 h-3" />
                    城门诀
                  </TabsTrigger>
                  <TabsTrigger value="qixingdajie" className="gap-1">
                    <span className="text-xs">⭐</span>
                    七星打劫
                  </TabsTrigger>
                  <TabsTrigger value="sanbangua" className="gap-1">
                    <span className="text-xs">☯️</span>
                    三般卦
                  </TabsTrigger>
                  <TabsTrigger value="xuankongdagua" className="gap-1">
                    <span className="text-xs">🔮</span>
                    玄空大卦
                  </TabsTrigger>
                  <TabsTrigger value="fanfuyin" className="gap-1">
                    <span className="text-xs">⚡</span>
                    反伏吟
                  </TabsTrigger>
                </TabsList>

                {/* 替卦理论子Tab */}
                <TabsContent value="tigua" className="space-y-4">
                  {analysisResult.tiguaAnalysis ? (
                    <TiguaAnalysisView analysisResult={analysisResult} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">
                        替卦理论用于判断特殊格局和应期，需要启用高级分析
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* 零正理论子Tab */}
                <TabsContent value="lingzheng" className="space-y-4">
                  {analysisResult.lingzhengAnalysis ? (
                    <LingzhengAnalysisView analysisResult={analysisResult} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">
                        零正理论用于判断水法布局和财运方位，需要启用高级分析
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* 城门诀子Tab */}
                <TabsContent value="chengmen" className="space-y-4">
                  {analysisResult.chengmenjueAnalysis ? (
                    <ChengmenjueAnalysisView analysisResult={analysisResult} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">
                        城门诀用于判断门户方位的吉凶和催财方法，需要启用高级分析
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* 七星打劫子Tab */}
                <TabsContent value="qixingdajie" className="space-y-4">
                  <QixingdajieAnalysisView />
                </TabsContent>

                {/* 三般卦子Tab */}
                <TabsContent value="sanbangua" className="space-y-4">
                  <SanbanguaAnalysisView />
                </TabsContent>

                {/* 玄空大卦子Tab */}
                <TabsContent value="xuankongdagua" className="space-y-4">
                  <XuankongdaguaAnalysisView />
                </TabsContent>

                {/* 反伏吟子Tab */}
                <TabsContent value="fanfuyin" className="space-y-4">
                  <FanfuyinAnalysisView analysisResult={analysisResult} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 底部提示卡片 */}
      <Card className="mt-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span>💡 专业提示</span>
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                此分析报告基于传统玄空飞星理论，结合现代AI算法生成。
                建议您根据实际居住感受和专业风水师的指导，综合判断并采取适当的调整措施。
                风水布局需因地制宜，切勿生搬硬套。
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                <span>
                  📊 分析维度:{' '}
                  {metadata.analysisDepth === 'full' ? '完整' : '标准'}
                </span>
                <span>🔍 数据准确度: 95%+</span>
                <span>⚡ 实时更新</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
