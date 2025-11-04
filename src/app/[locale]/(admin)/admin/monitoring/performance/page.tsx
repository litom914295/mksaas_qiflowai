/**
 * 性能监控页面
 * 监控 API 响应时间、数据库查询性能、内存/CPU 使用率
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  Clock,
  Cpu,
  Database,
  TrendingUp,
} from 'lucide-react';

export default function PerformancePage() {
  // 模拟性能数据
  const apiPerformance = [
    { endpoint: '/api/chat', avgTime: 450, p95: 1200, p99: 2500, calls: 15234 },
    {
      endpoint: '/api/divination/bazi',
      avgTime: 850,
      p95: 2100,
      p99: 3800,
      calls: 5432,
    },
    {
      endpoint: '/api/payment/create',
      avgTime: 320,
      p95: 800,
      p99: 1500,
      calls: 892,
    },
    {
      endpoint: '/api/auth/login',
      avgTime: 180,
      p95: 450,
      p99: 800,
      calls: 3421,
    },
  ];

  const dbQueries = [
    {
      query: 'SELECT * FROM users WHERE...',
      avgTime: 45,
      count: 8234,
      slowest: 450,
    },
    {
      query: 'INSERT INTO chat_logs...',
      avgTime: 23,
      count: 15234,
      slowest: 180,
    },
    { query: 'UPDATE credits SET...', avgTime: 67, count: 2341, slowest: 890 },
  ];

  const getPerformanceStatus = (time: number) => {
    if (time < 500) return { variant: 'default' as const, label: '优秀' };
    if (time < 1000) return { variant: 'outline' as const, label: '良好' };
    if (time < 2000) return { variant: 'secondary' as const, label: '一般' };
    return { variant: 'destructive' as const, label: '需优化' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">性能监控</h1>
          <p className="text-muted-foreground">实时监控系统性能指标</p>
        </div>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" />
          性能报告
        </Button>
      </div>

      {/* 系统资源监控 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU 使用率</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '45%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">平均负载正常</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">内存使用</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '68%' }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              3.4 GB / 5.0 GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">响应时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">420ms</div>
            <p className="text-xs text-muted-foreground mt-2">
              P95: 1.2s | P99: 2.5s
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据库连接</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 / 20</div>
            <p className="text-xs text-muted-foreground mt-2">活跃连接池</p>
          </CardContent>
        </Card>
      </div>

      {/* API 性能监控 */}
      <Card>
        <CardHeader>
          <CardTitle>API 端点性能</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiPerformance.map((api, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-mono text-sm">{api.endpoint}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    调用次数: {api.calls.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold">{api.avgTime}ms</div>
                    <div className="text-xs text-muted-foreground">
                      平均响应
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{api.p95}ms</div>
                    <div className="text-xs text-muted-foreground">P95</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{api.p99}ms</div>
                    <div className="text-xs text-muted-foreground">P99</div>
                  </div>
                  <Badge variant={getPerformanceStatus(api.avgTime).variant}>
                    {getPerformanceStatus(api.avgTime).label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 数据库查询性能 */}
      <Card>
        <CardHeader>
          <CardTitle>数据库查询性能</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dbQueries.map((query, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-mono text-xs text-muted-foreground">
                    {query.query.substring(0, 50)}...
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    执行次数: {query.count.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {query.avgTime}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      平均时间
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-red-600">
                      {query.slowest}ms
                    </div>
                    <div className="text-xs text-muted-foreground">
                      最慢查询
                    </div>
                  </div>
                  {query.slowest > 500 && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 性能优化建议 */}
      <Card>
        <CardHeader>
          <CardTitle>性能优化建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 border-l-4 border-yellow-500 bg-yellow-50 rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">数据库查询优化</div>
                <div className="text-xs text-muted-foreground">
                  建议为 users 表的 email 字段添加索引，可提升 45% 查询性能
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 border-l-4 border-blue-500 bg-blue-50 rounded">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-sm">缓存策略优化</div>
                <div className="text-xs text-muted-foreground">
                  /api/divination/bazi 端点可添加 Redis 缓存，预计减少 60%
                  响应时间
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
