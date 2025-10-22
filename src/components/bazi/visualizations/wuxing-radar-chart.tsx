'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface WuxingRadarChartProps {
  data?: {
    wood?: number;
    fire?: number;
    earth?: number;
    metal?: number;
    water?: number;
  };
  title?: string;
  className?: string;
}

export function WuxingRadarChart({
  data,
  title = '五行力量分布图',
  className = '',
}: WuxingRadarChartProps) {
  // 准备雷达图数据
  const chartData = [
    {
      element: '木',
      value: data?.wood || 0,
      fullMark: 100,
      color: '#10b981', // 绿色
    },
    {
      element: '火',
      value: data?.fire || 0,
      fullMark: 100,
      color: '#ef4444', // 红色
    },
    {
      element: '土',
      value: data?.earth || 0,
      fullMark: 100,
      color: '#eab308', // 黄色
    },
    {
      element: '金',
      value: data?.metal || 0,
      fullMark: 100,
      color: '#6b7280', // 灰色
    },
    {
      element: '水',
      value: data?.water || 0,
      fullMark: 100,
      color: '#3b82f6', // 蓝色
    },
  ];

  // 计算总和和百分比
  const total = chartData.reduce((sum, item) => sum + item.value, 0) || 1;
  const normalizedData = chartData.map((item) => ({
    ...item,
    percentage: Math.round((item.value / total) * 100),
    normalizedValue: Math.round((item.value / total) * 100),
  }));

  // 自定义提示框
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-sm">{data.element}</p>
          <p className="text-xs text-gray-600">
            力量值: {data.value}
          </p>
          <p className="text-xs text-gray-600">
            占比: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-gray-500">
            总计: {total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={normalizedData}>
            <PolarGrid
              gridType="polygon"
              radialLines={true}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <PolarAngleAxis
              dataKey="element"
              tick={{ fontSize: 14, fill: '#374151' }}
              className="font-medium"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              tickCount={5}
            />
            <Radar
              name="五行力量"
              dataKey="normalizedValue"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        {/* 五行图例 */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {normalizedData.map((item) => (
            <div
              key={item.element}
              className="flex flex-col items-center text-center"
            >
              <div
                className="w-8 h-8 rounded-full mb-1 flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: item.color }}
              >
                {item.element}
              </div>
              <span className="text-xs text-gray-600">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>

        {/* 平衡状态提示 */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-900">
            <span className="font-semibold">五行平衡分析：</span>
            {getBalanceAnalysis(normalizedData)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// 分析五行平衡状态
function getBalanceAnalysis(data: any[]) {
  const values = data.map((d) => d.percentage);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const diff = max - min;

  if (diff < 15) {
    return '五行力量分布均衡，整体和谐稳定。';
  } else if (diff < 30) {
    return '五行力量略有偏颇，建议适当补充较弱的元素。';
  } else {
    const strongest = data.find((d) => d.percentage === max);
    const weakest = data.find((d) => d.percentage === min);
    return `${strongest?.element}过旺，${weakest?.element}偏弱，需要调和平衡。`;
  }
}