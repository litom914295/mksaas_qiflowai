'use client';

// P1-003: 五行雷达图组件
// 功能：使用recharts展示五行（木火土金水）的强度分布

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type Props = {
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
};

export function WuxingRadarChart({ elements }: Props) {
  // 转换数据格式供recharts使用
  const data = [
    { element: '木', value: elements.wood, fullMark: 10 },
    { element: '火', value: elements.fire, fullMark: 10 },
    { element: '土', value: elements.earth, fullMark: 10 },
    { element: '金', value: elements.metal, fullMark: 10 },
    { element: '水', value: elements.water, fullMark: 10 },
  ];

  // 五行颜色映射
  const colorMap: Record<string, string> = {
    木: '#22c55e', // green
    火: '#ef4444', // red
    土: '#f59e0b', // amber
    金: '#94a3b8', // slate
    水: '#3b82f6', // blue
  };

  return (
    <div className="w-full h-[300px] bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="element"
            tick={{ fill: 'currentColor', fontSize: 14, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: 'currentColor', fontSize: 12 }}
          />
          <Radar
            name="五行强度"
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#fff', fontWeight: 600 }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number, name: string, props: any) => {
              const element = props.payload.element;
              return [
                <span
                  key="value"
                  style={{ color: colorMap[element] || '#fff' }}
                >
                  强度: {value}/10
                </span>,
                element,
              ];
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* 图例说明 */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        {data.map((item) => (
          <div key={item.element} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colorMap[item.element] }}
            />
            <span className="font-medium">{item.element}</span>
            <span className="text-muted-foreground">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
