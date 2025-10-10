'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  AlertCircle,
  Calendar,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

interface LiunianAnalysisViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 流年分析视图组件
 * 展示当前年份的运势变化、流年飞星影响、时间趋势等
 */
export function LiunianAnalysisView({
  analysisResult,
  className = '',
}: LiunianAnalysisViewProps) {
  const { liunianAnalysis } = analysisResult;

  if (!liunianAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">流年分析未启用</p>
          <p className="text-sm text-muted-foreground mt-1">
            请在分析设置中启用流年分析功能
          </p>
        </div>
      </div>
    );
  }

  // TODO: 需要根据实际的 liunianAnalysis 结构进行调整
  const currentYear = {
    year: new Date().getFullYear(),
    yearStar: 5,
    ganZhi: '甲辰',
  };
  const yearlyFortune = {
    trend: 'improving',
    overallScore: 75,
    characteristics: '今年运势整体向好',
    favorableAspects: ['财运提升', '事业发展'],
    unfavorableAspects: ['健康需要注意'],
    yearlyRecommendations: ['多做投资', '注意身体'],
    resolutionMethods: [] as any[],
  };
  const monthlyTrends = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    score: Math.floor(Math.random() * 40 + 40),
    mainInfluences: ['财运', '事业'],
    trend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)],
  }));
  const criticalPeriods: any[] = [];

  // 获取运势趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // 获取运势评分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-gray-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // 获取月份徽章变体
  const getMonthBadgeVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 75) return 'default';
    if (score >= 50) return 'secondary';
    if (score >= 30) return 'outline';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 年度运势概况 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle>{currentYear.year}年流年运势</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(yearlyFortune.trend)}
              <Badge variant={getMonthBadgeVariant(yearlyFortune.overallScore)}>
                {yearlyFortune.overallScore}分
              </Badge>
            </div>
          </div>
          <CardDescription>
            流年飞星: {currentYear.yearStar}星入中 | 天干地支:{' '}
            {currentYear.ganZhi}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 年度特征 */}
            <div>
              <h4 className="text-sm font-medium mb-2">年度特征</h4>
              <p className="text-sm text-muted-foreground">
                {yearlyFortune.characteristics}
              </p>
            </div>

            {/* 有利方面 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-600">
                ✓ 有利方面
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {yearlyFortune.favorableAspects.map((aspect, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{aspect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 不利方面 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-orange-600">
                ⚠ 需要注意
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {yearlyFortune.unfavorableAspects.map((aspect, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{aspect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 年度建议 */}
            <div>
              <h4 className="text-sm font-medium mb-2">💡 年度建议</h4>
              <ul className="space-y-1">
                {yearlyFortune.yearlyRecommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {idx + 1}. {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 月度运势趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>月度运势趋势</CardTitle>
          <CardDescription>
            {currentYear.year}年各月运势变化情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthlyTrends.map((month) => (
              <div
                key={month.month}
                className="p-3 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{month.month}月</span>
                  <Badge
                    variant={getMonthBadgeVariant(month.score)}
                    className="text-xs"
                  >
                    {month.score}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {month.mainInfluences.slice(0, 2).join('、')}
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  {getTrendIcon(month.trend)}
                  <span className="text-muted-foreground">
                    {month.trend === 'improving'
                      ? '上升'
                      : month.trend === 'declining'
                        ? '下降'
                        : '平稳'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 关键时间节点 */}
      <Card>
        <CardHeader>
          <CardTitle>关键时间节点</CardTitle>
          <CardDescription>本年度需要特别关注的时间段</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalPeriods.map((period, idx) => (
              <div
                key={idx}
                className="border-l-4 pl-4 py-2"
                style={{
                  borderColor:
                    period.type === 'favorable'
                      ? '#10b981'
                      : period.type === 'unfavorable'
                        ? '#f59e0b'
                        : '#6b7280',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        period.type === 'favorable'
                          ? 'default'
                          : period.type === 'unfavorable'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {period.type === 'favorable'
                        ? '吉期'
                        : period.type === 'unfavorable'
                          ? '凶期'
                          : '重要'}
                    </Badge>
                    <span className="text-sm font-medium">{period.period}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    影响力: {period.importance}/10
                  </span>
                </div>
                <p className="text-sm mb-2">{period.description}</p>
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>建议行动：</strong>
                    {period.suggestions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 流年化解建议 */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">流年化解方案</CardTitle>
          <CardDescription className="text-amber-700">
            针对本年度凶煞的专项化解建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {yearlyFortune.resolutionMethods?.map((method, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-3 border border-amber-200"
              >
                <h5 className="font-medium text-sm mb-2">{method.issue}</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  {method.method}
                </p>
                <div className="flex flex-wrap gap-2">
                  {method.items?.map((item: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 底部说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">📅 流年分析说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 流年分析基于当年飞星入中对宅运的影响</li>
              <li>• 不同月份受流月飞星影响，运势会有起伏变化</li>
              <li>• 关键时间节点需要特别注意，提前做好准备</li>
              <li>• 化解方案建议配合专业风水师指导实施</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LiunianAnalysisView;
