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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useState } from 'react';

// 导入子组件
import { BasicAnalysisView } from './basic-analysis-view';
import { ChengmenjueAnalysisView } from './chengmenjue-analysis-view';
import { LingzhengAnalysisView } from './lingzheng-analysis-view';
import { LiunianAnalysisView } from './liunian-analysis-view';
import { OverallAssessmentView } from './overall-assessment-view';
import { PersonalizedAnalysisView } from './personalized-analysis-view';
import { SmartRecommendationsView } from './smart-recommendations-view';
import { TiguaAnalysisView } from './tigua-analysis-view';

// 导入新增的增强组件（暂时注释掉，避免错误）
// import { SimpleEnhancedPlate } from './enhanced-plate-simple';
// import { SimpleKeyPositions } from './key-positions-simple';

interface ComprehensiveAnalysisPanelProps {
  analysisResult: ComprehensiveAnalysisResult | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

/**
 * 玄空飞星综合分析面板 - 主容器组件
 *
 * 功能:
 * - 展示完整的分析结果
 * - 多标签页切换不同分析维度
 * - 提供刷新和导出功能
 * - 响应式布局设计
 */
export function ComprehensiveAnalysisPanel({
  analysisResult,
  isLoading = false,
  onRefresh,
  onExport,
  className,
}: ComprehensiveAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // 导出PDF/JSON
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else {
      // 默认导出为JSON
      const dataStr = JSON.stringify(analysisResult, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `xuankong-analysis-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [analysisResult, onExport]);

  // 加载状态
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">正在进行玄空飞星分析...</p>
          <p className="mt-2 text-sm text-muted-foreground">
            这可能需要几秒钟时间
          </p>
        </CardContent>
      </Card>
    );
  }

  // 无数据状态
  if (!analysisResult) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">暂无分析结果</p>
          <p className="mt-2 text-sm text-muted-foreground">
            请先输入分析参数并开始分析
          </p>
        </CardContent>
      </Card>
    );
  }

  const { metadata, overallAssessment } = analysisResult;

  // 获取评级颜色
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 获取评级文本
  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '优秀';
      case 'good':
        return '良好';
      case 'fair':
        return '一般';
      case 'poor':
        return '较差';
      default:
        return '未知';
    }
  };

  return (
    <div className={className}>
      {/* 顶部摘要卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">玄空飞星综合分析报告</CardTitle>
                <Badge className={getRatingColor(overallAssessment.rating)}>
                  {getRatingText(overallAssessment.rating)}
                </Badge>
              </div>
              <CardDescription className="mt-2">
                分析完成于{' '}
                {new Date(metadata.analyzedAt).toLocaleString('zh-CN')} · 耗时{' '}
                {metadata.computationTime}ms · 深度级别:{' '}
                {metadata.analysisDepth}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  刷新
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                导出
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 综合评分 */}
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  {overallAssessment.score}
                </span>
                <span className="text-muted-foreground">/ 100</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">综合评分</p>
            </div>

            {/* 快速统计 */}
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">
                  {overallAssessment.strengths.length}
                </div>
                <p className="text-sm text-muted-foreground">优势</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-red-600">
                  {overallAssessment.weaknesses.length}
                </div>
                <p className="text-sm text-muted-foreground">劣势</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-orange-600">
                  {overallAssessment.topPriorities.length}
                </div>
                <p className="text-sm text-muted-foreground">优先事项</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容标签页 */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="border-b">
            <TabsList className="grid w-full grid-cols-8 gap-1">
              <TabsTrigger value="overview" className="text-xs">
                总览
              </TabsTrigger>
              <TabsTrigger value="basic" className="text-xs">
                基础分析
              </TabsTrigger>
              <TabsTrigger
                value="liunian"
                className="text-xs"
                disabled={!analysisResult.liunianAnalysis}
              >
                流年分析
              </TabsTrigger>
              <TabsTrigger
                value="personal"
                className="text-xs"
                disabled={!analysisResult.personalizedAnalysis}
              >
                个性化
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="text-xs">
                智能推荐
              </TabsTrigger>
              <TabsTrigger
                value="tigua"
                className="text-xs"
                disabled={!analysisResult.tiguaAnalysis}
              >
                替卦分析
              </TabsTrigger>
              <TabsTrigger
                value="lingzheng"
                className="text-xs"
                disabled={!analysisResult.lingzhengAnalysis}
              >
                零正理论
              </TabsTrigger>
              <TabsTrigger
                value="chengmen"
                className="text-xs"
                disabled={!analysisResult.chengmenjueAnalysis}
              >
                城门诀
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            {/* 总览 */}
            <TabsContent value="overview" className="mt-0">
              <OverallAssessmentView
                assessment={overallAssessment}
                metadata={metadata}
              />
            </TabsContent>

            {/* 基础分析 */}
            <TabsContent value="basic" className="mt-0">
              <BasicAnalysisView analysisResult={analysisResult} />
            </TabsContent>

            {/* 流年分析 */}
            <TabsContent value="liunian" className="mt-0">
              {analysisResult.liunianAnalysis && (
                <LiunianAnalysisView analysisResult={analysisResult} />
              )}
            </TabsContent>

            {/* 个性化分析 */}
            <TabsContent value="personal" className="mt-0">
              {analysisResult.personalizedAnalysis && (
                <PersonalizedAnalysisView analysisResult={analysisResult} />
              )}
            </TabsContent>

            {/* 智能推荐 */}
            <TabsContent value="recommendations" className="mt-0">
              <SmartRecommendationsView analysisResult={analysisResult} />
            </TabsContent>

            {/* 替卦分析 */}
            <TabsContent value="tigua" className="mt-0">
              {analysisResult.tiguaAnalysis && (
                <TiguaAnalysisView analysisResult={analysisResult} />
              )}
            </TabsContent>

            {/* 零正理论 */}
            <TabsContent value="lingzheng" className="mt-0">
              {analysisResult.lingzhengAnalysis && (
                <LingzhengAnalysisView analysisResult={analysisResult} />
              )}
            </TabsContent>

            {/* 城门诀 */}
            <TabsContent value="chengmen" className="mt-0">
              {analysisResult.chengmenjueAnalysis && (
                <ChengmenjueAnalysisView analysisResult={analysisResult} />
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
