'use client';

import React, { useRef } from 'react';

/**
 * HeatmapChart - 风水热力图（9宫格）
 *
 * 功能：
 * - 展示 9 宫格的风水吉凶分布
 * - 颜色编码：旺位（绿色）、平位（黄色）、衰位（红色）
 * - 标注零神宫位、正神宫位
 * - 支持导出为 PNG
 *
 * 数据格式：
 * - palace: 宫位编号（1-9）
 * - bagua: 八卦方位（如 "坎"、"坤"、"震"）
 * - strength: 吉凶强度（0-100）
 * - type: 类型（'zero' | 'positive' | 'normal'）
 * - note: 说明
 */

interface HeatmapCell {
  palace: number;
  bagua: string;
  strength: number;
  type: 'zero' | 'positive' | 'normal';
  note?: string;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  title?: string;
  showExportButton?: boolean;
}

export default function HeatmapChart({
  data,
  title = '风水九宫热力图',
  showExportButton = true,
}: HeatmapChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // 导出为 PNG
  const exportToPNG = async () => {
    if (!chartRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${title}_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出图表失败:', error);
    }
  };

  // 获取颜色（基于强度）
  const getColor = (strength: number, type: string) => {
    if (strength >= 75) {
      return 'bg-green-500 dark:bg-green-600 text-white'; // 旺位
    }
    if (strength >= 50) {
      return 'bg-yellow-400 dark:bg-yellow-500 text-gray-900'; // 平位
    }
    if (strength >= 25) {
      return 'bg-orange-400 dark:bg-orange-500 text-white'; // 偏弱
    }
    return 'bg-red-500 dark:bg-red-600 text-white'; // 衰位
  };

  // 获取类型标记
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'zero':
        return '零神';
      case 'positive':
        return '正神';
      default:
        return '';
    }
  };

  // 将数据映射到 9 宫格（3x3）
  // 宫位编号：
  // 4 9 2
  // 3 5 7
  // 8 1 6
  const grid = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  const getCellData = (palace: number): HeatmapCell | undefined => {
    return data.find((d) => d.palace === palace);
  };

  return (
    <div
      ref={chartRef}
      className="w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {showExportButton && (
          <button
            type="button"
            onClick={exportToPNG}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            导出 PNG
          </button>
        )}
      </div>

      {/* 9 宫格热力图 */}
      <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto">
        {grid.map((row, rowIndex) =>
          row.map((palace) => {
            const cellData = getCellData(palace);
            if (!cellData) return null;

            return (
              <div
                key={`cell-${palace}`}
                className={`
                  relative aspect-square p-4 rounded-lg transition-transform hover:scale-105 cursor-pointer
                  ${getColor(cellData.strength, cellData.type)}
                  flex flex-col items-center justify-center
                `}
                title={cellData.note}
              >
                {/* 宫位编号 */}
                <div className="absolute top-1 left-1 text-xs opacity-70">
                  {palace}宫
                </div>

                {/* 类型标记 */}
                {cellData.type !== 'normal' && (
                  <div className="absolute top-1 right-1 text-xs font-bold bg-white/20 px-2 py-0.5 rounded">
                    {getTypeLabel(cellData.type)}
                  </div>
                )}

                {/* 八卦方位 */}
                <div className="text-2xl font-bold mb-1">{cellData.bagua}</div>

                {/* 强度值 */}
                <div className="text-lg font-semibold">{cellData.strength}</div>

                {/* 强度描述 */}
                <div className="text-xs mt-1 opacity-90">
                  {cellData.strength >= 75
                    ? '旺'
                    : cellData.strength >= 50
                      ? '平'
                      : cellData.strength >= 25
                        ? '弱'
                        : '衰'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 图例 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-gray-700 dark:text-gray-300">
            旺位（≥75）
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">
            平位（50-74）
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded" />
          <span className="text-gray-700 dark:text-gray-300">
            弱位（25-49）
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-gray-700 dark:text-gray-300">
            衰位（{'<'}25）
          </span>
        </div>
      </div>

      {/* 零正神说明 */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 提示：</strong>
          零神宫位宜见水（鱼缸、饮水机），正神宫位宜见山（书柜、高大植物）
        </p>
      </div>

      {/* 详细建议 */}
      <div className="mt-4 space-y-2">
        {data
          .filter((d) => d.type !== 'normal')
          .map((d) => (
            <div
              key={d.palace}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-sm"
            >
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {d.palace}宫（{d.bagua}）
              </span>
              <span
                className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                  d.type === 'zero'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
                }`}
              >
                {getTypeLabel(d.type)}
              </span>
              {d.note && (
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  - {d.note}
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
