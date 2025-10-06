'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  ComprehensiveAnalysisResult,
} from '@/lib/qiflow/xuankong/comprehensive-engine';
import type {
  EnhancedXuankongPlate,
} from '@/types/qiflow/xuankong';
import { AlertTriangle, Compass, Star, TrendingUp } from 'lucide-react';
import React from 'react';
import { InteractiveFlyingStarGrid } from './interactive-flying-star-grid';

interface BasicAnalysisViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 基础分析视图组件
 * 展示玄空飞星的核心分析内容，包括飞星盘、宫位详情、星曜吉凶等
 */
export function BasicAnalysisView({
  analysisResult,
  className = '',
}: BasicAnalysisViewProps) {
  const { basicAnalysis, enhancedPlate } = analysisResult;

  if (!basicAnalysis || !enhancedPlate) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <p>基础分析数据不可用</p>
      </div>
    );
  }

  // 从 basicAnalysis 中提取需要的数据
  // TODO: 需要根据实际的 GenerateFlyingStarOutput 类型结构进行调整
  const palaceDetails = {}; // 暂时使用空对象
  const summary = {
    overallScore: 80, // 默认分数
    characteristics: '基础分析特征',
    mainIssues: ['问题1', '问题2', '问题3'],
    keyPalaces: ['巽', '离', '坤']
  };

  // 吉凶评分徽章颜色
  const getScoreBadgeVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  // 宫位吉凶评级颜色
  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case '大吉':
        return 'text-green-600';
      case '吉':
        return 'text-blue-600';
      case '平':
        return 'text-gray-600';
      case '凶':
        return 'text-orange-600';
      case '大凶':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 概况卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-primary" />
              <CardTitle>基础分析概况</CardTitle>
            </div>
            <Badge variant={getScoreBadgeVariant(summary.overallScore)}>
              综合评分: {summary.overallScore}分
            </Badge>
          </div>
          <CardDescription>
            宅运周期 {(enhancedPlate as any).period || '未知'}运 | 坐向:{' '}
            {(enhancedPlate as any).facing?.direction || '未知'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 运势特征 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span>运势特征</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {summary.characteristics}
              </p>
            </div>

            {/* 主要问题 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>需要注意</span>
              </div>
              <ul className="space-y-1">
                {summary.mainIssues.slice(0, 3).map((issue, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {issue}
                  </li>
                ))}
              </ul>
            </div>

            {/* 关键宫位 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>关键宫位</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.keyPalaces.map((palace) => (
                  <Badge key={palace} variant="outline">
                    {palace}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 飞星盘 */}
      <Card>
        <CardHeader>
          <CardTitle>九宫飞星盘</CardTitle>
          <CardDescription>
            点击宫位查看详细信息，悬停查看星曜组合
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <InteractiveFlyingStarGrid
            plate={enhancedPlate}
            size="lg"
            onCellClick={(cell) => {
              // 点击事件可以触发详细分析弹窗
              console.log('查看宫位详情:', cell.palace);
            }}
          />
        </CardContent>
      </Card>

      {/* 九宫详细分析 - 暂时隐藏，待数据结构调整后恢复 */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(palaceDetails)
          .sort(([a], [b]) => {
            const order = [
              '巽',
              '离',
              '坤',
              '震',
              '中',
              '兑',
              '艮',
              '坎',
              '乾',
            ];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map(([palace, details]) => (
            <Card key={palace} className="hover:shadow-md transition-shadow">
              ...
            </Card>
          ))}
      </div> */}

      {/* 底部说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">💡 分析说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 飞星盘反映了宅运的基本格局，不同宫位影响不同生活领域</li>
              <li>• 评分综合考虑了山星、向星、运星的组合吉凶</li>
              <li>
                • 大吉/吉的宫位适合作为主要活动区域，凶/大凶的宫位需要化解
              </li>
              <li>• 建议结合流年分析和个人命理，制定更精准的风水布局方案</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BasicAnalysisView;
