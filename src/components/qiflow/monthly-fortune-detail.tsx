'use client';

/**
 * Phase 8: 月度运势详情页面组件
 * 
 * 功能：
 * 1. 完整显示运势报告（事业、财运、感情、健康）
 * 2. 飞星九宫格详细分析
 * 3. 八字时令性分析
 * 4. 化解方法建议
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  DollarSign, 
  Heart, 
  Activity, 
  MapPin, 
  Palette, 
  Hash,
  AlertCircle,
  Lightbulb,
  Calendar
} from 'lucide-react';
import { FlyingStarGrid } from './monthly-fortune-card';

// ==================== 类型定义 ====================

interface MonthlyFortuneDetailProps {
  fortune: MonthlyFortuneFullData;
}

interface MonthlyFortuneFullData {
  id: string;
  userId: string;
  year: number;
  month: number;
  status: string;
  fortuneData: {
    career: string;
    wealth: string;
    relationship: string;
    health: string;
  };
  flyingStarAnalysis: {
    grid: Array<{
      direction: string;
      stars: number[];
      meaning: string;
      auspiciousness: string;
    }>;
    auspiciousDirections: string[];
    inauspiciousDirections: string[];
    remedies: string[];
  };
  baziTimeliness: {
    seasonScore: number;
    elementBalance: Record<string, number>;
    favorableElements: string[];
    unfavorableElements: string[];
  };
  overallScore: number;
  luckyDirections: string[];
  luckyColors: string[];
  luckyNumbers: number[];
  warnings: string[];
  generatedAt: Date | null;
}

// ==================== 主组件 ====================

export function MonthlyFortuneDetail({ fortune }: MonthlyFortuneDetailProps) {
  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            {fortune.year}年{fortune.month}月运势
          </h1>
          {fortune.generatedAt && (
            <p className="text-muted-foreground mt-2">
              生成于 {new Date(fortune.generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-primary">
            {fortune.overallScore}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            综合评分
          </div>
        </div>
      </div>

      <Separator />

      {/* 吉祥元素 */}
      <Card>
        <CardHeader>
          <CardTitle>本月吉祥元素</CardTitle>
          <CardDescription>
            这些元素能够为您带来好运，建议在日常生活中多加运用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 吉方位 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                吉利方位
              </div>
              <div className="flex flex-wrap gap-2">
                {fortune.luckyDirections.map((dir) => (
                  <Badge key={dir} variant="secondary" className="text-base">
                    {dir}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                办公座位、睡觉头部朝向、出行方向等可选择这些方位
              </p>
            </div>

            {/* 幸运色 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Palette className="h-5 w-5 text-primary" />
                幸运颜色
              </div>
              <div className="flex flex-wrap gap-2">
                {fortune.luckyColors.map((color) => (
                  <Badge key={color} variant="secondary" className="text-base">
                    {color}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                服装、配饰、家居装饰可多选用这些颜色
              </p>
            </div>

            {/* 幸运数字 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Hash className="h-5 w-5 text-primary" />
                幸运数字
              </div>
              <div className="flex flex-wrap gap-2">
                {fortune.luckyNumbers.map((num) => (
                  <Badge key={num} variant="secondary" className="text-base">
                    {num}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                手机号、车牌号、楼层等可优先选择包含这些数字
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 运势预测 Tabs */}
      <Tabs defaultValue="career" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="career" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            事业运
          </TabsTrigger>
          <TabsTrigger value="wealth" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            财运
          </TabsTrigger>
          <TabsTrigger value="relationship" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            感情运
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            健康运
          </TabsTrigger>
        </TabsList>

        <TabsContent value="career" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                事业运势
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              {fortune.fortuneData.career.split('\n').map((para, idx) => (
                <p key={idx} className="text-base leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wealth" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                财运
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              {fortune.fortuneData.wealth.split('\n').map((para, idx) => (
                <p key={idx} className="text-base leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relationship" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                感情运势
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              {fortune.fortuneData.relationship.split('\n').map((para, idx) => (
                <p key={idx} className="text-base leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                健康运势
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              {fortune.fortuneData.health.split('\n').map((para, idx) => (
                <p key={idx} className="text-base leading-relaxed mb-4">
                  {para}
                </p>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 飞星九宫格分析 */}
      <Card>
        <CardHeader>
          <CardTitle>玄空飞星九宫分析</CardTitle>
          <CardDescription>
            当月九宫飞星分布及吉凶评判
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FlyingStarGrid grid={fortune.flyingStarAnalysis.grid} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                吉利方位
              </h4>
              <ul className="space-y-1">
                {fortune.flyingStarAnalysis.auspiciousDirections.map((dir) => (
                  <li key={dir} className="text-sm text-green-700">
                    • {dir}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">
                不利方位
              </h4>
              <ul className="space-y-1">
                {fortune.flyingStarAnalysis.inauspiciousDirections.map((dir) => (
                  <li key={dir} className="text-sm text-red-700">
                    • {dir}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 八字时令性分析 */}
      <Card>
        <CardHeader>
          <CardTitle>八字时令性分析</CardTitle>
          <CardDescription>
            根据您的八字命局分析当月时令影响
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">时令得分</span>
              <span className="text-2xl font-bold text-primary">
                {fortune.baziTimeliness.seasonScore}分
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${fortune.baziTimeliness.seasonScore}%` }}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700">
                有利元素
              </h4>
              <div className="flex flex-wrap gap-2">
                {fortune.baziTimeliness.favorableElements.map((elem) => (
                  <Badge key={elem} variant="default">
                    {elem}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-red-700">
                不利元素
              </h4>
              <div className="flex flex-wrap gap-2">
                {fortune.baziTimeliness.unfavorableElements.map((elem) => (
                  <Badge key={elem} variant="destructive">
                    {elem}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 化解建议 */}
      {fortune.flyingStarAnalysis.remedies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              化解方法建议
            </CardTitle>
            <CardDescription>
              针对本月不利因素的化解建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {fortune.flyingStarAnalysis.remedies.map((remedy, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <p className="flex-1 text-base">{remedy}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 注意事项 */}
      {fortune.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertCircle className="h-5 w-5" />
              本月注意事项
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {fortune.warnings.map((warning, idx) => (
                <li key={idx} className="flex items-start gap-2 text-yellow-800">
                  <span className="text-yellow-600">⚠️</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== 导出 ====================

export type { MonthlyFortuneDetailProps, MonthlyFortuneFullData };
