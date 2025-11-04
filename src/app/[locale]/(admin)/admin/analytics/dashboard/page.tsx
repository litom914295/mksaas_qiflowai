'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Eye,
  RefreshCw,
  ShoppingCart,
  Target,
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
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';
type MetricChange = {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
};

type MetricCard = {
  id: string;
  title: string;
  value: number | string;
  change: MetricChange;
  icon: any;
  color: string;
  unit?: string;
};

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { toast } = useToast();

  // 模拟核心指标数据
  const coreMetrics: MetricCard[] = [
    {
      id: 'dau',
      title: '日活跃用户',
      value: '12,438',
      change: { value: 823, percentage: 7.1, trend: 'up' },
      icon: Users,
      color: 'text-blue-600',
    },
    {
      id: 'revenue',
      title: '营收',
      value: '¥328,450',
      change: { value: 28450, percentage: 9.5, trend: 'up' },
      icon: DollarSign,
      color: 'text-green-600',
      unit: '¥',
    },
    {
      id: 'orders',
      title: '订单量',
      value: '1,892',
      change: { value: -123, percentage: -6.1, trend: 'down' },
      icon: ShoppingCart,
      color: 'text-purple-600',
    },
    {
      id: 'conversion',
      title: '转化率',
      value: '3.24%',
      change: { value: 0.12, percentage: 3.8, trend: 'up' },
      icon: Target,
      color: 'text-orange-600',
      unit: '%',
    },
    {
      id: 'pageviews',
      title: '页面浏览量',
      value: '458.2K',
      change: { value: 32100, percentage: 7.5, trend: 'up' },
      icon: Eye,
      color: 'text-cyan-600',
    },
    {
      id: 'avgSession',
      title: '平均会话时长',
      value: '4m 32s',
      change: { value: 18, percentage: 6.8, trend: 'up' },
      icon: Clock,
      color: 'text-indigo-600',
    },
  ];

  // 模拟趋势数据
  const generateTrendData = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MM-dd'),
        users: Math.floor(Math.random() * 5000) + 10000,
        revenue: Math.floor(Math.random() * 50000) + 280000,
        orders: Math.floor(Math.random() * 300) + 1600,
        conversion: (Math.random() * 1.5 + 2.5).toFixed(2),
      });
    }
    return data;
  };

  const [trendData, setTrendData] = useState(() => generateTrendData(7));

  // 用户分布数据
  const userSegmentData = [
    { name: '新用户', value: 3245, percentage: 26.1 },
    { name: '活跃用户', value: 5621, percentage: 45.2 },
    { name: '回访用户', value: 2834, percentage: 22.8 },
    { name: '沉睡用户', value: 738, percentage: 5.9 },
  ];

  // 产品销售数据
  const productSalesData = [
    { name: '八字精批', value: 4532, revenue: 226600 },
    { name: '紫微斗数', value: 3218, revenue: 160900 },
    { name: '起名服务', value: 2156, revenue: 107800 },
    { name: '风水咨询', value: 1893, revenue: 189300 },
    { name: '择吉日', value: 1456, revenue: 72800 },
  ];

  // 渠道来源数据
  const channelData = [
    { channel: '直接访问', users: 4532, conversion: 3.8 },
    { channel: '搜索引擎', users: 3245, conversion: 2.9 },
    { channel: '社交媒体', users: 2156, conversion: 4.2 },
    { channel: '推荐链接', users: 1893, conversion: 5.1 },
    { channel: '邮件营销', users: 612, conversion: 6.7 },
  ];

  // 实时数据
  const [realtimeData, setRealtimeData] = useState({
    onlineUsers: 523,
    activeTransactions: 18,
    qps: 1234,
    errorRate: 0.12,
  });

  // 性能指标雷达图数据
  const performanceData = [
    { metric: '用户满意度', value: 85, fullMark: 100 },
    { metric: '系统稳定性', value: 92, fullMark: 100 },
    { metric: '响应速度', value: 78, fullMark: 100 },
    { metric: '功能完整性', value: 88, fullMark: 100 },
    { metric: '安全性', value: 95, fullMark: 100 },
    { metric: '可用性', value: 90, fullMark: 100 },
  ];

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#EC4899',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // 模拟实时数据更新
      setRealtimeData((prev) => ({
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 20) - 10,
        activeTransactions: Math.max(
          0,
          prev.activeTransactions + Math.floor(Math.random() * 6) - 3
        ),
        qps: prev.qps + Math.floor(Math.random() * 100) - 50,
        errorRate: Math.max(
          0,
          Math.min(1, prev.errorRate + (Math.random() * 0.1 - 0.05))
        ),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 根据时间范围更新数据
    const days =
      timeRange === '7d'
        ? 7
        : timeRange === '30d'
          ? 30
          : timeRange === '90d'
            ? 90
            : timeRange === '1y'
              ? 365
              : 7;
    setTrendData(generateTrendData(days));
  }, [timeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // 模拟数据刷新
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
      toast({
        title: '刷新成功',
        description: '数据已更新到最新',
      });
    } catch (error) {
      toast({
        title: '刷新失败',
        description: '无法刷新数据，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      toast({
        title: '导出开始',
        description: '正在准备数据导出...',
      });
      // 模拟导出逻辑
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast({
        title: '导出成功',
        description: '数据报表已生成并下载',
      });
    } catch (error) {
      toast({
        title: '导出失败',
        description: '无法导出数据，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const MetricChangeIndicator = ({ change }: { change: MetricChange }) => {
    const isPositive = change.trend === 'up';
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    const color = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center space-x-1 text-sm ${color}`}>
        <Icon className="h-4 w-4" />
        <span>{Math.abs(change.percentage)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题栏 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">数据分析</h1>
          <p className="text-muted-foreground">
            最后更新：
            {format(lastUpdated, 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近7天</SelectItem>
              <SelectItem value="30d">近30天</SelectItem>
              <SelectItem value="90d">近90天</SelectItem>
              <SelectItem value="1y">近一年</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出报表
          </Button>
        </div>
      </div>

      {/* 实时数据栏 */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-600" />
            实时数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">在线用户</p>
              <p className="text-2xl font-bold">{realtimeData.onlineUsers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">进行中交易</p>
              <p className="text-2xl font-bold">
                {realtimeData.activeTransactions}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">QPS</p>
              <p className="text-2xl font-bold">{realtimeData.qps}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">错误率</p>
              <p className="text-2xl font-bold">
                {(realtimeData.errorRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {coreMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  <span>{metric.title}</span>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <MetricChangeIndicator change={metric.change} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 趋势图表 */}
      <Card>
        <CardHeader>
          <CardTitle>趋势分析</CardTitle>
          <CardDescription>关键指标历史趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 max-w-md">
              <TabsTrigger value="users">用户</TabsTrigger>
              <TabsTrigger value="revenue">营收</TabsTrigger>
              <TabsTrigger value="orders">订单</TabsTrigger>
              <TabsTrigger value="conversion">转化率</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="conversion" className="space-y-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="conversion"
                    stroke="#F59E0B"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>用户分布</CardTitle>
            <CardDescription>按用户活跃度分类</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userSegmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userSegmentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {userSegmentData.map((segment, index) => (
                <div
                  key={segment.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{segment.name}</span>
                  </div>
                  <span className="font-medium">
                    {segment.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 产品销售排行 */}
        <Card>
          <CardHeader>
            <CardTitle>产品销售排行</CardTitle>
            <CardDescription>按销售额排序</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {productSalesData.map((product, index) => (
                <div key={product.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ¥{product.revenue.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={
                      (product.revenue / productSalesData[0].revenue) * 100
                    }
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>销量: {product.value}</span>
                    <span>
                      占比:{' '}
                      {(
                        (product.revenue /
                          productSalesData.reduce(
                            (sum, p) => sum + p.revenue,
                            0
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 渠道分析 */}
        <Card>
          <CardHeader>
            <CardTitle>渠道分析</CardTitle>
            <CardDescription>各渠道用户量与转化率</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="users"
                  fill="#8884d8"
                  name="用户数"
                />
                <Bar
                  yAxisId="right"
                  dataKey="conversion"
                  fill="#82ca9d"
                  name="转化率(%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 性能指标雷达图 */}
        <Card>
          <CardHeader>
            <CardTitle>性能指标</CardTitle>
            <CardDescription>系统各维度表现评分</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="当前值"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {performanceData.map((item) => (
                <div
                  key={item.metric}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{item.metric}</span>
                  <Badge
                    variant={
                      item.value >= 90
                        ? 'default'
                        : item.value >= 70
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
