'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar as CalendarIcon,
  DollarSign,
  Download,
  Gift,
  RefreshCw,
  Share2,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

interface KPIMetric {
  label: string;
  value: number | string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  unit?: string;
  icon: React.ElementType;
}

interface ChartData {
  date: string;
  value: number;
  type?: string;
}

export default function GrowthDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState<KPIMetric[]>([]);
  const [chartData, setChartData] = useState<{
    referral: ChartData[];
    share: ChartData[];
    credits: ChartData[];
    retention: ChartData[];
  }>({
    referral: [],
    share: [],
    credits: [],
    retention: [],
  });

  // 获取KPI数据
  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/growth/metrics');
      const data = await response.json();

      setMetrics([
        {
          label: 'K因子',
          value: data.kFactor || 0,
          change: data.kFactorChange || 0,
          trend: data.kFactorChange > 0 ? 'up' : 'down',
          icon: TrendingUp,
        },
        {
          label: '激活率',
          value: `${(data.activationRate * 100).toFixed(1)}%`,
          change: data.activationRateChange || 0,
          trend: data.activationRateChange > 0 ? 'up' : 'down',
          icon: Activity,
        },
        {
          label: '7日留存',
          value: `${(data.retention7d * 100).toFixed(1)}%`,
          change: data.retention7dChange || 0,
          trend: data.retention7dChange > 0 ? 'up' : 'down',
          icon: Users,
        },
        {
          label: '今日分享转化',
          value: data.todayShareConversion || 0,
          change: data.shareConversionChange || 0,
          trend: data.shareConversionChange > 0 ? 'up' : 'down',
          icon: Share2,
        },
        {
          label: '今日积分发放',
          value: data.todayCreditsIssued || 0,
          change: data.creditsChange || 0,
          trend: data.creditsChange > 0 ? 'up' : 'down',
          unit: '积分',
          icon: Gift,
        },
        {
          label: '风控拦截数',
          value: data.todayBlocked || 0,
          change: data.blockedChange || 0,
          trend: 'neutral',
          icon: Shield,
        },
      ]);

      // 获取图表数据
      await fetchChartData();
    } catch (error) {
      console.error('获取指标失败:', error);
      toast.error('获取数据失败');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // 获取图表数据
  const fetchChartData = async () => {
    try {
      const response = await fetch(
        `/api/admin/growth/charts?range=${timeRange}`
      );
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('获取图表数据失败:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  // 导出数据
  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/admin/growth/export?range=${timeRange}`,
        {
          method: 'GET',
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `growth_metrics_${format(new Date(), 'yyyyMMdd')}.csv`;
      a.click();
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">增长运营仪表板</h1>
          <p className="text-muted-foreground mt-1">
            实时监控用户增长和病毒传播效果
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 时间范围选择 */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">过去24小时</SelectItem>
              <SelectItem value="7d">过去7天</SelectItem>
              <SelectItem value="30d">过去30天</SelectItem>
              <SelectItem value="90d">过去90天</SelectItem>
            </SelectContent>
          </Select>

          {/* 日期选择 */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-40">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange
                  ? format(dateRange, 'PP', { locale: zhCN })
                  : '选择日期'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* 操作按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchMetrics()}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4', refreshing && 'animate-spin')}
            />
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
        </div>
      </div>

      {/* KPI 指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value}
                  {metric.unit && (
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {metric.unit}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-2">
                  {metric.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  ) : null}
                  <span
                    className={cn(
                      'text-xs',
                      metric.trend === 'up'
                        ? 'text-green-500'
                        : metric.trend === 'down'
                          ? 'text-red-500'
                          : 'text-muted-foreground'
                    )}
                  >
                    {metric.change > 0 ? '+' : ''}
                    {metric.change}%
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    较昨日
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 图表区域 */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="referral">推荐裂变</TabsTrigger>
          <TabsTrigger value="share">分享传播</TabsTrigger>
          <TabsTrigger value="credits">积分激励</TabsTrigger>
          <TabsTrigger value="retention">留存分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 增长趋势图 */}
            <Card>
              <CardHeader>
                <CardTitle>增长趋势</CardTitle>
                <CardDescription>用户增长和激活趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.referral}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#8884d8"
                      name="新增用户"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 转化漏斗图 */}
            <Card>
              <CardHeader>
                <CardTitle>转化漏斗</CardTitle>
                <CardDescription>从分享到激活的转化率</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">分享曝光</span>
                      <span className="text-sm font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">点击访问</span>
                      <span className="text-sm font-bold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">注册完成</span>
                      <span className="text-sm font-bold">28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">激活转化</span>
                      <span className="text-sm font-bold">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 积分发放统计 */}
          <Card>
            <CardHeader>
              <CardTitle>积分发放统计</CardTitle>
              <CardDescription>各类型积分发放趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.credits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral">
          <Card>
            <CardHeader>
              <CardTitle>推荐裂变分析</CardTitle>
              <CardDescription>推荐关系和激活情况</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.referral}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="推荐数" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>分享传播分析</CardTitle>
              <CardDescription>分享次数和转化效果</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.share}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#82ca9d"
                    name="分享次数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>积分激励分析</CardTitle>
              <CardDescription>积分发放和使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.credits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ffc658"
                    fill="#ffc658"
                    name="积分发放"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle>留存分析</CardTitle>
              <CardDescription>用户留存率变化趋势</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.retention}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ff7c7c"
                    name="留存率%"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
