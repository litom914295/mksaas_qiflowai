'use client';

import { Card } from '@/components/ui/card';
import type { FlyingStarPlate, Palace } from '@/lib/qiflow/xuankong/types';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  DollarSign,
  Heart,
  Home,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

interface EnhancedFlyingStarPlateProps {
  plate: FlyingStarPlate;
  period: number;
  facing?: { degrees: number };
  showTooltip?: boolean;
  className?: string;
}

// 九星属性定义 - 基于实战经验
const STAR_ATTRIBUTES = {
  1: {
    name: '一白贪狼',
    element: '水',
    nature: '吉',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Heart,
    keywords: ['桃花', '人缘', '财运', '智慧'],
    goodFor: ['卧室', '书房', '客厅'],
    avoid: ['厨房', '卫生间'],
  },
  2: {
    name: '二黑巨门',
    element: '土',
    nature: '凶',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    icon: AlertTriangle,
    keywords: ['病符', '小人', '孕妇慎居'],
    goodFor: ['储藏室'],
    avoid: ['卧室', '厨房', '办公室'],
  },
  3: {
    name: '三碧禄存',
    element: '木',
    nature: '凶',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: Users,
    keywords: ['是非', '官非', '争执'],
    goodFor: [],
    avoid: ['卧室', '客厅', '办公室'],
  },
  4: {
    name: '四绿文昌',
    element: '木',
    nature: '吉',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    icon: BookOpen,
    keywords: ['文昌', '学业', '事业', '智慧'],
    goodFor: ['书房', '儿童房', '办公室'],
    avoid: [],
  },
  5: {
    name: '五黄廉贞',
    element: '土',
    nature: '大凶',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: AlertCircle,
    keywords: ['五黄煞', '灾祸', '破财', '疾病'],
    goodFor: [],
    avoid: ['所有房间', '尤其主卧和大门'],
  },
  6: {
    name: '六白武曲',
    element: '金',
    nature: '吉',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    icon: DollarSign,
    keywords: ['偏财', '权力', '驿马', '贵人'],
    goodFor: ['办公室', '客厅', '主卧'],
    avoid: [],
  },
  7: {
    name: '七赤破军',
    element: '金',
    nature: '凶',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: Shield,
    keywords: ['破财', '盗贼', '口舌', '手术'],
    goodFor: [],
    avoid: ['卧室', '保险柜位置', '收银台'],
  },
  8: {
    name: '八白左辅',
    element: '土',
    nature: '大吉',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: Star,
    keywords: ['当运财星', '正财', '升职', '置业'],
    goodFor: ['所有房间', '特别是客厅、办公室'],
    avoid: [],
  },
  9: {
    name: '九紫右弼',
    element: '火',
    nature: '吉',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    icon: Zap,
    keywords: ['喜庆', '姻缘', '贵人', '名声'],
    goodFor: ['客厅', '卧室', '餐厅'],
    avoid: [],
  },
} as const;

// 宫位对应方位
const PALACE_DIRECTIONS = {
  1: { name: '坎宫', direction: '北', bagua: '☵' },
  2: { name: '坤宫', direction: '西南', bagua: '☷' },
  3: { name: '震宫', direction: '东', bagua: '☳' },
  4: { name: '巽宫', direction: '东南', bagua: '☴' },
  5: { name: '中宫', direction: '中央', bagua: '☯' },
  6: { name: '乾宫', direction: '西北', bagua: '☰' },
  7: { name: '兑宫', direction: '西', bagua: '☱' },
  8: { name: '艮宫', direction: '东北', bagua: '☶' },
  9: { name: '离宫', direction: '南', bagua: '☲' },
};

// 重要格局判断
function analyzePattern(
  palace: Palace,
  period: number
): {
  isWangShanWangShui?: boolean;
  isShangShanXiaShui?: boolean;
  isDoubleStar?: boolean;
  isCaiXing?: boolean;
  isWenChang?: boolean;
} {
  const pattern: any = {};

  // 判断旺山旺水（山星向星都是当运星）
  if (palace.shan === period && palace.xiang === period) {
    pattern.isWangShanWangShui = true;
  }

  // 判断上山下水（山星到向，向星到山）
  if (
    (palace.position === 1 && palace.xiang === period) ||
    (palace.position === 9 && palace.shan === period)
  ) {
    pattern.isShangShanXiaShui = true;
  }

  // 判断双星到向/到山
  if (palace.shan === 8 && palace.xiang === 8) {
    pattern.isDoubleStar = true;
  }

  // 判断财星（8白当运）
  if (palace.yun === 8 || palace.shan === 8 || palace.xiang === 8) {
    pattern.isCaiXing = true;
  }

  // 判断文昌（4绿）
  if (palace.yun === 4 || palace.shan === 4 || palace.xiang === 4) {
    pattern.isWenChang = true;
  }

  return pattern;
}

// 计算宫位吉凶分数
function calculatePalaceScore(palace: Palace, period: number): number {
  let score = 50; // 基础分

  // 运星影响（40%权重）
  const yunStar = STAR_ATTRIBUTES[palace.yun as keyof typeof STAR_ATTRIBUTES];
  if (yunStar.nature === '大吉') score += 20;
  else if (yunStar.nature === '吉') score += 10;
  else if (yunStar.nature === '凶') score -= 10;
  else if (yunStar.nature === '大凶') score -= 20;

  // 山星影响（30%权重）
  const shanStar = STAR_ATTRIBUTES[palace.shan as keyof typeof STAR_ATTRIBUTES];
  if (shanStar.nature === '大吉') score += 15;
  else if (shanStar.nature === '吉') score += 8;
  else if (shanStar.nature === '凶') score -= 8;
  else if (shanStar.nature === '大凶') score -= 15;

  // 向星影响（30%权重）
  const xiangStar =
    STAR_ATTRIBUTES[palace.xiang as keyof typeof STAR_ATTRIBUTES];
  if (xiangStar.nature === '大吉') score += 15;
  else if (xiangStar.nature === '吉') score += 8;
  else if (xiangStar.nature === '凶') score -= 8;
  else if (xiangStar.nature === '大凶') score -= 15;

  // 特殊格局加分
  const pattern = analyzePattern(palace, period);
  if (pattern.isWangShanWangShui) score += 20;
  if (pattern.isShangShanXiaShui) score -= 15;
  if (pattern.isDoubleStar) score += 10;

  return Math.max(0, Math.min(100, score));
}

export function EnhancedFlyingStarPlate({
  plate,
  period,
  facing,
  showTooltip = true,
  className,
}: EnhancedFlyingStarPlateProps) {
  // 按九宫格位置排列
  const gridPositions = [
    [4, 9, 2], // 巽 离 坤
    [3, 5, 7], // 震 中 兑
    [8, 1, 6], // 艮 坎 乾
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* 标题和说明 */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          九宫飞星盘 - 八运（2004-2023）
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          坐向：{facing ? `${Math.round(facing.degrees)}°` : '未设定'} |
          当运星：八白左辅土
        </p>
      </div>

      {/* 九宫格飞星盘 */}
      <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
        {gridPositions.map((row, rowIndex) =>
          row.map((position) => {
            const palace = plate.find((p) => p.position === position);
            if (!palace) return null;

            const score = calculatePalaceScore(palace, period);
            const pattern = analyzePattern(palace, period);
            const direction =
              PALACE_DIRECTIONS[position as keyof typeof PALACE_DIRECTIONS];
            const yunStar =
              STAR_ATTRIBUTES[palace.yun as keyof typeof STAR_ATTRIBUTES];
            const shanStar =
              STAR_ATTRIBUTES[palace.shan as keyof typeof STAR_ATTRIBUTES];
            const xiangStar =
              STAR_ATTRIBUTES[palace.xiang as keyof typeof STAR_ATTRIBUTES];

            return (
              <Card
                key={position}
                className={cn(
                  'relative h-40 p-3 transition-all duration-300 hover:scale-105 hover:shadow-xl',
                  'cursor-pointer group',
                  pattern.isWangShanWangShui &&
                    'ring-2 ring-green-500 ring-offset-2',
                  pattern.isShangShanXiaShui &&
                    'ring-2 ring-red-500 ring-offset-2',
                  score >= 70
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                    : score >= 40
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                      : 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
                )}
              >
                {/* 宫位信息 */}
                <div className="absolute top-1 left-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {direction.bagua} {direction.name}
                </div>

                {/* 方位 */}
                <div className="absolute top-1 right-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {direction.direction}
                </div>

                {/* 三星排列 */}
                <div className="flex justify-center items-center h-full">
                  <div className="grid grid-cols-3 gap-1 text-center">
                    {/* 山星 */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        山
                      </span>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                          shanStar.bgColor,
                          shanStar.color
                        )}
                      >
                        {palace.shan}
                      </div>
                    </div>

                    {/* 运星 */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        运
                      </span>
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
                          yunStar.bgColor,
                          yunStar.color,
                          palace.yun === period && 'ring-2 ring-yellow-400'
                        )}
                      >
                        {palace.yun}
                        {palace.yun === period && (
                          <span className="absolute -top-1 -right-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 向星 */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        向
                      </span>
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                          xiangStar.bgColor,
                          xiangStar.color
                        )}
                      >
                        {palace.xiang}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 吉凶评分 */}
                <div className="absolute bottom-1 left-2 flex items-center gap-1">
                  <div
                    className={cn(
                      'text-xs font-bold px-1.5 py-0.5 rounded',
                      score >= 70
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : score >= 40
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    )}
                  >
                    {score}分
                  </div>
                  {score >= 70 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : score < 40 ? (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  ) : null}
                </div>

                {/* 特殊标记 */}
                <div className="absolute bottom-1 right-2 flex gap-1">
                  {pattern.isCaiXing && (
                    <DollarSign className="w-4 h-4 text-yellow-600 fill-yellow-200" />
                  )}
                  {pattern.isWenChang && (
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  )}
                  {(palace.yun === 5 ||
                    palace.shan === 5 ||
                    palace.xiang === 5) && (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  {(palace.yun === 2 ||
                    palace.shan === 2 ||
                    palace.xiang === 2) && (
                    <Activity className="w-4 h-4 text-amber-600" />
                  )}
                </div>

                {/* 悬浮提示 */}
                {showTooltip && (
                  <div className="absolute inset-0 bg-black/90 text-white p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 overflow-y-auto">
                    <div className="text-sm space-y-2">
                      <div className="font-bold text-yellow-400">
                        {direction.name} - {direction.direction}
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div>运星：{yunStar.name}</div>
                        <div>山星：{shanStar.name}</div>
                        <div>向星：{xiangStar.name}</div>
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div className="text-xs">
                          关键词：
                          {[
                            ...yunStar.keywords,
                            ...shanStar.keywords,
                            ...xiangStar.keywords,
                          ]
                            .filter((v, i, a) => a.indexOf(v) === i)
                            .join('、')}
                        </div>
                      </div>
                      {pattern.isWangShanWangShui && (
                        <div className="text-green-400 text-xs">
                          ✨ 旺山旺水格局
                        </div>
                      )}
                      {pattern.isShangShanXiaShui && (
                        <div className="text-red-400 text-xs">
                          ⚠️ 上山下水格局
                        </div>
                      )}
                      <div className="text-xs">
                        适合：{yunStar.goodFor.join('、') || '无'}
                      </div>
                      <div className="text-xs">
                        忌用：{yunStar.avoid.join('、') || '无'}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* 图例说明 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">
            吉星（1、4、6、8、9）
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-gray-600 dark:text-gray-400">
            凶星（2、3、5、7）
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">当运星</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 ring-2 ring-green-500 rounded" />
          <span className="text-gray-600 dark:text-gray-400">旺格</span>
        </div>
      </div>
    </div>
  );
}
