'use client';

import React, { useRef } from 'react';

/**
 * GanttChart - 行动计划甘特图
 *
 * 功能：
 * - 展示行动项的时间线（未来 6 个月）
 * - 按优先级分组（必做/推荐/加分）
 * - 颜色编码不同优先级
 * - 标注预期见效时间
 * - 支持导出为 PNG
 *
 * 数据格式：
 * - id: 行动项ID
 * - title: 行动项标题
 * - priority: 优先级（'essential' | 'recommended' | 'optional'）
 * - startMonth: 开始月份（0-5，相对当前月）
 * - duration: 持续时长（月数）
 * - expectedResult: 预期见效时间（月数）
 */

interface GanttItem {
  id: string;
  title: string;
  priority: 'essential' | 'recommended' | 'optional';
  startMonth: number;
  duration: number;
  expectedResult: number;
}

interface GanttChartProps {
  data: GanttItem[];
  title?: string;
  showExportButton?: boolean;
}

export default function GanttChart({
  data,
  title = '行动计划甘特图',
  showExportButton = true,
}: GanttChartProps) {
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

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential':
        return 'bg-red-500 dark:bg-red-600';
      case 'recommended':
        return 'bg-yellow-500 dark:bg-yellow-600';
      case 'optional':
        return 'bg-green-500 dark:bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  // 获取优先级标签
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'essential':
        return '必做项';
      case 'recommended':
        return '推荐项';
      case 'optional':
        return '加分项';
      default:
        return '其他';
    }
  };

  // 按优先级分组
  const groupedData = {
    essential: data.filter((d) => d.priority === 'essential'),
    recommended: data.filter((d) => d.priority === 'recommended'),
    optional: data.filter((d) => d.priority === 'optional'),
  };

  // 月份列表（未来 6 个月）
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return `${date.getMonth() + 1}月`;
  });

  return (
    <div
      ref={chartRef}
      className="w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md overflow-x-auto"
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

      {/* 甘特图主体 */}
      <div className="min-w-[800px]">
        {/* 时间轴表头 */}
        <div className="grid grid-cols-[200px_repeat(6,1fr)] gap-2 mb-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            行动项
          </div>
          {months.map((month, index) => (
            <div
              key={index}
              className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              {month}
            </div>
          ))}
        </div>

        {/* 必做项 */}
        {groupedData.essential.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
              🔴 必做项 ({groupedData.essential.length})
            </div>
            {groupedData.essential.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[200px_repeat(6,1fr)] gap-2 mb-2"
              >
                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {item.title}
                </div>
                {months.map((_, monthIndex) => (
                  <div key={monthIndex} className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded">
                    {/* 执行时间段 */}
                    {monthIndex >= item.startMonth &&
                      monthIndex < item.startMonth + item.duration && (
                        <div
                          className={`absolute inset-0 ${getPriorityColor(item.priority)} rounded opacity-80`}
                        />
                      )}
                    {/* 预期见效标记 */}
                    {monthIndex === item.startMonth + item.expectedResult - 1 && (
                      <div className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full border-2 border-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 推荐项 */}
        {groupedData.recommended.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              🟡 推荐项 ({groupedData.recommended.length})
            </div>
            {groupedData.recommended.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[200px_repeat(6,1fr)] gap-2 mb-2"
              >
                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {item.title}
                </div>
                {months.map((_, monthIndex) => (
                  <div key={monthIndex} className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded">
                    {monthIndex >= item.startMonth &&
                      monthIndex < item.startMonth + item.duration && (
                        <div
                          className={`absolute inset-0 ${getPriorityColor(item.priority)} rounded opacity-80`}
                        />
                      )}
                    {monthIndex === item.startMonth + item.expectedResult - 1 && (
                      <div className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full border-2 border-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 加分项 */}
        {groupedData.optional.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">
              🟢 加分项 ({groupedData.optional.length})
            </div>
            {groupedData.optional.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[200px_repeat(6,1fr)] gap-2 mb-2"
              >
                <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {item.title}
                </div>
                {months.map((_, monthIndex) => (
                  <div key={monthIndex} className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded">
                    {monthIndex >= item.startMonth &&
                      monthIndex < item.startMonth + item.duration && (
                        <div
                          className={`absolute inset-0 ${getPriorityColor(item.priority)} rounded opacity-80`}
                        />
                      )}
                    {monthIndex === item.startMonth + item.expectedResult - 1 && (
                      <div className="absolute right-0 top-0 w-2 h-2 bg-white rounded-full border-2 border-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span>必做项（1-2周见效）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded" />
          <span>推荐项（1-2月见效）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span>加分项（3-6月见效）</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full border-2 border-blue-600" />
          <span>预期见效时间</span>
        </div>
      </div>

      {/* 执行建议 */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 执行建议：</strong>
          优先完成必做项，然后依次推进推荐项和加分项。关注预期见效时间点（白色圆点），评估执行效果。
        </p>
      </div>
    </div>
  );
}
