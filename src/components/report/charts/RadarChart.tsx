'use client';

import React, { useRef } from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

/**
 * RadarChart - 能力雷达图
 *
 * 功能：
 * - 展示五行平衡度或十神强度
 * - 对比当前状态 vs 理想状态
 * - 标注短板（需补）和优势（可用）
 * - 支持导出为 PNG
 *
 * 数据格式：
 * - dimension: 维度名称（如 "木"、"火"、"土"、"金"、"水"）
 * - current: 当前值（0-100）
 * - ideal: 理想值（0-100）
 * - note: 说明文字
 */

interface RadarDataPoint {
  dimension: string;
  current: number;
  ideal: number;
  note?: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  title?: string;
  showExportButton?: boolean;
}

export default function RadarChart({
  data,
  title = '五行能力雷达图',
  showExportButton = true,
}: RadarChartProps) {
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
      alert('导出图表失败，请稍后重试');
    }
  };

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as RadarDataPoint;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {data.dimension}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            当前: {data.current}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            理想: {data.ideal}
          </p>
          {data.note && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {data.note}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // 识别短板和优势
  const weaknesses = data.filter((d) => d.current < d.ideal - 15);
  const strengths = data.filter((d) => d.current > d.ideal + 15);

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

      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadar data={data}>
          <PolarGrid stroke="#e5e7eb" />

          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#6b7280', fontSize: 14 }}
          />

          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* 理想状态（绿色半透明） */}
          <Radar
            name="理想状态"
            dataKey="ideal"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
            strokeWidth={2}
          />

          {/* 当前状态（蓝色实线） */}
          <Radar
            name="当前状态"
            dataKey="current"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.5}
            strokeWidth={3}
          />
        </RechartsRadar>
      </ResponsiveContainer>

      {/* 短板和优势分析 */}
      <div className="mt-4 space-y-3">
        {weaknesses.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <p className="font-semibold text-red-800 dark:text-red-300 mb-2">
              🔻 短板（需补强）
            </p>
            <div className="flex flex-wrap gap-2">
              {weaknesses.map((w) => (
                <span
                  key={w.dimension}
                  className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full text-sm"
                >
                  {w.dimension} ({w.current}/{w.ideal})
                </span>
              ))}
            </div>
          </div>
        )}

        {strengths.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="font-semibold text-green-800 dark:text-green-300 mb-2">
              🔺 优势（可发挥）
            </p>
            <div className="flex flex-wrap gap-2">
              {strengths.map((s) => (
                <span
                  key={s.dimension}
                  className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm"
                >
                  {s.dimension} ({s.current}/{s.ideal})
                </span>
              ))}
            </div>
          </div>
        )}

        {weaknesses.length === 0 && strengths.length === 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              ✅ 五行平衡良好，当前状态接近理想状态
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
