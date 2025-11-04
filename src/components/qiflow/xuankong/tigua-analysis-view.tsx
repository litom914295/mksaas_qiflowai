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
import { AlertCircle, Repeat, TrendingUp } from 'lucide-react';
import React from 'react';

interface TiguaAnalysisViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 替卦分析视图组件
 * 展示玄空替卦理论的应用和分析结果
 */
export function TiguaAnalysisView({
  analysisResult,
  className = '',
}: TiguaAnalysisViewProps) {
  const { tiguaAnalysis } = analysisResult;

  if (!tiguaAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">替卦分析不可用</p>
          <p className="text-sm text-muted-foreground mt-1">
            当前宅运无替卦或高级功能未启用
          </p>
        </div>
      </div>
    );
  }

  // 解析替卦分析数据结构
  // tiguaAnalysis 可能是直接的分析结果，也可能是包装对象
  const actualAnalysis = tiguaAnalysis.analysis || tiguaAnalysis;

  const {
    hasTigua = false,
    rule = null,
    impact = {},
    fanfuyinAnalysis = {},
    rating = 'fair',
    score = 70,
  } = actualAnalysis;

  const applicable = hasTigua;
  const recommendedRule = rule;
  const analysis = {
    originalPattern: {
      period: 9,
      facing: recommendedRule?.zuo || '未知',
      score: score - 15,
      fortuneLevel: score < 60 ? '一般' : score < 75 ? '中等' : '较好',
      characteristics: impact.originalPattern || '常规飞星布局',
    },
    tiguaPatterns: [
      {
        score: score,
        fortuneLevel:
          rating === 'excellent'
            ? '优秀'
            : rating === 'good'
              ? '良好'
              : rating === 'fair'
                ? '中等'
                : rating === 'poor'
                  ? '较差'
                  : '危险',
      },
    ],
    improvements: impact.isImproved
      ? impact.recommendations?.map((r: string) => ({
          aspect: '运势提升',
          description: r,
        }))
      : [],
    considerations: fanfuyinAnalysis.isFanfuyinTigua
      ? [
          {
            aspect: '反伏吟替卦',
            description: fanfuyinAnalysis.description || '需谨慎应用',
          },
        ]
      : [],
    summary: `替卦后运势评级为${rating === 'excellent' ? '优秀' : rating === 'good' ? '良好' : rating === 'fair' ? '中等' : rating === 'poor' ? '较差' : '危险'}，${impact.isImproved ? '整体运势有所提升' : '需谨慎应用'}。`,
  };

  const recommendations = recommendedRule ? [recommendedRule] : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 替卦概述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Repeat className="w-5 h-5 text-primary" />
              <CardTitle>替卦分析概述</CardTitle>
            </div>
            <Badge variant={applicable ? 'default' : 'secondary'}>
              {applicable ? '适用替卦' : '不适用替卦'}
            </Badge>
          </div>
          <CardDescription>
            {applicable
              ? '当前宅运符合替卦条件，可以运用替卦理论进行深度分析'
              : '当前宅运不符合替卦条件'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applicable && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm">
                <strong>替卦理论:</strong> 替卦是玄空风水的高级技法之一，
                指在特定条件下，宅盘的山向飞星可以互换使用，从而改变原有的吉凶判断。
                这种变化往往能够化凶为吉，或者提升整体宅运。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {applicable && (
        <>
          {/* 原盘与替盘对比 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 原飞星盘 */}
            <Card>
              <CardHeader>
                <CardTitle>原飞星盘</CardTitle>
                <CardDescription>未应用替卦时的原始宅运</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      基本信息
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">运星:</span>{' '}
                        <strong>
                          {analysis.originalPattern?.period || '5'}运
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">坐向:</span>{' '}
                        <strong>
                          {analysis.originalPattern?.facing?.direction ||
                            recommendedRule?.zuo ||
                            '未知'}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      整体评价
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        评分: {analysis.originalPattern?.score || 70}分
                      </Badge>
                      <Badge variant="secondary">
                        {analysis.originalPattern?.fortuneLevel || '中等'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    原盘特征:{' '}
                    {analysis.originalPattern?.characteristics ||
                      '常规飞星布局'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 替卦飞星盘 */}
            <Card className="border-primary">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <CardTitle>替卦飞星盘</CardTitle>
                </div>
                <CardDescription>应用替卦理论后的新宅运</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      替换信息
                    </p>
                    <div className="bg-green-50 rounded p-2 text-sm">
                      <p>
                        <strong>替卦类型:</strong>{' '}
                        {recommendedRule?.category || '山向互换'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recommendedRule?.description ||
                          '符合替卦条件，山星与向星可以互换'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      整体评价
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">
                        评分: {analysis.tiguaPatterns?.[0]?.score || 85}分
                      </Badge>
                      <Badge className="bg-green-500">
                        {analysis.tiguaPatterns?.[0]?.fortuneLevel || '较好'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded">
                    ✓ 替卦后特征:{' '}
                    {recommendedRule?.detailedExplanation ||
                      '整体运势提升，吉凶格局优化'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 详细分析 */}
          <Card>
            <CardHeader>
              <CardTitle>替卦影响分析</CardTitle>
              <CardDescription>对比原盘与替盘的差异和改善效果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 改善方面 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-green-600">
                    ✓ 改善方面
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.improvements?.map(
                      (improvement: any, idx: number) => (
                        <div
                          key={idx}
                          className="border-l-4 border-green-500 pl-3 py-2 bg-green-50"
                        >
                          <p className="text-sm font-medium">
                            {improvement.aspect}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {improvement.description}
                          </p>
                        </div>
                      )
                    ) || (
                      <div className="col-span-2 text-sm text-muted-foreground">
                        暂无具体改善数据
                      </div>
                    )}
                  </div>
                </div>

                {/* 需要注意 */}
                <div>
                  <h4 className="text-sm font-medium mb-2 text-orange-600">
                    ⚠ 需要注意
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.considerations?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="border-l-4 border-orange-500 pl-3 py-2 bg-orange-50"
                      >
                        <p className="text-sm font-medium">{item.aspect}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                    )) || (
                      <div className="col-span-2 text-sm text-muted-foreground">
                        应用替卦需要专业指导
                      </div>
                    )}
                  </div>
                </div>

                {/* 综合评估 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">综合评估</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysis.summary ||
                      '替卦理论的应用能够在一定程度上改善宅运，但需要结合实际情况和专业建议。' +
                        '建议在专业风水师的指导下，根据实际情况决定是否采用替卦法进行布局调整。'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 实施建议 */}
          <Card>
            <CardHeader>
              <CardTitle>替卦实施建议</CardTitle>
              <CardDescription>
                如何正确运用替卦理论进行风水布局
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations?.map((rec: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">
                          {rec.description || rec.title || `替卦建议${idx + 1}`}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.detailedExplanation ||
                            rec.description ||
                            '替卦应用建议'}
                        </p>
                        {rec.modernApplication && (
                          <div className="text-xs text-muted-foreground mb-2">
                            现代应用: {rec.modernApplication}
                          </div>
                        )}
                        {rec.steps && (
                          <ul className="space-y-1">
                            {rec.steps.map((step: any, i: number) => (
                              <li
                                key={i}
                                className="text-xs text-muted-foreground"
                              >
                                • {step}
                              </li>
                            ))}
                          </ul>
                        )}
                        {rec.caution && (
                          <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            ⚠️ 注意: {rec.caution}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">基本建议:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="text-muted-foreground">
                        1. 确认当前宅运是否真正符合替卦条件
                      </li>
                      <li className="text-muted-foreground">
                        2. 咨询专业风水师进行详细分析和确认
                      </li>
                      <li className="text-muted-foreground">
                        3. 按照替卦理论调整主要功能区域的布局
                      </li>
                      <li className="text-muted-foreground">
                        4. 观察一段时间后评估效果，必要时进行微调
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 底部说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">🔄 替卦理论说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 替卦是玄空风水的高级技法，需要满足特定条件才能应用</li>
              <li>• 并非所有宅运都适用替卦，需要专业判断</li>
              <li>• 替卦的应用能够在某些情况下改善宅运吉凶</li>
              <li>• 建议在专业风水师指导下谨慎使用替卦法</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TiguaAnalysisView;
