'use client';

import React, { useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
  ReferenceDot,
} from 'recharts';
import html2canvas from 'html2canvas';

/**
 * TimelineChart - 人生时间轴图表
 *
 * 功能：
 * - 展示 0-80 岁的运势变化曲线
 * - 标注大运切换点和关键转折点
 * - 用神得力期（绿色）、忌神期（红色）色彩区分
 * - 支持导出为 PNG
 *
 * 数据格式：
 * - age: 年龄（0-80）
 * - strength: 运势强度（0-100）
 * - phase: 阶段名称（如 "青年期"、"中年转折"）
 * - isKeyTurning: 是否为关键转折点
 * - isFavorable: 是否为用神得力期
 */

interface TimelineDataPoint {
  age: number;
  strength: number;
  phase?: string;
  isKeyTurning?: boolean;
  isFavorable?: boolean;
  note?: string;
}

interface TimelineChartProps {
  data: TimelineDataPoint[];
  currentAge?: number;
  title?: string;
  showExportButton?: boolean;
}

export default function TimelineChart({
  data,
  currentAge,
  title = '人生运势时间轴',
  showExportButton = true,
}: TimelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // 导出为 PNG
  const exportToPNG = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
      });

      const link = document.createElement('a');
      link.download = `${title}_${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出图表失败:', error);
    }
  };

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as TimelineDataPoint;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {data.age} 岁
            {data.phase && ` - ${data.phase}`}
          </p>
          <p
            className={`text-sm ${
              data.strength >= 60
                ? 'text-green-600 dark:text-green-400'
                : data.strength >= 40
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            运势强度: {data.strength}
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

  // 标注关键转折点
  const turningPoints = data.filter((d) => d.isKeyTurning);

  return (
    <div ref={chartRef} className="w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
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
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {/* 渐变色定义 */}
            <linearGradient id="favorableGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="unfavorableGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="age"
            label={{ value: '年龄', position: 'insideBottom', offset: -5 }}
            tick={{ fill: '#6b7280' }}
          />

          <YAxis
            label={{ value: '运势强度', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
            tick={{ fill: '#6b7280' }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          {/* 当前年龄参考线 */}
          {currentAge && (
            <ReferenceLine
              x={currentAge}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              label={{
                value: `当前 ${currentAge} 岁`,
                position: 'top',
                fill: '#3b82f6',
                fontSize: 12,
              }}
            />
          )}

          {/* 运势基准线 */}
          <ReferenceLine
            y={50}
            stroke="#9ca3af"
            strokeDasharray="3 3"
            label={{ value: '平均线', position: 'right', fill: '#9ca3af' }}
          />

          {/* 主运势曲线 */}
          <Line
            type="monotone"
            dataKey="strength"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isKeyTurning) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              }
              return null;
            }}
            name="运势曲线"
          />

          {/* 关键转折点标注 */}
          {turningPoints.map((point, index) => (
            <ReferenceDot
              key={`turning-${index}`}
              x={point.age}
              y={point.strength}
              r={8}
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>

      {/* 图例说明 */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>用神得力期（强势）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>忌神期（弱势）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full" />
          <span>关键转折点</span>
        </div>
        {currentAge && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500" />
            <span>当前年龄</span>
          </div>
        )}
      </div>
    </div>
  );
}
