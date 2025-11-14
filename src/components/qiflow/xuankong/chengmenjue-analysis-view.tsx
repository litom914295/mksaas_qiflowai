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
import { AlertCircle, DoorOpen, MapPin, Star } from 'lucide-react';
import React from 'react';

interface ChengmenjueAnalysisViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 城门诀视图组件
 * 展示玄空城门诀技法的分析和应用
 */
export function ChengmenjueAnalysisView({
  analysisResult,
  className = '',
}: ChengmenjueAnalysisViewProps) {
  const { chengmenjueAnalysis } = analysisResult;

  if (!chengmenjueAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">城门诀分析不可用</p>
          <p className="text-sm text-muted-foreground mt-1">高级功能未启用</p>
        </div>
      </div>
    );
  }

  // 解析城门诀数据结构
  const {
    hasChengmen = false,
    chengmenPositions = [],
    activationMethods = [],
    taboos = [],
  } = chengmenjueAnalysis as any;

  const applicable = hasChengmen;

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

  // 从分析结果中获取飞星盘数据（用于显示星曜组合）
  const plate = analysisResult?.basicAnalysis?.plates?.period || [];

  // 最佳城门位置（效果高的）
  const optimalGates = chengmenPositions
    .filter((p: any) => p.effectiveness === 'high')
    .map((p: any) => {
      const cell = plate.find((c: any) => c.palace === p.palace);
      return {
        direction: `${palaceToDirection[p.palace]}（${palaceToBagua[p.palace]}）`,
        palace: p.palace,
        mountainStar: cell?.mountainStar,
        facingStar: cell?.facingStar,
        rating: '上吉',
        description: p.description || `${palaceToBagua[p.palace]}宫城门`,
        effect: '高效催旺，建议重点利用',
      };
    });

  // 所有城门位置分析
  const gatePositions = chengmenPositions.map((p: any) => {
    const cell = plate.find((c: any) => c.palace === p.palace);
    return {
      direction: `${palaceToDirection[p.palace]}（${palaceToBagua[p.palace]}）`,
      palace: p.palace,
      rating:
        p.effectiveness === 'high'
          ? '上吉'
          : p.effectiveness === 'medium'
            ? '次吉'
            : '一般',
      mountainStar: cell?.mountainStar || '?',
      facingStar: cell?.facingStar || '?',
      analysis: p.description || `${palaceToBagua[p.palace]}宫城门分析`,
      suggestion:
        p.effectiveness === 'high'
          ? '强烈建议在此方位开门或设置动态元素'
          : p.effectiveness === 'medium'
            ? '可考虑在此方位开门或开窗'
            : '此方位作为城门效果一般',
      caution:
        p.effectiveness === 'low' ? '此方位城门效果较弱，需谨慎使用' : null,
    };
  });

  // 综合建议
  const recommendations = [
    ...activationMethods.slice(0, 3).map((m: string, i: number) => ({
      title: `催旺方法 ${i + 1}`,
      description: m,
      priority: 1,
    })),
    ...taboos.slice(0, 3).map((t: string, i: number) => ({
      title: `禁忌事项 ${i + 1}`,
      description: t,
      priority: 2,
    })),
  ];

  // 综合分析数据
  const analysis = {
    overallAssessment:
      chengmenjueAnalysis.overallAssessment ||
      '城门诀的应用需要结合实际户型和生活需求。',
    keyPoints: chengmenjueAnalysis.keyPoints || [],
    priorities: chengmenjueAnalysis.priorities || [],
  };

  // 获取城门评级颜色
  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case '上吉':
        return 'text-green-600';
      case '次吉':
        return 'text-blue-600';
      case '一般':
        return 'text-gray-600';
      case '不宜':
        return 'text-orange-600';
      case '大凶':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 城门诀概述 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DoorOpen className="w-5 h-5 text-primary" />
              <CardTitle>城门诀概述</CardTitle>
            </div>
            <Badge variant={applicable ? 'default' : 'secondary'}>
              {applicable ? '可应用' : '不适用'}
            </Badge>
          </div>
          <CardDescription>
            城门诀是玄空风水的重要技法，用于判断门窗等气口的最佳位置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 rounded-lg p-4 space-y-2">
            <p className="text-sm">
              <strong>城门诀理论:</strong> 城门是指宅内的门、窗等气口位置。
              城门诀通过分析飞星组合，确定哪些方位适合开门开窗，哪些方位应该封闭。
              合理运用城门诀可以引吉避凶，提升整体宅运。
            </p>
            <p className="text-sm">
              <strong>应用原则:</strong> 旺星宜开门窗纳气，衰星宜封闭避煞。
              同时需要考虑户型实际情况和生活需求，不可生搬硬套。
            </p>
          </div>
        </CardContent>
      </Card>

      {applicable && (
        <>
          {/* 最佳城门位置 */}
          <Card className="border-green-500">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-500" />
                <CardTitle>最佳城门位置</CardTitle>
              </div>
              <CardDescription>当前宅运最适合开门开窗的方位</CardDescription>
            </CardHeader>
            <CardContent>
              {optimalGates && optimalGates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {optimalGates.map((gate: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-2 border-green-500 rounded-lg p-4 bg-green-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-lg">
                            {gate.direction}
                          </span>
                        </div>
                        <Badge className="bg-green-600">第{idx + 1}优选</Badge>
                      </div>
                      <div className="space-y-2">
                        {/* 飞星组合 */}
                        {gate.mountainStar && gate.facingStar && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              飞星组合
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                山星: {gate.mountainStar}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                向星: {gate.facingStar}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {/* 评级 */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            吉凶评价
                          </p>
                          <Badge className="bg-green-500">{gate.rating}</Badge>
                        </div>
                        {/* 说明 */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            说明
                          </p>
                          <p className="text-sm">{gate.description}</p>
                        </div>
                        {/* 效果 */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            效果
                          </p>
                          <p className="text-sm text-green-700">
                            {gate.effect}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                  当前格局无高效城门位置
                </div>
              )}
            </CardContent>
          </Card>

          {/* 各方位城门分析 */}
          <Card>
            <CardHeader>
              <CardTitle>八方城门详细分析</CardTitle>
              <CardDescription>各个方位作为城门的吉凶评价</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gatePositions?.map((position: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <DoorOpen className="w-4 h-4" />
                        <span className="font-medium">
                          {position.direction}
                        </span>
                      </div>
                      <Badge
                        variant={
                          position.rating === '上吉' ||
                          position.rating === '次吉'
                            ? 'default'
                            : position.rating === '一般'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {position.rating}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {/* 飞星组合 */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          飞星组合
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            山星: {position.mountainStar}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            向星: {position.facingStar}
                          </Badge>
                        </div>
                      </div>

                      {/* 分析说明 */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          分析说明
                        </p>
                        <p className="text-sm">{position.analysis}</p>
                      </div>

                      {/* 使用建议 */}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          使用建议
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {position.suggestion}
                        </p>
                      </div>

                      {/* 注意事项 */}
                      {position.caution && (
                        <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                          ⚠️ {position.caution}
                        </div>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
                    暂无详细城门数据
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 综合分析 */}
          <Card>
            <CardHeader>
              <CardTitle>城门诀综合分析</CardTitle>
              <CardDescription>
                当前宅运的城门布局总体评价和建议
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 总体评价 */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">总体评价</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysis.overallAssessment ||
                      '城门诀的应用需要结合实际户型和生活需求。'}
                  </p>
                </div>

                {/* 关键要点 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">关键要点</h4>
                  <ul className="space-y-1 ml-4">
                    {analysis.keyPoints?.map((point: any, idx: number) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {point}
                      </li>
                    )) || (
                      <>
                        <li className="text-sm text-muted-foreground">
                          • 主门应开在旺星方位，有利于纳气聚财
                        </li>
                        <li className="text-sm text-muted-foreground">
                          • 衰星方位应尽量封闭，避免煞气进入
                        </li>
                        <li className="text-sm text-muted-foreground">
                          • 窗户的开闭也需要遵循城门诀原则
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                {/* 实施优先级 */}
                <div>
                  <h4 className="text-sm font-medium mb-2">实施优先级</h4>
                  <div className="space-y-2">
                    {analysis.priorities?.map((priority: any, idx: number) => (
                      <div
                        key={idx}
                        className="border-l-4 border-primary pl-3 py-2"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {priority.level}
                          </span>
                          <Badge variant="outline">{priority.timeframe}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {priority.description}
                        </p>
                      </div>
                    )) || (
                      <div className="text-sm text-muted-foreground">
                        建议优先调整主门和主要窗户的位置或使用方式
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 实施建议 */}
          <Card>
            <CardHeader>
              <CardTitle>城门诀实施建议</CardTitle>
              <CardDescription>具体的实施步骤和注意事项</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations?.map((rec: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-amber-700">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rec.description}
                        </p>
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
                        {rec.notes && (
                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 提示: {rec.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">基本实施步骤:</p>
                    <ul className="space-y-1 ml-4">
                      <li className="text-muted-foreground">
                        1. 确认当前所有门窗的准确方位
                      </li>
                      <li className="text-muted-foreground">
                        2. 根据城门诀分析结果，评估现有布局的合理性
                      </li>
                      <li className="text-muted-foreground">
                        3. 优先调整主门位置或改变使用习惯
                      </li>
                      <li className="text-muted-foreground">
                        4. 对于不宜开门的方位，考虑封闭或减少使用
                      </li>
                      <li className="text-muted-foreground">
                        5. 观察一段时间后评估效果，必要时进行微调
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
            <p className="font-medium">🚪 城门诀说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 城门诀是玄空风水判断门窗吉凶的重要方法</li>
              <li>• 门窗是宅内纳气的主要通道，位置选择至关重要</li>
              <li>• 实际应用需要结合户型结构和使用需求</li>
              <li>• 无法改变门窗位置时，可以调整使用频率来趋吉避凶</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChengmenjueAnalysisView;
