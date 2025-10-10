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
import { AlertCircle, Droplets, Mountain, Target } from 'lucide-react';
import React from 'react';

interface LingzhengAnalysisViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 零正理论视图组件
 * 展示玄空零正神理论的分析和应用
 */
export function LingzhengAnalysisView({
  analysisResult,
  className = '',
}: LingzhengAnalysisViewProps) {
  const { lingzhengAnalysis } = analysisResult;

  if (!lingzhengAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">零正理论分析不可用</p>
          <p className="text-sm text-muted-foreground mt-1">高级功能未启用</p>
        </div>
      </div>
    );
  }

  // 解析零正理论数据结构
  const {
    zeroGodPosition = [],
    positiveGodPosition = [],
    isZeroPositiveReversed = false,
    waterPlacement = { favorable: [], unfavorable: [] },
    mountainPlacement = { favorable: [], unfavorable: [] },
    recommendations = [],
  } = lingzhengAnalysis;

  // 方位映射
  const palaceToDirection: Record<number, string> = {
    1: '北',
    2: '西南',
    3: '东',
    4: '东南',
    5: '中',
    6: '西北',
    7: '西',
    8: '东北',
    9: '南',
  };
  const palaceToBagua: Record<number, string> = {
    1: '坎',
    2: '坤',
    3: '震',
    4: '巽',
    5: '中',
    6: '乾',
    7: '兑',
    8: '艮',
    9: '离',
  };

  // 零神位信息
  const lingShenPalace = zeroGodPosition[0] || 1;
  const lingShenPosition = {
    direction: palaceToDirection[lingShenPalace],
    palace: palaceToBagua[lingShenPalace],
    star: lingShenPalace,
    currentState: {
      rating: waterPlacement.favorable.includes(lingShenPalace)
        ? '良好'
        : '一般',
      description: waterPlacement.favorable.includes(lingShenPalace)
        ? '零神位宜见水，当前配置良好'
        : '建议在此方位加强水元素',
    },
    idealSetup: ['鱼缸、水景等动水设施', '门窗等气口开阔处', '低洼、空旷区域'],
  };

  // 正神位信息
  const zhengShenPalace = positiveGodPosition[0] || 9;
  const zhengShenPosition = {
    direction: palaceToDirection[zhengShenPalace],
    palace: palaceToBagua[zhengShenPalace],
    star: zhengShenPalace,
    currentState: {
      rating: mountainPlacement.favorable.includes(zhengShenPalace)
        ? '良好'
        : '一般',
      description: mountainPlacement.favorable.includes(zhengShenPalace)
        ? '正神位宜见山，当前配置良好'
        : '建议在此方位加强山元素',
    },
    idealSetup: ['高大家具、书柜', '实墙、山石装饰', '稳重、静态物品'],
  };

  // 水位布局详情
  const waterPlacements = [
    ...waterPlacement.favorable.map((p) => ({
      direction: palaceToDirection[p],
      palace: p,
      suitable: true,
      analysis: `${palaceToDirection[p]}方宜见水，可旺财运`,
      suggestion: '建议布置鱼缸、水景或开门窗',
    })),
    ...waterPlacement.unfavorable.map((p) => ({
      direction: palaceToDirection[p],
      palace: p,
      suitable: false,
      analysis: `${palaceToDirection[p]}方忌见水，可能影响运势`,
      suggestion: '避免在此方位放置水景或动水设施',
    })),
  ];

  // 山位布局详情
  const mountainPlacements = [
    ...mountainPlacement.favorable.map((p) => ({
      direction: palaceToDirection[p],
      palace: p,
      suitable: true,
      analysis: `${palaceToDirection[p]}方宜见山，可旺人丁`,
      suggestion: '建议布置高大家具或山石装饰',
    })),
    ...mountainPlacement.unfavorable.map((p) => ({
      direction: palaceToDirection[p],
      palace: p,
      suitable: false,
      analysis: `${palaceToDirection[p]}方忌高大物件，影响运势`,
      suggestion: '保持此方位低矮开阔，避免高大家具',
    })),
  ];

  // 获取方位评价颜色
  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case '极佳':
        return 'bg-green-500';
      case '良好':
        return 'bg-blue-500';
      case '一般':
        return 'bg-gray-500';
      case '不佳':
        return 'bg-orange-500';
      case '极差':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 零正理论概述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>零正神理论概述</CardTitle>
          </div>
          <CardDescription>
            零正神理论是玄空风水的核心理论之一，用于判断水山的最佳布局位置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <strong>零神:</strong> 宜见水，水为财，零神位见水可以旺财运。
              在实际应用中，零神位适合布置鱼缸、水景、泳池等动水设施。
            </p>
            <p className="text-sm">
              <strong>正神:</strong> 宜见山，山为人丁，正神位见山可以旺人丁。
              在实际应用中，正神位适合布置高大家具、书柜、山石等静态物品。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 零正神方位 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 零神位 */}
        <Card className="border-blue-500">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <CardTitle>零神位（宜水）</CardTitle>
            </div>
            <CardDescription>当前宅运的零神方位和水位布局建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 零神方位 */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">零神方位</p>
                <div className="flex items-center space-x-2">
                  <Badge className="text-lg bg-blue-500">
                    {lingShenPosition.direction}
                  </Badge>
                  <Badge variant="outline">{lingShenPosition.palace}宫</Badge>
                  <Badge variant="secondary">{lingShenPosition.star}星</Badge>
                </div>
              </div>

              {/* 当前状态 */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">当前状态</p>
                <div className="bg-blue-50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">水位匹配度</span>
                    <Badge
                      className={getRatingColor(
                        lingShenPosition.currentState.rating
                      )}
                    >
                      {lingShenPosition.currentState.rating}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lingShenPosition.currentState.description}
                  </p>
                </div>
              </div>

              {/* 理想布局 */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">理想布局</p>
                <ul className="space-y-1">
                  {lingShenPosition.idealSetup?.map(
                    (item: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    )
                  ) || (
                    <>
                      <li className="text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>鱼缸、水景等动水设施</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>门窗等气口开阔处</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>低洼、空旷区域</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 正神位 */}
        <Card className="border-green-500">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mountain className="w-5 h-5 text-green-500" />
              <CardTitle>正神位（宜山）</CardTitle>
            </div>
            <CardDescription>当前宅运的正神方位和山位布局建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 正神方位 */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">正神方位</p>
                <div className="flex items-center space-x-2">
                  <Badge className="text-lg bg-green-500">
                    {zhengShenPosition.direction}
                  </Badge>
                  <Badge variant="outline">{zhengShenPosition.palace}宫</Badge>
                  <Badge variant="secondary">{zhengShenPosition.star}星</Badge>
                </div>
              </div>

              {/* 当前状态 */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">当前状态</p>
                <div className="bg-green-50 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">山位匹配度</span>
                    <Badge
                      className={getRatingColor(
                        zhengShenPosition.currentState.rating
                      )}
                    >
                      {zhengShenPosition.currentState.rating}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {zhengShenPosition.currentState.description}
                  </p>
                </div>
              </div>

              {/* 理想布局 */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">理想布局</p>
                <ul className="space-y-1">
                  {zhengShenPosition.idealSetup?.map(
                    (item: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    )
                  ) || (
                    <>
                      <li className="text-sm flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>高大家具、书柜</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>实墙、山石装饰</span>
                      </li>
                      <li className="text-sm flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        <span>稳重、静态物品</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 水位布局详情 */}
      <Card>
        <CardHeader>
          <CardTitle>水位布局分析</CardTitle>
          <CardDescription>各方位的水位布局吉凶评价和建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {waterPlacements?.map((placement, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{placement.direction}</span>
                  </div>
                  <Badge
                    variant={placement.suitable ? 'default' : 'destructive'}
                  >
                    {placement.suitable ? '适宜' : '不宜'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {placement.analysis}
                </p>
                <div className="text-xs text-muted-foreground">
                  建议: {placement.suggestion}
                </div>
              </div>
            )) || (
              <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
                暂无详细水位数据
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 山位布局详情 */}
      <Card>
        <CardHeader>
          <CardTitle>山位布局分析</CardTitle>
          <CardDescription>各方位的山位布局吉凶评价和建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mountainPlacements?.map((placement, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Mountain className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{placement.direction}</span>
                  </div>
                  <Badge
                    variant={placement.suitable ? 'default' : 'destructive'}
                  >
                    {placement.suitable ? '适宜' : '不宜'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {placement.analysis}
                </p>
                <div className="text-xs text-muted-foreground">
                  建议: {placement.suggestion}
                </div>
              </div>
            )) || (
              <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
                暂无详细山位数据
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 综合分析 */}
      <Card>
        <CardHeader>
          <CardTitle>零正神综合分析</CardTitle>
          <CardDescription>当前宅运的零正神布局总体评价</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 总体评分 */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">总体匹配度</h4>
                <Badge className={getRatingColor(analysis.overallRating)}>
                  {analysis.overallRating}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {analysis.summary}
              </p>
            </div>

            {/* 优势方面 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-600">
                ✓ 优势方面
              </h4>
              <ul className="space-y-1 ml-4">
                {analysis.strengths?.map((strength: any, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {strength}
                  </li>
                )) || (
                  <li className="text-sm text-muted-foreground">
                    • 暂无具体优势数据
                  </li>
                )}
              </ul>
            </div>

            {/* 改进建议 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-orange-600">
                ⚠ 改进建议
              </h4>
              <ul className="space-y-1 ml-4">
                {analysis.improvements?.map((improvement: any, idx: number) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {improvement}
                  </li>
                )) || (
                  <li className="text-sm text-muted-foreground">
                    • 暂无具体改进建议
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 底部说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">💧⛰️ 零正神理论说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 零神喜水，正神喜山，是玄空风水的重要原则</li>
              <li>• 零神位见水可旺财，正神位见山可旺丁</li>
              <li>• 颠倒零正神（零神见山、正神见水）会导致不利影响</li>
              <li>• 实际布局需要结合户型和功能需求灵活调整</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LingzhengAnalysisView;
