/**
 * 性能趋势图表组件
 * 使用 Recharts 绘制性能指标趋势
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface PerformanceDataPoint {
  time: string;
  responseTime: number;
  requests: number;
  errors: number;
}

interface PerformanceTrendChartProps {
  data: PerformanceDataPoint[];
  title?: string;
  height?: number;
}

export function PerformanceTrendChart({
  data,
  title = '性能趋势',
  height = 300,
}: PerformanceTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
              }}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value: number, name: string) => {
                if (name === 'responseTime') return [`${value}ms`, '响应时间'];
                if (name === 'requests') return [value, '请求数'];
                if (name === 'errors') return [value, '错误数'];
                return [value, name];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="responseTime"
              stroke="#8884d8"
              name="响应时间 (ms)"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="requests"
              stroke="#82ca9d"
              name="请求数"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="errors"
              stroke="#ff7c7c"
              name="错误数"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * 系统资源使用图表
 */
export function ResourceUsageChart({
  data,
  title = '系统资源使用',
  height = 300,
}: {
  data: Array<{ time: string; cpu: number; memory: number }>;
  title?: string;
  height?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
              }}
            />
            <YAxis
              domain={[0, 100]}
              label={{ value: '%', position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value: number, name: string) => {
                if (name === 'cpu') return [`${value}%`, 'CPU 使用率'];
                if (name === 'memory') return [`${value}%`, '内存使用率'];
                return [value, name];
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="cpu"
              stackId="1"
              stroke="#8884d8"
              fill="#8884d8"
              name="CPU"
            />
            <Area
              type="monotone"
              dataKey="memory"
              stackId="2"
              stroke="#82ca9d"
              fill="#82ca9d"
              name="内存"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
