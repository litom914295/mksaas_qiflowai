'use client';

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

/**
 * WaveChart - 运势波动图
 *
 * 功能：
 * - 展示未来 12 个月的运势波动曲线
 * - 标注关键时间窗口（决策窗口）
 * - 显示流年月令变化
 * - 支持导出为 PNG
 *
 * 数据格式：
 * - month: 月份（如 "2025-01"）
 * - strength: 运势强度（0-100）
 * - isKeyWindow: 是否为关键决策窗口
 * - note: 说明
 */

interface WaveDataPoint {
  month: string;
  strength: number;
  isKeyWindow?: boolean;
  note?: string;
}

interface WaveChartProps {
  data: WaveDataPoint[];
  title?: string;
  showExportButton?: boolean;
}

export default function WaveChart({
  data,
  title = '未来12个月运势波动',
  showExportButton = true,
}: WaveChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 导出为 PNG
  const exportToPNG = async () => {
    if (!chartRef.current || isExporting) return;

    setIsExporting(true);
    const toastId = toast.loading('正在导出图表...');

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

      toast.success('图表导出成功', { id: toastId });
    } catch (error) {
      console.error('导出图表失败:', error);
      toast.error('导出图表失败，请稍后重试', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as WaveDataPoint;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {data.month}
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
          {data.isKeyWindow && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">
              ⭐ 决策窗口期
            </p>
          )}
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

  // 格式化月份显示（如 "2025-01" → "1月"）
  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return `${date.getMonth() + 1}月`;
  };

  // 找到关键决策窗口
  const keyWindows = data.filter((d) => d.isKeyWindow);

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
            disabled={isExporting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? '导出中...' : '导出 PNG'}
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            {/* 渐变色定义 */}
            <linearGradient id="strengthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            label={{ value: '月份', position: 'insideBottom', offset: -5 }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />

          <YAxis
            label={{ value: '运势强度', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
            tick={{ fill: '#6b7280' }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {/* 运势基准线 */}
          <ReferenceLine
            y={50}
            stroke="#9ca3af"
            strokeDasharray="3 3"
            label={{ value: '平均线', position: 'right', fill: '#9ca3af' }}
          />

          {/* 运势波动曲线 */}
          <Area
            type="monotone"
            dataKey="strength"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="url(#strengthGradient)"
            name="运势强度"
          />

          {/* 关键决策窗口标注 */}
          {keyWindows.map((window, index) => (
            <ReferenceDot
              key={`window-${index}`}
              x={window.month}
              y={window.strength}
              r={8}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* 关键决策窗口列表 */}
      {keyWindows.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            ⭐ 关键决策窗口期
          </p>
          <div className="space-y-2">
            {keyWindows.map((window, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300"
              >
                <span className="font-semibold">{formatMonth(window.month)}:</span>
                <span>{window.note || '适合重大决策，把握时机'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 运势趋势说明 */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>📈 趋势分析：</strong>
          {data[0].strength < data[data.length - 1].strength
            ? '整体呈上升趋势，后期运势逐渐转好'
            : data[0].strength > data[data.length - 1].strength
              ? '整体呈下降趋势，需注意风险控制'
              : '整体相对稳定，波动不大'}
        </p>
      </div>
    </div>
  );
}
