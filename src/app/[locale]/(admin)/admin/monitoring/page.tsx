/**
 * 监控运维主页面
 * 提供系统监控概览
 */

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  AlertCircle,
  Database,
  FileText,
  HeartPulse,
  Settings,
  Shield,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function MonitoringPage() {
  const modules = [
    {
      title: '错误监控',
      description: '查看和分析系统错误',
      icon: AlertCircle,
      href: '/admin/monitoring/errors',
      color: 'text-red-500',
      stats: '最近24小时: 12个错误',
    },
    {
      title: '日志管理',
      description: '实时日志查看和搜索',
      icon: FileText,
      href: '/admin/monitoring/logs',
      color: 'text-blue-500',
      stats: '今日日志: 45,230条',
    },
    {
      title: '性能监控',
      description: 'API和数据库性能分析',
      icon: Activity,
      href: '/admin/monitoring/performance',
      color: 'text-green-500',
      stats: '平均响应: 234ms',
    },
    {
      title: '备份管理',
      description: '数据库备份和恢复',
      icon: Database,
      href: '/admin/monitoring/backups',
      color: 'text-purple-500',
      stats: '最近备份: 2小时前',
    },
    {
      title: '系统健康',
      description: '服务状态和资源使用',
      icon: HeartPulse,
      href: '/admin/monitoring/health',
      color: 'text-orange-500',
      stats: '状态: 正常运行',
    },
    {
      title: '配置管理',
      description: 'Sentry和监控配置',
      icon: Settings,
      href: '/admin/monitoring/config',
      color: 'text-gray-500',
      stats: 'Sentry已配置',
    },
  ];

  const quickStats = [
    {
      label: '系统正常运行时间',
      value: '99.95%',
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: '今日错误率',
      value: '0.02%',
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
    {
      label: 'API平均响应',
      value: '234ms',
      icon: Activity,
      color: 'text-blue-600',
    },
    { label: '安全评分', value: 'A+', icon: Shield, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">监控运维中心</h1>
        <p className="text-muted-foreground mt-2">
          实时监控系统状态，管理日志、备份和性能
        </p>
      </div>

      {/* 快速统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 功能模块 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card
            key={module.title}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={'p-3 rounded-lg bg-muted'}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle>{module.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {module.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {module.stats}
                </span>
                <Link href={module.href}>
                  <Button variant="outline" size="sm">
                    查看详情
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>系统监控最近的重要事件</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '5分钟前', type: 'info', message: '数据库备份成功完成' },
              {
                time: '1小时前',
                type: 'warning',
                message: 'API响应时间略有上升',
              },
              { time: '2小时前', type: 'success', message: '性能优化部署完成' },
              { time: '4小时前', type: 'info', message: '定时任务执行成功' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 text-sm">
                <span className="text-muted-foreground w-24">
                  {activity.time}
                </span>
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${activity.type === 'success' ? 'bg-green-100 text-green-800' : ''}
                  ${activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${activity.type === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                `}
                >
                  {activity.type}
                </span>
                <span className="flex-1">{activity.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
