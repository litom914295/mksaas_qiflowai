/**
 * 数据库备份 Cron Job 管理页面
 * 管理定时任务、备份策略、执行历史
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  Settings,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function CronJobsPage() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      name: '数据库全量备份',
      schedule: '0 2 * * *',
      description: '每天凌晨2点执行PostgreSQL完整备份',
      enabled: true,
      lastRun: '2025-10-13 02:00:12',
      nextRun: '2025-10-14 02:00:00',
      status: 'success',
      duration: '2m 45s',
    },
    {
      id: 2,
      name: '日志清理任务',
      schedule: '0 3 * * *',
      description: '清理7天前的日志文件',
      enabled: true,
      lastRun: '2025-10-13 03:00:05',
      nextRun: '2025-10-14 03:00:00',
      status: 'success',
      duration: '15s',
    },
    {
      id: 3,
      name: '增量备份',
      schedule: '0 */6 * * *',
      description: '每6小时执行一次增量备份',
      enabled: false,
      lastRun: '2025-10-12 18:00:10',
      nextRun: '-',
      status: 'disabled',
      duration: '1m 12s',
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-600">
            成功
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      case 'running':
        return <Badge variant="outline">运行中</Badge>;
      case 'disabled':
        return <Badge variant="secondary">已禁用</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const toggleJob = (id: number) => {
    setJobs(
      jobs.map((job) =>
        job.id === id ? { ...job, enabled: !job.enabled } : job
      )
    );
  };

  const runJobNow = (id: number) => {
    alert(`正在手动执行任务 #${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">定时任务管理</h1>
          <p className="text-muted-foreground">管理数据库备份和维护任务</p>
        </div>
        <Button>
          <Clock className="mr-2 h-4 w-4" />
          新建任务
        </Button>
      </div>

      {/* 任务状态概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总任务数</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 个启用中</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日执行</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">全部成功</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">过去7天</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均耗时</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1m 30s</div>
            <p className="text-xs text-muted-foreground">备份任务平均时间</p>
          </CardContent>
        </Card>
      </div>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>定时任务列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(job.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{job.name}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          计划:{' '}
                          <span className="font-mono">{job.schedule}</span>
                        </span>
                        <span>上次运行: {job.lastRun}</span>
                        <span>耗时: {job.duration}</span>
                      </div>
                      <div className="mt-1 text-xs">
                        下次运行:{' '}
                        <span className="font-semibold">{job.nextRun}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={job.enabled}
                      onCheckedChange={() => toggleJob(job.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runJobNow(job.id)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 执行历史 */}
      <Card>
        <CardHeader>
          <CardTitle>最近执行历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              {
                task: '数据库全量备份',
                time: '2025-10-13 02:00:12',
                status: 'success',
                duration: '2m 45s',
              },
              {
                task: '日志清理任务',
                time: '2025-10-13 03:00:05',
                status: 'success',
                duration: '15s',
              },
              {
                task: '数据库全量备份',
                time: '2025-10-12 02:00:15',
                status: 'success',
                duration: '2m 38s',
              },
              {
                task: '日志清理任务',
                time: '2025-10-12 03:00:08',
                status: 'success',
                duration: '18s',
              },
            ].map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="text-sm font-medium">{log.task}</div>
                    <div className="text-xs text-muted-foreground">
                      {log.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    耗时: {log.duration}
                  </span>
                  {getStatusBadge(log.status)}
                  <Button variant="ghost" size="sm">
                    查看日志
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cron 表达式帮助 */}
      <Card>
        <CardHeader>
          <CardTitle>Cron 表达式说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex justify-between p-2 border-b">
              <span className="font-mono">* * * * *</span>
              <span className="text-muted-foreground">每分钟执行</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="font-mono">0 * * * *</span>
              <span className="text-muted-foreground">每小时执行（整点）</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="font-mono">0 2 * * *</span>
              <span className="text-muted-foreground">每天凌晨2点执行</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="font-mono">0 */6 * * *</span>
              <span className="text-muted-foreground">每6小时执行一次</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-mono">0 2 * * 0</span>
              <span className="text-muted-foreground">每周日凌晨2点执行</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
