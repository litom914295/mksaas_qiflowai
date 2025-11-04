/**
 * 系统健康检查页面
 * 监控各服务状态、依赖服务健康度
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  XCircle,
} from 'lucide-react';

export default function HealthPage() {
  // 模拟健康检查数据
  const services = [
    {
      name: 'API 服务',
      status: 'healthy',
      uptime: '99.98%',
      lastCheck: '1分钟前',
    },
    {
      name: '数据库 (PostgreSQL)',
      status: 'healthy',
      uptime: '99.95%',
      lastCheck: '1分钟前',
    },
    {
      name: 'Redis 缓存',
      status: 'healthy',
      uptime: '99.99%',
      lastCheck: '1分钟前',
    },
    {
      name: 'AI 服务 (OpenAI)',
      status: 'degraded',
      uptime: '98.5%',
      lastCheck: '2分钟前',
    },
    {
      name: '支付网关 (Stripe)',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: '1分钟前',
    },
    {
      name: 'Email 服务',
      status: 'healthy',
      uptime: '99.7%',
      lastCheck: '3分钟前',
    },
    {
      name: 'S3 存储',
      status: 'healthy',
      uptime: '99.99%',
      lastCheck: '1分钟前',
    },
    { name: 'CDN', status: 'healthy', uptime: '99.95%', lastCheck: '2分钟前' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge variant="default" className="bg-green-600">
            正常
          </Badge>
        );
      case 'degraded':
        return (
          <Badge
            variant="outline"
            className="border-yellow-600 text-yellow-600"
          >
            降级
          </Badge>
        );
      case 'down':
        return <Badge variant="destructive">故障</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">系统健康</h1>
          <p className="text-muted-foreground">监控各服务和依赖的健康状态</p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新状态
        </Button>
      </div>

      {/* 整体状态概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">服务总数</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">核心服务监控中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">健康服务</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">7</div>
            <p className="text-xs text-muted-foreground">运行正常</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">降级服务</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <p className="text-xs text-muted-foreground">需要关注</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均可用率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.63%</div>
            <p className="text-xs text-muted-foreground">过去30天</p>
          </CardContent>
        </Card>
      </div>

      {/* 服务状态详情 */}
      <Card>
        <CardHeader>
          <CardTitle>服务状态详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-muted-foreground">
                      最后检查: {service.lastCheck}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {service.uptime}
                    </div>
                    <div className="text-xs text-muted-foreground">可用率</div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 健康检查配置 */}
      <Card>
        <CardHeader>
          <CardTitle>健康检查配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm">检查间隔</span>
              <span className="font-mono text-sm">60 秒</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm">超时时间</span>
              <span className="font-mono text-sm">10 秒</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm">失败重试次数</span>
              <span className="font-mono text-sm">3 次</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="text-sm">告警阈值</span>
              <span className="font-mono text-sm">连续失败 2 次</span>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              配置健康检查
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
