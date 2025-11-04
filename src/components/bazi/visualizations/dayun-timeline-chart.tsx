'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DayunPeriod {
  period: number;
  startAge: number;
  endAge: number;
  heavenlyStem: string;
  earthlyBranch: string;
  score: number;
  fortune?: {
    career?: number;
    wealth?: number;
    health?: number;
    relationship?: number;
  };
}

interface DayunTimelineChartProps {
  data?: DayunPeriod[];
  currentAge?: number;
  title?: string;
  className?: string;
}

export function DayunTimelineChart({
  data = [],
  currentAge = 30,
  title = '一生大运走势图',
  className = '',
}: DayunTimelineChartProps) {
  // 准备图表数据
  const chartData = data.map((period) => ({
    age: `${period.startAge}-${period.endAge}岁`,
    ageStart: period.startAge,
    ageEnd: period.endAge,
    pillar: `${period.heavenlyStem}${period.earthlyBranch}`,
    综合运势: period.score || 50,
    事业运: period.fortune?.career || 50,
    财运: period.fortune?.wealth || 50,
    健康运: period.fortune?.health || 50,
    感情运: period.fortune?.relationship || 50,
    isCurrent: currentAge >= period.startAge && currentAge <= period.endAge,
  }));

  // 找出当前大运
  const currentPeriod = chartData.find((p) => p.isCurrent);

  // 自定义提示框
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold text-sm mb-2">
            {label} ({data.pillar})
          </p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
              <span className="font-semibold">{entry.value}分</span>
              {entry.value >= 70 && (
                <TrendingUp className="w-3 h-3 text-green-500" />
              )}
              {entry.value <= 30 && (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
            </div>
          ))}
          {data.isCurrent && (
            <Badge className="mt-2" variant="default">
              当前大运
            </Badge>
          )}
        </div>
      );
    }
    return null;
  };

  // 获取运势评价
  const getFortuneLevel = (score: number) => {
    if (score >= 80)
      return { label: '大吉', color: 'text-green-600', icon: '🌟' };
    if (score >= 60) return { label: '吉', color: 'text-blue-600', icon: '⭐' };
    if (score >= 40) return { label: '平', color: 'text-gray-600', icon: '☆' };
    if (score >= 20)
      return { label: '凶', color: 'text-orange-600', icon: '⚠️' };
    return { label: '大凶', color: 'text-red-600', icon: '❌' };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {currentPeriod && (
            <Badge variant="outline" className="ml-2">
              当前: {currentPeriod.pillar} ({currentAge}岁)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 主图表 - 面积图 */}
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="age"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{ value: '运势评分', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />

            {/* 参考线 */}
            <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="3 3" />
            <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" />

            {/* 综合运势面积图 */}
            <Area
              type="monotone"
              dataKey="综合运势"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorGradient)"
            />

            {/* 分项运势线 */}
            <Line
              type="monotone"
              dataKey="事业运"
              stroke="#3b82f6"
              strokeWidth={1.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="财运"
              stroke="#10b981"
              strokeWidth={1.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="健康运"
              stroke="#f59e0b"
              strokeWidth={1.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="感情运"
              stroke="#ec4899"
              strokeWidth={1.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* 大运列表 */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">大运详情</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.map((period) => {
              const fortune = getFortuneLevel(period.score);
              const isCurrent =
                currentAge >= period.startAge && currentAge <= period.endAge;

              return (
                <div
                  key={period.period}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${
                      isCurrent
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        第{period.period}大运
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {period.startAge}-{period.endAge}岁
                      </div>
                      <div className="text-lg font-bold text-purple-600 mt-1">
                        {period.heavenlyStem}
                        {period.earthlyBranch}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl">{fortune.icon}</div>
                      <div className={`text-xs font-medium ${fortune.color}`}>
                        {fortune.label}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <Badge className="mt-2" variant="default">
                      当前大运
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 运势解读 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">
            运势解读
          </h4>
          <p className="text-sm text-purple-800">
            {currentPeriod ? (
              <>
                您当前处于第
                {data.findIndex(
                  (p) => p.startAge <= currentAge && p.endAge >= currentAge
                ) + 1}
                大运， 运势评分{currentPeriod.综合运势}分，
                {currentPeriod.综合运势 >= 60
                  ? '整体运势良好，宜把握机遇，积极进取。'
                  : '运势略有起伏，宜稳中求进，审慎决策。'}
              </>
            ) : (
              '暂无当前大运信息'
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
