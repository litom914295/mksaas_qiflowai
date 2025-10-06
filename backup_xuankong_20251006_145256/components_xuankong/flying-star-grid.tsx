'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  STAR_INFO,
  calculatePalaceScore,
  getPalaceAdvice,
  getStarCombination,
  getStarRating,
} from '@/lib/qiflow/xuankong/star-interpretations';
import type {
  PalaceIndex,
  Plate,
  PlateCell,
} from '@/lib/qiflow/xuankong/types';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronUp,
  Info,
  Lightbulb,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

interface FlyingStarGridProps {
  plate: Plate;
  onCellClick?: (palace: PalaceIndex) => void;
  selectedPalace?: PalaceIndex | null;
  showDetails?: boolean;
}

// 飞星颜色配置
const STAR_COLORS = {
  1: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  2: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  3: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  4: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
  5: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  6: { bg: 'bg-gray-200', text: 'text-gray-900', border: 'border-gray-400' },
  7: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  8: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  9: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
  },
};

// 宫位配置
const PALACE_CONFIG = {
  1: { name: '坎', direction: '北', element: '水', color: 'blue' },
  2: { name: '坤', direction: '西南', element: '土', color: 'yellow' },
  3: { name: '震', direction: '东', element: '木', color: 'green' },
  4: { name: '巽', direction: '东南', element: '木', color: 'purple' },
  5: { name: '中', direction: '中', element: '土', color: 'gray' },
  6: { name: '乾', direction: '西北', element: '金', color: 'red' },
  7: { name: '兑', direction: '西', element: '金', color: 'pink' },
  8: { name: '艮', direction: '东北', element: '土', color: 'indigo' },
  9: { name: '离', direction: '南', element: '火', color: 'orange' },
};

// 单个宫位组件
function PalaceCell({
  palace,
  cell,
  isSelected,
  onClick,
}: {
  palace: PalaceIndex;
  cell?: PlateCell;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = PALACE_CONFIG[palace];
  const baseColor = `bg-${config.color}-50`;
  const borderColor = `border-${config.color}-200`;
  const selectedClass = isSelected ? 'ring-2 ring-blue-500 shadow-lg' : '';

  return (
    <div
      className={`
        relative p-2 sm:p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 
        hover:shadow-md active:scale-95 touch-manipulation
        ${baseColor} ${borderColor} ${selectedClass}
      `}
      onClick={onClick}
    >
      {/* 宫位标题 */}
      <div className="text-center mb-2 sm:mb-3">
        <div className="text-base sm:text-lg font-bold text-gray-800">
          {config.name}宫
        </div>
        <div className="text-xs text-gray-600 hidden sm:block">
          {config.direction} • {config.element}
        </div>
      </div>

      {/* 飞星显示 */}
      {cell ? (
        <div className="space-y-1 sm:space-y-2">
          {/* 天盘星 */}
          <div className="flex items-center justify-center">
            <div
              className={`
              w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold
              ${STAR_COLORS[cell.periodStar || 1].bg} ${STAR_COLORS[cell.periodStar || 1].text} ${STAR_COLORS[cell.periodStar || 1].border} border
            `}
            >
              {cell.periodStar}
            </div>
            <div className="ml-1 sm:ml-2 text-xs text-gray-600">天</div>
          </div>

          {/* 山盘和向盘 */}
          <div className="flex justify-between px-1 sm:px-0">
            <div className="text-center">
              <div
                className={`
                w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${STAR_COLORS[cell.mountainStar].bg} ${STAR_COLORS[cell.mountainStar].text} ${STAR_COLORS[cell.mountainStar].border} border
              `}
              >
                {cell.mountainStar}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">山</div>
            </div>
            <div className="text-center">
              <div
                className={`
                w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${STAR_COLORS[cell.facingStar].bg} ${STAR_COLORS[cell.facingStar].text} ${STAR_COLORS[cell.facingStar].border} border
              `}
              >
                {cell.facingStar}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">向</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 text-sm">暂无数据</div>
      )}

      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <Star className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
}

// 飞星详情面板
function StarDetailPanel({
  cell,
  palace,
  onClose,
}: {
  cell: PlateCell;
  palace: PalaceIndex;
  onClose: () => void;
}) {
  const config = PALACE_CONFIG[palace];
  const mountainInfo = STAR_INFO[cell.mountainStar];
  const facingInfo = STAR_INFO[cell.facingStar];
  const periodInfo = cell.periodStar ? STAR_INFO[cell.periodStar] : null;
  const combination = getStarCombination(cell.mountainStar, cell.facingStar);
  const score = calculatePalaceScore(
    cell.mountainStar,
    cell.facingStar,
    cell.periodStar || 5
  );
  const advice = getPalaceAdvice(
    cell.mountainStar,
    cell.facingStar,
    cell.periodStar || 5
  );

  return (
    <Card className="p-4 md:p-6 mt-4 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            {config.name}宫详细分析
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              score >= 70
                ? 'default'
                : score >= 50
                  ? 'secondary'
                  : 'destructive'
            }
            className="text-sm"
          >
            综合评分: {score}分
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 天盘星 */}
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-sm text-gray-600 mb-2">天盘星</div>
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2
            ${STAR_COLORS[cell.periodStar || 1].bg} ${STAR_COLORS[cell.periodStar || 1].text} ${STAR_COLORS[cell.periodStar || 1].border} border-2
          `}
          >
            {cell.periodStar}
          </div>
          <div className="text-xs text-gray-600">当前运势</div>
        </div>

        {/* 山盘星 */}
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-sm text-gray-600 mb-2">山盘星</div>
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2
            ${STAR_COLORS[cell.mountainStar].bg} ${STAR_COLORS[cell.mountainStar].text} ${STAR_COLORS[cell.mountainStar].border} border-2
          `}
          >
            {cell.mountainStar}
          </div>
          <div className="text-xs text-gray-600">坐山方位</div>
        </div>

        {/* 向盘星 */}
        <div className="text-center p-4 bg-white rounded-lg border">
          <div className="text-sm text-gray-600 mb-2">向盘星</div>
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2
            ${STAR_COLORS[cell.facingStar].bg} ${STAR_COLORS[cell.facingStar].text} ${STAR_COLORS[cell.facingStar].border} border-2
          `}
          >
            {cell.facingStar}
          </div>
          <div className="text-xs text-gray-600">朝向方位</div>
        </div>
      </div>

      {/* 飞星组合分析 */}
      {combination && (
        <div
          className={`p-4 rounded-lg border-2 ${
            combination.nature === '大吉' || combination.nature === '吉'
              ? 'bg-green-50 border-green-300'
              : combination.nature === '大凶' || combination.nature === '凶'
                ? 'bg-red-50 border-red-300'
                : 'bg-gray-50 border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {combination.nature === '大吉' || combination.nature === '吉' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <h4 className="font-semibold text-gray-900">{combination.name}</h4>
            <Badge
              variant={
                combination.nature === '大吉' || combination.nature === '吉'
                  ? 'default'
                  : 'destructive'
              }
            >
              {combination.nature}
            </Badge>
          </div>
          <p className="text-sm text-gray-700 mb-3">{combination.meaning}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-medium text-gray-800 mb-1">主要影响:</div>
              <ul className="space-y-1 text-gray-600">
                {combination.effects.map((effect, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="mt-1">•</span>
                    <span>{effect}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-1">建议措施:</div>
              <ul className="space-y-1 text-gray-600">
                {combination.advice.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="mt-1">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 单星详细解读 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 山盘星详情 */}
        <Card className="p-3 bg-white border">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant={
                getStarRating(cell.mountainStar) === '吉星'
                  ? 'default'
                  : 'destructive'
              }
              className="text-xs"
            >
              山盘星
            </Badge>
            <span className="text-sm font-semibold">{mountainInfo.name}</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• 五行: {mountainInfo.element}</div>
            <div>• 属性: {mountainInfo.nature}星</div>
            <div>• 主事: {mountainInfo.shortMeaning}</div>
          </div>
        </Card>

        {/* 向盘星详情 */}
        <Card className="p-3 bg-white border">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant={
                getStarRating(cell.facingStar) === '吉星'
                  ? 'default'
                  : 'destructive'
              }
              className="text-xs"
            >
              向盘星
            </Badge>
            <span className="text-sm font-semibold">{facingInfo.name}</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• 五行: {facingInfo.element}</div>
            <div>• 属性: {facingInfo.nature}星</div>
            <div>• 主事: {facingInfo.shortMeaning}</div>
          </div>
        </Card>

        {/* 天盘星详情 */}
        {periodInfo && (
          <Card className="p-3 bg-white border">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={
                  getStarRating(cell.periodStar!) === '吉星'
                    ? 'default'
                    : 'destructive'
                }
                className="text-xs"
              >
                天盘星
              </Badge>
              <span className="text-sm font-semibold">{periodInfo.name}</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• 五行: {periodInfo.element}</div>
              <div>• 属性: {periodInfo.nature}星</div>
              <div>• 主事: {periodInfo.shortMeaning}</div>
            </div>
          </Card>
        )}
      </div>

      {/* 布局建议 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 有利布置 */}
        {advice.favorable.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <h5 className="font-medium text-green-800">宜设置</h5>
            </div>
            <div className="flex flex-wrap gap-1">
              {advice.favorable.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-white">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 不利布置 */}
        {advice.unfavorable.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <h5 className="font-medium text-red-800">忌设置</h5>
            </div>
            <div className="flex flex-wrap gap-1">
              {advice.unfavorable.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-white">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 化解建议 */}
      {advice.mitigation.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <h5 className="font-medium text-blue-800">化解方法</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-700">
            {advice.mitigation.map((item, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <span className="mt-1">•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// 图例组件
function Legend() {
  return (
    <Card className="p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-gray-600" />
        <h4 className="font-semibold text-gray-900">图例说明</h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
            1
          </div>
          <span>天盘星（当前运势）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full flex items-center justify-center text-xs font-bold text-green-800">
            山
          </div>
          <span>山盘星（坐山）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded-full flex items-center justify-center text-xs font-bold text-purple-800">
            向
          </div>
          <span>向盘星（朝向）</span>
        </div>
      </div>
    </Card>
  );
}

export function FlyingStarGrid({
  plate,
  onCellClick,
  selectedPalace,
  showDetails = true,
}: FlyingStarGridProps) {
  const [expandedPalace, setExpandedPalace] = useState<PalaceIndex | null>(
    null
  );

  const handleCellClick = (palace: PalaceIndex) => {
    onCellClick?.(palace);
    if (showDetails) {
      setExpandedPalace(expandedPalace === palace ? null : palace);
    }
  };

  // const selectedCell = selectedPalace ? plate.find(c => c.palace === selectedPalace) : null;
  const expandedCell = expandedPalace
    ? plate.find((c) => c.palace === expandedPalace)
    : null;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* 标题与说明：基础视图（按宫序排列） */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            九宫飞星图
          </h3>
          <p className="text-xs text-gray-500 mt-1 hidden sm:block">
            点击宫位查看详细解读和布局建议
          </p>
        </div>
      </div>
      {/* 九宫格 - 响应式布局 */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 max-w-full sm:max-w-2xl mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((palace) => {
          const cell = plate.find((c) => c.palace === (palace as PalaceIndex));
          const isSelected = selectedPalace === palace;

          return (
            <PalaceCell
              key={palace}
              palace={palace as PalaceIndex}
              cell={cell}
              isSelected={isSelected}
              onClick={() => handleCellClick(palace as PalaceIndex)}
            />
          );
        })}
      </div>

      {/* 图例 */}
      <Legend />

      {/* 详情面板 */}
      {showDetails && expandedCell && expandedPalace && (
        <StarDetailPanel
          cell={expandedCell}
          palace={expandedPalace}
          onClose={() => setExpandedPalace(null)}
        />
      )}
    </div>
  );
}
