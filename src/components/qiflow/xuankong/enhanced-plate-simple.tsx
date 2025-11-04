'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Compass, Star, TrendingDown, TrendingUp } from 'lucide-react';

interface SimpleEnhancedPlateProps {
  plate?: any;
  period?: number;
  className?: string;
}

// 简化版九星数据
const STAR_NAMES: Record<number, string> = {
  1: '一白贪狼水',
  2: '二黑巨门土',
  3: '三碧禄存木',
  4: '四绿文昌木',
  5: '五黄廉贞土',
  6: '六白武曲金',
  7: '七赤破军金',
  8: '八白左辅土',
  9: '九紫右弼火',
};

// 吉凶判断
const STAR_NATURE: Record<number, 'good' | 'bad' | 'neutral'> = {
  1: 'good',
  2: 'bad',
  3: 'bad',
  4: 'good',
  5: 'bad',
  6: 'good',
  7: 'bad',
  8: 'good',
  9: 'good',
};

// 方位名称
const POSITION_NAMES: Record<number, string> = {
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

export function SimpleEnhancedPlate({
  plate,
  period = 8,
  className,
}: SimpleEnhancedPlateProps) {
  // 九宫格位置（洛书排列）
  const gridPositions = [
    [4, 9, 2], // 东南 南 西南
    [3, 5, 7], // 东  中 西
    [8, 1, 6], // 东北 北 西北
  ];

  // 如果没有传入飞星盘数据，生成默认数据
  const defaultPlate = plate || [
    { position: 1, yun: 1, shan: 6, xiang: 8 },
    { position: 2, yun: 2, shan: 7, xiang: 9 },
    { position: 3, yun: 3, shan: 8, xiang: 1 },
    { position: 4, yun: 4, shan: 9, xiang: 2 },
    { position: 5, yun: 5, shan: 1, xiang: 3 },
    { position: 6, yun: 6, shan: 2, xiang: 4 },
    { position: 7, yun: 7, shan: 3, xiang: 5 },
    { position: 8, yun: 8, shan: 4, xiang: 6 },
    { position: 9, yun: 9, shan: 5, xiang: 7 },
  ];

  // 计算简单的宫位评分
  const calculateScore = (yun: number, shan: number, xiang: number): number => {
    let score = 50;

    // 吉星加分
    if (STAR_NATURE[yun] === 'good') score += 15;
    if (STAR_NATURE[shan] === 'good') score += 15;
    if (STAR_NATURE[xiang] === 'good') score += 15;

    // 凶星减分
    if (STAR_NATURE[yun] === 'bad') score -= 15;
    if (STAR_NATURE[shan] === 'bad') score -= 15;
    if (STAR_NATURE[xiang] === 'bad') score -= 15;

    // 当运星额外加分
    if (yun === period) score += 10;

    return Math.max(0, Math.min(100, score));
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            增强版九宫飞星盘
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 max-w-lg mx-auto">
            {gridPositions.map((row, rowIndex) =>
              row.map((position) => {
                const palace = defaultPlate.find(
                  (p: any) => p.position === position
                );
                if (!palace) return null;

                const score = calculateScore(
                  palace.yun,
                  palace.shan,
                  palace.xiang
                );
                const isGood = score >= 60;
                const isPoor = score < 40;

                return (
                  <Card
                    key={position}
                    className={cn(
                      'p-3 text-center relative',
                      isGood &&
                        'bg-green-50 dark:bg-green-900/20 border-green-300',
                      isPoor && 'bg-red-50 dark:bg-red-900/20 border-red-300',
                      !isGood && !isPoor && 'bg-gray-50 dark:bg-gray-800/20'
                    )}
                  >
                    {/* 方位标签 */}
                    <div className="absolute top-1 left-1 text-xs text-gray-500">
                      {POSITION_NAMES[position]}
                    </div>

                    {/* 评分 */}
                    <div className="absolute top-1 right-1">
                      {isGood ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : isPoor ? (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      ) : null}
                    </div>

                    {/* 三星显示 */}
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-center items-center gap-2">
                        <span className="text-xs text-gray-500">运</span>
                        <Badge
                          variant={
                            STAR_NATURE[palace.yun] === 'good'
                              ? 'default'
                              : 'destructive'
                          }
                          className="h-6"
                        >
                          {palace.yun}
                        </Badge>
                        {palace.yun === period && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>

                      <div className="flex justify-center items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">山</span>
                          <span
                            className={cn(
                              'font-semibold',
                              STAR_NATURE[palace.shan] === 'good'
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            {palace.shan}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">向</span>
                          <span
                            className={cn(
                              'font-semibold',
                              STAR_NATURE[palace.xiang] === 'good'
                                ? 'text-green-600'
                                : 'text-red-600'
                            )}
                          >
                            {palace.xiang}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 分数 */}
                    <div className="mt-2 text-xs font-medium text-gray-600">
                      {score}分
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* 图例 */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>吉星</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>凶星</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span>当运星</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
