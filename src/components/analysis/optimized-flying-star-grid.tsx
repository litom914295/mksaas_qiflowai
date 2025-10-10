'use client';

import { Button } from '@/components/ui/button';
import { Card, CulturalCard } from '@/components/ui/enhanced-card';
import type { PalaceIndex, Plate, PlateCell } from '@/lib/fengshui';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  Compass,
  Eye,
  EyeOff,
  Info,
  Sparkles,
  Star,
} from 'lucide-react';
import { useState } from 'react';

interface OptimizedFlyingStarGridProps {
  plate: Plate;
  onCellClick?: (palace: PalaceIndex) => void;
  selectedPalace?: PalaceIndex | null;
  showDetails?: boolean;
}

// 优化的飞星颜色系统 - 基于设计系统
const OPTIMIZED_STAR_COLORS = {
  1: {
    bg: 'bg-blue-100 hover:bg-blue-200',
    text: 'text-blue-900',
    border: 'border-blue-300',
    glow: 'hover:shadow-blue-200/50',
  },
  2: {
    bg: 'bg-gray-100 hover:bg-gray-200',
    text: 'text-gray-900',
    border: 'border-gray-300',
    glow: 'hover:shadow-gray-200/50',
  },
  3: {
    bg: 'bg-green-100 hover:bg-green-200',
    text: 'text-green-900',
    border: 'border-green-300',
    glow: 'hover:shadow-green-200/50',
  },
  4: {
    bg: 'bg-purple-100 hover:bg-purple-200',
    text: 'text-purple-900',
    border: 'border-purple-300',
    glow: 'hover:shadow-purple-200/50',
  },
  5: {
    bg: 'bg-yellow-100 hover:bg-yellow-200',
    text: 'text-yellow-900',
    border: 'border-yellow-300',
    glow: 'hover:shadow-yellow-200/50',
  },
  6: {
    bg: 'bg-stone-100 hover:bg-stone-200',
    text: 'text-stone-900',
    border: 'border-stone-300',
    glow: 'hover:shadow-stone-200/50',
  },
  7: {
    bg: 'bg-red-100 hover:bg-red-200',
    text: 'text-red-900',
    border: 'border-red-300',
    glow: 'hover:shadow-red-200/50',
  },
  8: {
    bg: 'bg-pink-100 hover:bg-pink-200',
    text: 'text-pink-900',
    border: 'border-pink-300',
    glow: 'hover:shadow-pink-200/50',
  },
  9: {
    bg: 'bg-orange-100 hover:bg-orange-200',
    text: 'text-orange-900',
    border: 'border-orange-300',
    glow: 'hover:shadow-orange-200/50',
  },
};

// 宫位配置 - 增强版本
const ENHANCED_PALACE_CONFIG = {
  1: {
    name: '坎',
    direction: '北',
    element: '水',
    color: 'blue',
    description: '智慧、适应',
    icon: '☰☰',
    culturalElement: 'water' as const,
  },
  2: {
    name: '坤',
    direction: '西南',
    element: '土',
    color: 'yellow',
    description: '包容、母性',
    icon: '☷☷',
    culturalElement: 'earth' as const,
  },
  3: {
    name: '震',
    direction: '东',
    element: '木',
    color: 'green',
    description: '生发、活力',
    icon: '☳☳',
    culturalElement: 'wood' as const,
  },
  4: {
    name: '巽',
    direction: '东南',
    element: '木',
    color: 'purple',
    description: '柔顺、成长',
    icon: '☴☴',
    culturalElement: 'wood' as const,
  },
  5: {
    name: '中',
    direction: '中央',
    element: '土',
    color: 'gray',
    description: '稳定、平衡',
    icon: '⚹⚹',
    culturalElement: 'earth' as const,
  },
  6: {
    name: '乾',
    direction: '西北',
    element: '金',
    color: 'stone',
    description: '威严、领导',
    icon: '☰☰',
    culturalElement: 'metal' as const,
  },
  7: {
    name: '兑',
    direction: '西',
    element: '金',
    color: 'pink',
    description: '喜悦、交流',
    icon: '☱☱',
    culturalElement: 'metal' as const,
  },
  8: {
    name: '艮',
    direction: '东北',
    element: '土',
    color: 'indigo',
    description: '稳重、停止',
    icon: '☶☶',
    culturalElement: 'earth' as const,
  },
  9: {
    name: '离',
    direction: '南',
    element: '火',
    color: 'orange',
    description: '光明、热情',
    icon: '☲☲',
    culturalElement: 'fire' as const,
  },
};

// 单个宫位组件 - 全面重构
function EnhancedPalaceCell({
  palace,
  cell,
  isSelected,
  onClick,
  showDetails,
}: {
  palace: PalaceIndex;
  cell?: PlateCell;
  isSelected: boolean;
  onClick: () => void;
  showDetails: boolean;
}) {
  const config = ENHANCED_PALACE_CONFIG[palace];

  return (
    <CulturalCard
      element={config.culturalElement}
      variant="cultural"
      interactive={true}
      className={cn(
        'group relative overflow-hidden transition-all duration-300 cursor-pointer',
        'hover:shadow-2xl hover:-translate-y-1 min-h-[140px]',
        isSelected && 'ring-4 ring-blue-500/50 shadow-2xl scale-105'
      )}
      onClick={onClick}
    >
      {/* 选中指示器 */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg z-10">
          <Star className="w-3 h-3 text-white" />
        </div>
      )}

      {/* 八卦符号背景 */}
      <div className="absolute top-2 right-2 text-2xl opacity-20 group-hover:opacity-30 transition-opacity">
        {config.icon}
      </div>

      {/* 宫位信息 */}
      <div className="relative z-10">
        {/* 宫位标题 */}
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-gray-800 mb-1">
            {config.name}宫
          </div>
          <div className="text-xs text-gray-600">
            {config.direction} • {config.element}
          </div>
          <div className="text-xs text-gray-500 italic">
            {config.description}
          </div>
        </div>

        {/* 飞星显示 */}
        {cell ? (
          <div className="space-y-3">
            {/* 天盘星 - 主星 */}
            <div className="flex items-center justify-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-200',
                  OPTIMIZED_STAR_COLORS[cell.periodStar || 1].bg,
                  OPTIMIZED_STAR_COLORS[cell.periodStar || 1].text,
                  OPTIMIZED_STAR_COLORS[cell.periodStar || 1].border,
                  'group-hover:scale-110',
                  isSelected && 'shadow-lg'
                )}
              >
                {cell.periodStar}
              </div>
              <div className="ml-2 text-xs text-gray-600 font-medium">天盘</div>
            </div>

            {/* 山盘和向盘 */}
            {showDetails && (
              <div className="flex justify-between">
                <div className="text-center">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-200',
                      OPTIMIZED_STAR_COLORS[cell.mountainStar].bg,
                      OPTIMIZED_STAR_COLORS[cell.mountainStar].text,
                      OPTIMIZED_STAR_COLORS[cell.mountainStar].border,
                      'group-hover:scale-110'
                    )}
                  >
                    {cell.mountainStar}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    山
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-200',
                      OPTIMIZED_STAR_COLORS[cell.facingStar].bg,
                      OPTIMIZED_STAR_COLORS[cell.facingStar].text,
                      OPTIMIZED_STAR_COLORS[cell.facingStar].border,
                      'group-hover:scale-110'
                    )}
                  >
                    {cell.facingStar}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">
                    向
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            暂无数据
          </div>
        )}
      </div>

      {/* 悬浮效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </CulturalCard>
  );
}

// 增强的飞星详情面板
function EnhancedStarDetailPanel({
  cell,
  palace,
  onClose,
}: {
  cell: PlateCell;
  palace: PalaceIndex;
  onClose: () => void;
}) {
  const config = ENHANCED_PALACE_CONFIG[palace];

  return (
    <Card variant="feng-shui" className="mt-6 overflow-hidden" size="lg">
      <div className="flex items-center justify-between p-6 pb-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100">
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {config.name}宫 • {config.direction}
            </h3>
            <p className="text-gray-600">
              {config.element}行 • {config.description}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-white/50"
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* 天盘星 */}
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              天盘星 • 当前运势
            </div>
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-4 shadow-lg',
                OPTIMIZED_STAR_COLORS[cell.periodStar || 1].bg,
                OPTIMIZED_STAR_COLORS[cell.periodStar || 1].text,
                OPTIMIZED_STAR_COLORS[cell.periodStar || 1].border
              )}
            >
              {cell.periodStar}
            </div>
            <div className="text-xs text-gray-600">主导本宫的能量场</div>
          </div>

          {/* 山盘星 */}
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              山盘星 • 坐山方位
            </div>
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-4 shadow-lg',
                OPTIMIZED_STAR_COLORS[cell.mountainStar].bg,
                OPTIMIZED_STAR_COLORS[cell.mountainStar].text,
                OPTIMIZED_STAR_COLORS[cell.mountainStar].border
              )}
            >
              {cell.mountainStar}
            </div>
            <div className="text-xs text-gray-600">影响人丁健康</div>
          </div>

          {/* 向盘星 */}
          <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
            <div className="text-sm text-gray-600 mb-3 font-medium">
              向盘星 • 朝向方位
            </div>
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 border-4 shadow-lg',
                OPTIMIZED_STAR_COLORS[cell.facingStar].bg,
                OPTIMIZED_STAR_COLORS[cell.facingStar].text,
                OPTIMIZED_STAR_COLORS[cell.facingStar].border
              )}
            >
              {cell.facingStar}
            </div>
            <div className="text-xs text-gray-600">影响财运事业</div>
          </div>
        </div>

        {/* 飞星组合分析 */}
        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-white/50">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            飞星组合分析
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/60 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">
                天盘 {cell.periodStar} 星
              </div>
              <div className="text-gray-700">
                当前九运的主导能量，决定该宫位的整体运势特征
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <div className="font-semibold text-green-900 mb-2">
                山盘 {cell.mountainStar} 星
              </div>
              <div className="text-gray-700">
                影响家庭成员健康、人际关系和贵人运势
              </div>
            </div>
            <div className="bg-white/60 rounded-lg p-4">
              <div className="font-semibold text-purple-900 mb-2">
                向盘 {cell.facingStar} 星
              </div>
              <div className="text-gray-700">主管财运、事业发展和对外关系</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// 增强的图例组件
function EnhancedLegend({ showDetails }: { showDetails: boolean }) {
  return (
    <Card variant="glass" className="p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <Info className="w-5 h-5 text-blue-600" />
        <h4 className="font-bold text-gray-900">图例说明</h4>
      </div>

      <div className="space-y-4">
        {/* 飞星说明 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center text-sm font-bold text-blue-900">
              天
            </div>
            <div className="text-sm">
              <div className="font-medium">天盘星</div>
              <div className="text-gray-600 text-xs">当前运势</div>
            </div>
          </div>

          {showDetails && (
            <>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded-full flex items-center justify-center text-xs font-bold text-green-900">
                  山
                </div>
                <div className="text-sm">
                  <div className="font-medium">山盘星</div>
                  <div className="text-gray-600 text-xs">人丁健康</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-100 border-2 border-purple-300 rounded-full flex items-center justify-center text-xs font-bold text-purple-900">
                  向
                </div>
                <div className="text-sm">
                  <div className="font-medium">向盘星</div>
                  <div className="text-gray-600 text-xs">财运事业</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 操作说明 */}
        <div className="pt-4 border-t border-white/50">
          <div className="text-sm text-gray-600 space-y-1">
            <div>• 点击宫位查看详细分析</div>
            <div>• 选中的宫位会高亮显示</div>
            <div>• 天盘星代表当前运势强弱</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function OptimizedFlyingStarGrid({
  plate,
  onCellClick,
  selectedPalace,
  showDetails = true,
}: OptimizedFlyingStarGridProps) {
  const [expandedPalace, setExpandedPalace] = useState<PalaceIndex | null>(
    null
  );
  const [detailsVisible, setDetailsVisible] = useState(showDetails);

  const handleCellClick = (palace: PalaceIndex) => {
    onCellClick?.(palace);
    if (detailsVisible) {
      setExpandedPalace(expandedPalace === palace ? null : palace);
    }
  };

  // const selectedCell = selectedPalace ? plate.find(c => c.palace === selectedPalace) : null;
  const expandedCell = expandedPalace
    ? plate.find((c) => c.palace === expandedPalace)
    : null;

  return (
    <div className="space-y-8">
      {/* 控制面板 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" />
            九宫飞星图 · 标准洛书视图（优化版）
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailsVisible(!detailsVisible)}
            className="flex items-center gap-2"
          >
            {detailsVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {detailsVisible ? '简化视图' : '详细视图'}
          </Button>
        </div>
      </div>

      {/* 九宫格主体 */}
      <div className="relative">
        {/* 方位指示 */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
          北 ↑
        </div>
        <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 rotate-90 text-sm font-medium text-gray-600">
          西 ←
        </div>
        <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
          东 →
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
          南 ↓
        </div>

        {/* 九宫格布局（洛书标准排布：4 9 2 / 3 5 7 / 8 1 6） */}
        <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto p-8">
          {/* 按照标准九宫格排列：4 9 2 / 3 5 7 / 8 1 6 */}
          {[4, 9, 2, 3, 5, 7, 8, 1, 6].map((palace) => {
            const cell = plate.find(
              (c) => c.palace === (palace as PalaceIndex)
            );
            const isSelected = selectedPalace === palace;

            return (
              <EnhancedPalaceCell
                key={palace}
                palace={palace as PalaceIndex}
                cell={cell}
                isSelected={isSelected}
                onClick={() => handleCellClick(palace as PalaceIndex)}
                showDetails={detailsVisible}
              />
            );
          })}
        </div>
      </div>

      {/* 图例 */}
      <EnhancedLegend showDetails={detailsVisible} />

      {/* 详情面板 */}
      {detailsVisible && expandedCell && expandedPalace && (
        <EnhancedStarDetailPanel
          cell={expandedCell}
          palace={expandedPalace}
          onClose={() => setExpandedPalace(null)}
        />
      )}
    </div>
  );
}
