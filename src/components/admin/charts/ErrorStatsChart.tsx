/**
 * 错误统计图表组件
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ErrorByTypeData {
  type: string;
  count: number;
}

interface ErrorByEndpointData {
  endpoint: string;
  errors: number;
}

const COLORS = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd'];

/**
 * 错误类型分布饼图
 */
export function ErrorTypeDistribution({
  data,
  title = '错误类型分布',
  height = 300,
}: {
  data: ErrorByTypeData[];
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
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.type}: ${entry.count}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * 端点错误数柱状图
 */
export function ErrorByEndpointChart({
  data,
  title = '端点错误统计',
  height = 300,
}: {
  data: ErrorByEndpointData[];
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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="endpoint"
              angle={-45}
              textAnchor="end"
              height={100}
              fontSize={12}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="errors" fill="#ff6b6b" name="错误数" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * 错误趋势图
 */
export function ErrorTrendChart({
  data,
  title = '错误趋势',
  height = 300,
}: {
  data: Array<{ time: string; errors: number; warnings: number }>;
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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Bar dataKey="errors" stackId="a" fill="#ff6b6b" name="错误" />
            <Bar dataKey="warnings" stackId="a" fill="#feca57" name="警告" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
