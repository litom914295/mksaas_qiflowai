'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PalaceIndex, PlateCell } from '@/lib/qiflow/xuankong/types';
import { Info, Star, TrendingDown, TrendingUp } from 'lucide-react';

interface EnhancedFlyingStarGridProps {
  plate: PlateCell[];
  period: number;
  evaluation?: Record<
    PalaceIndex,
    { score: number; tags: string[]; reasons: string[] }
  >;
  showDetails?: boolean;
}

// 宫位名称映射
const palaceNames: Record<number, string> = {
  1: '坎宫（北）',
  2: '坤宫（西南）',
  3: '震宫（东）',
  4: '巽宫（东南）',
  5: '中宫',
  6: '乾宫（西北）',
  7: '兑宫（西）',
  8: '艮宫（东北）',
  9: '离宫（南）',
};

// 九星名称和属性
const starInfo: Record<
  number,
  { name: string; color: string; nature: '吉' | '凶' }
> = {
  1: { name: '一白', color: 'blue', nature: '吉' },
  2: { name: '二黑', color: 'gray', nature: '凶' },
  3: { name: '三碧', color: 'green', nature: '凶' },
  4: { name: '四绿', color: 'green', nature: '吉' },
  5: { name: '五黄', color: 'yellow', nature: '凶' },
  6: { name: '六白', color: 'white', nature: '吉' },
  7: { name: '七赤', color: 'red', nature: '凶' },
  8: { name: '八白', color: 'white', nature: '吉' },
  9: { name: '九紫', color: 'purple', nature: '吉' },
};

// 获取评分颜色
const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

// 获取星曜颜色
const getStarColor = (star: number) => {
  const info = starInfo[star];
  if (!info) return 'bg-gray-200 text-gray-700';

  if (info.nature === '吉') {
    return 'bg-green-100 text-green-800';
  }
  return 'bg-red-100 text-red-800';
};

export function EnhancedFlyingStarGrid({
  plate,
  period,
  evaluation,
  showDetails = true,
}: EnhancedFlyingStarGridProps) {
  // 九宫格布局顺序（洛书顺序）
  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];

  // 获取宫位数据
  const getCellData = (palace: number) => {
    return plate.find((cell) => cell.palace === palace);
  };

  // 渲染单个宫位
  const renderCell = (palace: number) => {
    const cell = getCellData(palace);
    const evaluation_result = evaluation?.[palace as PalaceIndex];

    if (!cell) return null;

    const isPeriodStar = cell.periodStar === period;
    const is旺山旺水 =
      cell.mountainStar === period && cell.facingStar === period;
    const is上山下水 =
      cell.mountainStar === period && cell.facingStar !== period;

    return (
      <TooltipProvider key={palace}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
                relative aspect-square border-2 rounded-lg p-2 cursor-help
                transition-all hover:shadow-lg hover:scale-105
                ${evaluation_result ? getScoreColor(evaluation_result.score) : 'bg-white border-gray-300'}
                ${is旺山旺水 ? 'ring-4 ring-green-400' : ''}
                ${is上山下水 ? 'ring-4 ring-red-400' : ''}
              `}
            >
              {/* 宫位标签 */}
              <div className="absolute top-0 left-0 right-0 text-center">
                <span className="text-xs font-medium opacity-70">
                  {palaceNames[palace]}
                </span>
              </div>

              {/* 中心区域 - 三星显示 */}
              <div className="flex flex-col items-center justify-center h-full space-y-1 mt-4">
                {/* 运星（中） */}
                {cell.periodStar && (
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStarColor(cell.periodStar)}`}
                    >
                      {cell.periodStar}
                    </Badge>
                    {isPeriodStar && (
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                )}

                {/* 山向星组合 */}
                <div className="flex items-center gap-2">
                  {/* 山星（左） */}
                  <Badge
                    variant="secondary"
                    className={`text-lg font-bold ${getStarColor(cell.mountainStar)}`}
                  >
                    {cell.mountainStar}
                  </Badge>

                  {/* 向星（右） */}
                  <Badge
                    variant="secondary"
                    className={`text-lg font-bold ${getStarColor(cell.facingStar)}`}
                  >
                    {cell.facingStar}
                  </Badge>
                </div>

                {/* 评分显示 */}
                {evaluation_result && showDetails && (
                  <div className="text-xs font-semibold mt-1">
                    {evaluation_result.score}分
                  </div>
                )}
              </div>

              {/* 吉凶指示 */}
              {evaluation_result && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                  {evaluation_result.score >= 70 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : evaluation_result.score < 50 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : null}
                </div>
              )}
            </div>
          </TooltipTrigger>

          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold">{palaceNames[palace]}</div>
              <div className="text-sm space-y-1">
                <div>
                  山星：{starInfo[cell.mountainStar]?.name} ({cell.mountainStar}
                  )
                </div>
                <div>
                  向星：{starInfo[cell.facingStar]?.name} ({cell.facingStar})
                </div>
                {cell.periodStar && (
                  <div>
                    运星：{starInfo[cell.periodStar]?.name} ({cell.periodStar})
                  </div>
                )}
              </div>
              {evaluation_result && (
                <>
                  <div className="text-sm font-medium pt-2 border-t">
                    评分：{evaluation_result.score} / 100
                  </div>
                  {evaluation_result.tags.length > 0 && (
                    <div className="text-sm">
                      标签：{evaluation_result.tags.join('、')}
                    </div>
                  )}
                  {evaluation_result.reasons.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {evaluation_result.reasons[0]}
                    </div>
                  )}
                </>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            {period}运九宫飞星盘
          </CardTitle>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">悬停查看详情</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 飞星盘网格 */}
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
          {gridOrder.map((palace) => renderCell(palace))}
        </div>

        {/* 图例说明 */}
        {showDetails && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="font-semibold text-sm mb-2">图例说明：</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>当运星</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 rounded" />
                <span>吉星</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 rounded" />
                <span>凶星</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span>吉利方位</span>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2">
              <div>• 大数字：山星（左）+ 向星（右）</div>
              <div>• 小数字：运星（中）</div>
              <div>• 绿框：旺山旺水格局</div>
              <div>• 红框：上山下水格局</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
