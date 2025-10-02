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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  BarChart3,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface UsageAnalytics {
  totalUsers: number;
  totalSessions: number;
  totalCost: number;
  totalTokens: number;
  averageResponseTime: number;
  successRate: number;
  dailyStats: Array<{
    date: string;
    users: number;
    sessions: number;
    cost: number;
    tokens: number;
  }>;
  providerStats: Array<{
    provider: string;
    count: number;
    cost: number;
    tokens: number;
    avgResponseTime: number;
  }>;
  modelStats: Array<{
    model: string;
    provider: string;
    count: number;
    cost: number;
    tokens: number;
    avgResponseTime: number;
  }>;
  userStats: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    sessions: number;
    cost: number;
    tokens: number;
    lastActive: string;
  }>;
}

interface UserUsageRecord {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  responseTimeMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
  traceId?: string;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [usageRecords, setUsageRecords] = useState<UserUsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [filters, setFilters] = useState({
    userId: '',
    provider: '',
    model: '',
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    fetchAnalytics();
    fetchUsageRecords();
  }, [dateRange, filters]);

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await fetch(`/api/admin/usage-analytics?${params}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsageRecords = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      if (filters.userId) params.append('userId', filters.userId);
      if (filters.provider) params.append('provider', filters.provider);
      if (filters.model) params.append('model', filters.model);

      const response = await fetch(`/api/admin/user-usage?${params}`);
      const data = await response.json();
      setUsageRecords(data.records || []);
    } catch (error) {
      console.error('Error fetching usage records:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const response = await fetch('/api/admin/user-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format,
        }),
      });

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usage-records-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `usage-records-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex items-center space-x-2'>
          <RefreshCw className='h-4 w-4 animate-spin' />
          <span>加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>后台管理仪表板</h1>
          <p className='text-muted-foreground'>AI模型调用明细和费用统计</p>
        </div>
        <div className='flex space-x-2'>
          <Button onClick={() => exportData('csv')} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            导出CSV
          </Button>
          <Button onClick={() => exportData('json')} variant='outline'>
            <Download className='h-4 w-4 mr-2' />
            导出JSON
          </Button>
          <Button onClick={fetchAnalytics} variant='outline'>
            <RefreshCw className='h-4 w-4 mr-2' />
            刷新
          </Button>
        </div>
      </div>

      {/* 日期范围选择 */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Filter className='h-5 w-5 mr-2' />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <Label htmlFor='startDate'>开始日期</Label>
              <Input
                id='startDate'
                type='date'
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor='endDate'>结束日期</Label>
              <Input
                id='endDate'
                type='date'
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange(prev => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor='provider'>提供商</Label>
              <Select
                value={filters.provider}
                onValueChange={value =>
                  setFilters(prev => ({ ...prev, provider: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择提供商' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=''>全部</SelectItem>
                  <SelectItem value='openai'>OpenAI</SelectItem>
                  <SelectItem value='anthropic'>Anthropic</SelectItem>
                  <SelectItem value='gemini'>Google Gemini</SelectItem>
                  <SelectItem value='deepseek'>DeepSeek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='userId'>用户ID</Label>
              <Input
                id='userId'
                placeholder='输入用户ID'
                value={filters.userId}
                onChange={e =>
                  setFilters(prev => ({ ...prev, userId: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计概览 */}
      {analytics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>总用户数</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{analytics.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>总会话数</CardTitle>
              <BarChart3 className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {analytics.totalSessions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>总费用</CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                ${analytics.totalCost.toFixed(4)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>成功率</CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {analytics.successRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>概览</TabsTrigger>
          <TabsTrigger value='providers'>提供商统计</TabsTrigger>
          <TabsTrigger value='models'>模型统计</TabsTrigger>
          <TabsTrigger value='users'>用户统计</TabsTrigger>
          <TabsTrigger value='records'>详细记录</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          {analytics && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>每日统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {analytics.dailyStats.slice(0, 7).map((day, index) => (
                      <div
                        key={index}
                        className='flex justify-between items-center p-2 border rounded'
                      >
                        <span>
                          {format(new Date(day.date), 'MM-dd', {
                            locale: zhCN,
                          })}
                        </span>
                        <div className='flex space-x-4 text-sm text-muted-foreground'>
                          <span>用户: {day.users}</span>
                          <span>会话: {day.sessions}</span>
                          <span>费用: ${day.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>系统指标</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex justify-between'>
                      <span>总Token数</span>
                      <span className='font-mono'>
                        {analytics.totalTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>平均响应时间</span>
                      <span className='font-mono'>
                        {analytics.averageResponseTime.toFixed(0)}ms
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>平均每次费用</span>
                      <span className='font-mono'>
                        $
                        {(
                          analytics.totalCost / analytics.totalSessions
                        ).toFixed(6)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value='providers' className='space-y-4'>
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>提供商统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analytics.providerStats.map((provider, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <Badge variant='outline'>{provider.provider}</Badge>
                        <div className='text-sm text-muted-foreground'>
                          调用次数: {provider.count}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-medium'>
                          ${provider.cost.toFixed(4)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {provider.tokens.toLocaleString()} tokens
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          平均响应: {provider.avgResponseTime.toFixed(0)}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='models' className='space-y-4'>
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>模型统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analytics.modelStats.map((model, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <Badge variant='outline'>{model.provider}</Badge>
                        <div className='font-medium'>{model.model}</div>
                        <div className='text-sm text-muted-foreground'>
                          调用次数: {model.count}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-medium'>
                          ${model.cost.toFixed(4)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {model.tokens.toLocaleString()} tokens
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          平均响应: {model.avgResponseTime.toFixed(0)}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='users' className='space-y-4'>
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>用户统计</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analytics.userStats.map((user, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex items-center space-x-4'>
                        <div>
                          <div className='font-medium'>{user.userName}</div>
                          <div className='text-sm text-muted-foreground'>
                            {user.userEmail}
                          </div>
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          会话数: {user.sessions}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-medium'>
                          ${user.cost.toFixed(4)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {user.tokens.toLocaleString()} tokens
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          最后活跃:{' '}
                          {format(new Date(user.lastActive), 'MM-dd HH:mm', {
                            locale: zhCN,
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='records' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>详细使用记录</CardTitle>
              <CardDescription>显示所有AI模型调用的详细记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {usageRecords.map(record => (
                  <div key={record.id} className='p-4 border rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        <Badge
                          variant={record.success ? 'default' : 'destructive'}
                        >
                          {record.success ? '成功' : '失败'}
                        </Badge>
                        <Badge variant='outline'>{record.provider}</Badge>
                        <span className='text-sm font-mono'>
                          {record.model}
                        </span>
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {format(new Date(record.createdAt), 'MM-dd HH:mm:ss', {
                          locale: zhCN,
                        })}
                      </div>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                      <div>
                        <span className='text-muted-foreground'>用户:</span>
                        <div className='font-medium'>{record.userName}</div>
                        <div className='text-muted-foreground'>
                          {record.userEmail}
                        </div>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Token使用:
                        </span>
                        <div className='font-medium'>
                          {record.totalTokens.toLocaleString()}
                        </div>
                        <div className='text-muted-foreground'>
                          {record.promptTokens} + {record.completionTokens}
                        </div>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>费用:</span>
                        <div className='font-medium'>
                          ${record.costUsd.toFixed(6)}
                        </div>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>响应时间:</span>
                        <div className='font-medium'>
                          {record.responseTimeMs}ms
                        </div>
                      </div>
                    </div>
                    {record.errorMessage && (
                      <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700'>
                        错误: {record.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
