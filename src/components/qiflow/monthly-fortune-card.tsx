'use client';

/**
 * Phase 8: 月度运势卡片组件
 * 
 * 功能：
 * 1. 显示运势评分和状态
 * 2. 展示吉祥元素（方位、颜色、数字）
 * 3. 飞星九宫格可视化
 * 4. 生成按钮（含积分提示）
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { generateMonthlyFortuneAction } from '@/actions/qiflow/generate-monthly-fortune';
import type { BaziChart } from '@/lib/qiflow/bazi/types';

// ==================== 类型定义 ====================

interface MonthlyFortuneCardProps {
  year: number;
  month: number;
  baziChart?: BaziChart;
  fortune?: MonthlyFortuneData;
  onGenerate?: () => void;
}

interface MonthlyFortuneData {
  id: string;
  status: string;
  overallScore: number;
  luckyDirections?: string[];
  luckyColors?: string[];
  luckyNumbers?: number[];
  generatedAt: Date | null;
}

// ==================== 主组件 ====================

export function MonthlyFortuneCard({
  year,
  month,
  baziChart,
  fortune,
  onGenerate,
}: MonthlyFortuneCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!baziChart) {
      setError('请先完成八字排盘');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateMonthlyFortuneAction({
        year,
        month,
        baziChart,
        useAI: true,
      });

      if (result.success) {
        onGenerate?.();
      } else {
        setError(result.message || '生成失败');
      }
    } catch (err) {
      setError('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 未生成状态
  if (!fortune || fortune.status === 'pending') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {year}年{month}月运势
          </CardTitle>
          <CardDescription>
            基于玄空飞星和八字命理的个性化月度运势分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              尚未生成本月运势
            </p>
            <p className="text-sm text-muted-foreground">
              点击下方按钮生成个性化运势分析
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !baziChart}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成运势（30 积分）
              </>
            )}
          </Button>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!baziChart && (
            <p className="text-sm text-muted-foreground">
              请先在八字排盘页面完成排盘
            </p>
          )}
        </CardFooter>
      </Card>
    );
  }

  // 生成中状态
  if (fortune.status === 'generating') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {year}年{month}月运势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Sparkles className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-lg font-medium">正在生成运势...</p>
            <p className="text-sm text-muted-foreground mt-2">
              预计需要 3-5 秒
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 生成失败状态
  if (fortune.status === 'failed') {
    return (
      <Card className="w-full border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            生成失败
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            运势生成过程中出现错误，请重新尝试
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} variant="outline" className="w-full">
            重新生成
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 已完成状态 - 显示运势概览
  return (
    <Card className="w-full hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {year}年{month}月运势
          </CardTitle>
          <Badge variant={getScoreBadgeVariant(fortune.overallScore)}>
            {fortune.overallScore} 分
          </Badge>
        </div>
        <CardDescription>
          {fortune.generatedAt && (
            <span className="text-xs">
              生成于 {new Date(fortune.generatedAt).toLocaleDateString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 综合评分进度条 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">综合运势</span>
            <span className="text-sm text-muted-foreground">
              {getScoreLabel(fortune.overallScore)}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getScoreColor(fortune.overallScore)}`}
              style={{ width: `${fortune.overallScore}%` }}
            />
          </div>
        </div>

        {/* 吉祥元素 */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          {fortune.luckyDirections && fortune.luckyDirections.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">吉方位</p>
              <p className="text-sm font-medium">
                {fortune.luckyDirections[0]}
              </p>
            </div>
          )}
          {fortune.luckyColors && fortune.luckyColors.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">幸运色</p>
              <p className="text-sm font-medium">
                {fortune.luckyColors[0]}
              </p>
            </div>
          )}
          {fortune.luckyNumbers && fortune.luckyNumbers.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">幸运数字</p>
              <p className="text-sm font-medium">
                {fortune.luckyNumbers[0]}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full" asChild>
          <a href={`/qiflow/monthly-fortune/${fortune.id}`}>
            <TrendingUp className="mr-2 h-4 w-4" />
            查看详情
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// ==================== 辅助函数 ====================

function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  if (score >= 40) return 'outline';
  return 'destructive';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return '运势极佳';
  if (score >= 60) return '运势良好';
  if (score >= 40) return '运势平稳';
  return '运势欠佳';
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

// ==================== 飞星九宫格组件 ====================

interface FlyingStarGridProps {
  grid: Array<{
    direction: string;
    stars: number[];
    meaning: string;
    auspiciousness: string;
  }>;
}

export function FlyingStarGrid({ grid }: FlyingStarGridProps) {
  // 九宫格布局顺序 (洛书顺序)
  const positions = [
    { row: 2, col: 0, palace: 4 }, // 东南
    { row: 2, col: 1, palace: 9 }, // 正南
    { row: 2, col: 2, palace: 2 }, // 西南
    { row: 1, col: 0, palace: 3 }, // 正东
    { row: 1, col: 1, palace: 5 }, // 中宫
    { row: 1, col: 2, palace: 7 }, // 正西
    { row: 0, col: 0, palace: 8 }, // 东北
    { row: 0, col: 1, palace: 1 }, // 正北
    { row: 0, col: 2, palace: 6 }, // 西北
  ];

  return (
    <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
      {positions.map((pos) => {
        const palace = grid.find(g => {
          const directionMap: Record<string, number> = {
            '东南': 4, '正南': 9, '西南': 2,
            '正东': 3, '中宫': 5, '正西': 7,
            '东北': 8, '正北': 1, '西北': 6,
          };
          return directionMap[g.direction] === pos.palace;
        });

        if (!palace) return null;

        return (
          <div
            key={pos.palace}
            className={`
              aspect-square p-2 rounded-lg border-2 flex flex-col items-center justify-center
              ${getAuspiciousnessBorder(palace.auspiciousness)}
            `}
          >
            <div className="text-xs font-medium text-muted-foreground mb-1">
              {palace.direction}
            </div>
            <div className="text-lg font-bold">
              {palace.stars[0]}-{palace.stars[1]}
            </div>
            <div className="text-xs text-center mt-1">
              {getAuspiciousnessEmoji(palace.auspiciousness)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getAuspiciousnessBorder(level: string): string {
  switch (level) {
    case 'excellent': return 'border-green-500 bg-green-50';
    case 'good': return 'border-blue-500 bg-blue-50';
    case 'neutral': return 'border-gray-300 bg-gray-50';
    case 'poor': return 'border-yellow-500 bg-yellow-50';
    case 'dangerous': return 'border-red-500 bg-red-50';
    default: return 'border-gray-300';
  }
}

function getAuspiciousnessEmoji(level: string): string {
  switch (level) {
    case 'excellent': return '⭐⭐⭐';
    case 'good': return '⭐⭐';
    case 'neutral': return '⭐';
    case 'poor': return '⚠️';
    case 'dangerous': return '🚫';
    default: return '';
  }
}

// ==================== 导出 ====================

export type { MonthlyFortuneCardProps, MonthlyFortuneData, FlyingStarGridProps };
