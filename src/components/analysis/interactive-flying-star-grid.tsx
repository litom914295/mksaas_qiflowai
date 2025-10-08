'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import type { EnhancedPlateCell } from '@/lib/qiflow/xuankong/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface InteractiveFlyingStarGridProps {
  plate: EnhancedPlateCell[];
  onCellClick?: (cell: EnhancedPlateCell) => void;
  className?: string;
  showStarNames?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 交互式九宫飞星盘组件
 *
 * 功能:
 * - 3x3九宫格展示飞星盘
 * - 鼠标悬停显示详细信息
 * - 点击宫位查看完整分析
 * - 响应式尺寸调整
 * - 颜色编码显示吉凶
 */
export function InteractiveFlyingStarGrid({
  plate,
  onCellClick,
  className,
  showStarNames = false,
  size = 'md',
}: InteractiveFlyingStarGridProps) {
  const [selectedPalace, setSelectedPalace] = useState<number | null>(null);

  // 九宫格布局映射 (洛书顺序)
  const gridLayout = [
    [4, 9, 2], // 巽(4) 离(9) 坤(2)
    [3, 5, 7], // 震(3) 中(5) 兑(7)
    [8, 1, 6], // 艮(8) 坎(1) 乾(6)
  ];

  // 获取单元格尺寸
  const getCellSize = () => {
    switch (size) {
      case 'sm':
        return 'w-20 h-20 text-xs';
      case 'md':
        return 'w-32 h-32 text-sm';
      case 'lg':
        return 'w-40 h-40 text-base';
      default:
        return 'w-32 h-32 text-sm';
    }
  };

  // 获取星曜颜色
  const getStarColor = (star: number): string => {
    const colorMap: Record<number, string> = {
      1: 'text-blue-600',
      2: 'text-gray-600',
      3: 'text-green-600',
      4: 'text-emerald-600',
      5: 'text-yellow-600',
      6: 'text-purple-600',
      7: 'text-red-600',
      8: 'text-amber-600',
      9: 'text-pink-600',
    };
    return colorMap[star] || 'text-gray-600';
  };

  // 获取背景颜色根据评分
  const getBgColor = (verdict: string): string => {
    switch (verdict) {
      case '大吉':
        return 'bg-green-50 border-green-300';
      case '吉':
        return 'bg-blue-50 border-blue-300';
      case '平':
        return 'bg-gray-50 border-gray-300';
      case '凶':
        return 'bg-orange-50 border-orange-300';
      case '大凶':
        return 'bg-red-50 border-red-300';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  // 处理单元格点击
  const handleCellClick = (cell: EnhancedPlateCell) => {
    setSelectedPalace(cell.palace);
    onCellClick?.(cell);
  };

  return (
    <div className={cn('inline-block', className)}>
      {/* 九宫格容器 */}
      <div className="grid grid-cols-3 gap-1 p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-300">
        {gridLayout.map((row, rowIndex) =>
          row.map((palaceIndex, colIndex) => {
            const cell = plate.find((c) => c.palace === palaceIndex);
            if (!cell) return null;

            const { displayConfig, evaluation, combinationAnalysis } = cell;
            const isSelected = selectedPalace === cell.palace;

            return (
              <HoverCard key={`${rowIndex}-${colIndex}`} openDelay={200}>
                <HoverCardTrigger asChild>
                  <Card
                    className={cn(
                      getCellSize(),
                      'cursor-pointer transition-all hover:shadow-lg hover:scale-105',
                      getBgColor(combinationAnalysis.verdict),
                      isSelected && 'ring-2 ring-primary ring-offset-2',
                      'border-2'
                    )}
                    onClick={() => handleCellClick(cell)}
                  >
                    <CardContent className="p-2 h-full flex flex-col items-center justify-center">
                      {/* 方位和宫位名 */}
                      <div className="text-center mb-1">
                        <div className="font-semibold text-xs text-muted-foreground">
                          {displayConfig.direction}
                        </div>
                        <div className="font-bold text-sm">
                          {displayConfig.name}宫
                        </div>
                      </div>

                      {/* 飞星数字 */}
                      <div className="flex items-center justify-center gap-2 my-1">
                        {/* 山星 */}
                        <div className="text-center">
                          <div
                            className={cn(
                              'text-lg font-bold',
                              getStarColor(cell.mountainStar)
                            )}
                          >
                            {cell.mountainStar}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            山
                          </div>
                        </div>

                        {/* 运星(中间) */}
                        {cell.periodStar && (
                          <div className="text-center">
                            <div
                              className={cn(
                                'text-base font-semibold',
                                getStarColor(cell.periodStar)
                              )}
                            >
                              {cell.periodStar}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              运
                            </div>
                          </div>
                        )}

                        {/* 向星 */}
                        <div className="text-center">
                          <div
                            className={cn(
                              'text-lg font-bold',
                              getStarColor(cell.facingStar)
                            )}
                          >
                            {cell.facingStar}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            向
                          </div>
                        </div>
                      </div>

                      {/* 评价徽章 */}
                      <div className="mt-1">
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-1 py-0.5 rounded',
                            combinationAnalysis.verdict === '大吉' &&
                              'bg-green-200 text-green-800',
                            combinationAnalysis.verdict === '吉' &&
                              'bg-blue-200 text-blue-800',
                            combinationAnalysis.verdict === '平' &&
                              'bg-gray-200 text-gray-800',
                            combinationAnalysis.verdict === '凶' &&
                              'bg-orange-200 text-orange-800',
                            combinationAnalysis.verdict === '大凶' &&
                              'bg-red-200 text-red-800'
                          )}
                        >
                          {combinationAnalysis.verdict}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </HoverCardTrigger>

                {/* 悬停卡片 - 显示详细信息 */}
                <HoverCardContent className="w-80" side="right">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        {displayConfig.name}宫 ({displayConfig.direction}方)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        五行: {displayConfig.element}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-medium">山星: </span>
                        <span className={getStarColor(cell.mountainStar)}>
                          {cell.mountainStar} {cell.mountainStarInfo.name}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          ({cell.mountainStarInfo.status})
                        </span>
                      </div>

                      <div className="text-xs">
                        <span className="font-medium">向星: </span>
                        <span className={getStarColor(cell.facingStar)}>
                          {cell.facingStar} {cell.facingStarInfo.name}
                        </span>
                        <span className="ml-2 text-muted-foreground">
                          ({cell.facingStarInfo.status})
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="text-xs font-medium mb-1">综合评价:</div>
                      <div className="text-xs text-muted-foreground">
                        {combinationAnalysis.mountainFacing}
                      </div>
                      <div className="mt-1">
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            combinationAnalysis.verdict === '大吉' &&
                              'text-green-600',
                            combinationAnalysis.verdict === '吉' &&
                              'text-blue-600',
                            combinationAnalysis.verdict === '平' &&
                              'text-gray-600',
                            combinationAnalysis.verdict === '凶' &&
                              'text-orange-600',
                            combinationAnalysis.verdict === '大凶' &&
                              'text-red-600'
                          )}
                        >
                          {combinationAnalysis.verdict}
                        </span>
                      </div>
                    </div>

                    {evaluation && evaluation.score > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">评分:</span>
                          <span className="font-semibold">
                            {evaluation.score}/10
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground italic">
                      点击查看完整分析
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })
        )}
      </div>

      {/* 图例 */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-200 border border-green-300 rounded" />
          <span>大吉</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded" />
          <span>吉</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded" />
          <span>平</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded" />
          <span>凶</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 border border-red-300 rounded" />
          <span>大凶</span>
        </div>
      </div>
    </div>
  );
}
