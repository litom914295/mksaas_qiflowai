/**
 * Sentry 配置管理页面
 * 管理 Sentry 项目配置、DSN、采样率、环境等
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Save, TestTube } from 'lucide-react';
import { useState } from 'react';

export default function SentryConfigPage() {
  const [enabled, setEnabled] = useState(true);
  const [dsn, setDsn] = useState(
    'https://examplekey@o123456.ingest.sentry.io/1234567'
  );
  const [environment, setEnvironment] = useState('production');
  const [tracesSampleRate, setTracesSampleRate] = useState('0.1');
  const [profilesSampleRate, setProfilesSampleRate] = useState('0.1');

  const handleSave = () => {
    // TODO: 实现保存配置逻辑
    alert('Sentry 配置已保存');
  };

  const handleTest = () => {
    // TODO: 实现测试连接逻辑
    alert('正在测试 Sentry 连接...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sentry 配置</h1>
          <p className="text-muted-foreground">管理错误追踪和性能监控配置</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest}>
            <TestTube className="mr-2 h-4 w-4" />
            测试连接
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            保存配置
          </Button>
        </div>
      </div>

      {/* 基础配置 */}
      <Card>
        <CardHeader>
          <CardTitle>基础配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用 Sentry</Label>
              <p className="text-sm text-muted-foreground">
                开启后将自动收集错误和性能数据
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsn">DSN (Data Source Name)</Label>
            <Input
              id="dsn"
              value={dsn}
              onChange={(e) => setDsn(e.target.value)}
              placeholder="https://examplekey@o123456.ingest.sentry.io/1234567"
              disabled={!enabled}
            />
            <p className="text-xs text-muted-foreground">
              从 Sentry 项目设置中获取 DSN
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">环境</Label>
            <Select
              value={environment}
              onValueChange={setEnvironment}
              disabled={!enabled}
            >
              <SelectTrigger id="environment">
                <SelectValue placeholder="选择环境" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 采样配置 */}
      <Card>
        <CardHeader>
          <CardTitle>采样配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tracesSampleRate">性能追踪采样率</Label>
            <Input
              id="tracesSampleRate"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={tracesSampleRate}
              onChange={(e) => setTracesSampleRate(e.target.value)}
              disabled={!enabled}
            />
            <p className="text-xs text-muted-foreground">
              推荐值: 0.1 (10%)。设置为 1.0 将追踪所有事务
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilesSampleRate">性能分析采样率</Label>
            <Input
              id="profilesSampleRate"
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={profilesSampleRate}
              onChange={(e) => setProfilesSampleRate(e.target.value)}
              disabled={!enabled}
            />
            <p className="text-xs text-muted-foreground">
              推荐值: 0.1 (10%)。性能分析会占用一定资源
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 过滤规则 */}
      <Card>
        <CardHeader>
          <CardTitle>过滤规则</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>忽略的错误</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-mono">
                  ResizeObserver loop limit exceeded
                </span>
                <Button variant="ghost" size="sm">
                  删除
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-mono">ChunkLoadError</span>
                <Button variant="ghost" size="sm">
                  删除
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled={!enabled}>
              添加过滤规则
            </Button>
          </div>

          <div className="space-y-2">
            <Label>忽略的 URL</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-mono">/health</span>
                <Button variant="ghost" size="sm">
                  删除
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm font-mono">/metrics</span>
                <Button variant="ghost" size="sm">
                  删除
                </Button>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled={!enabled}>
              添加 URL 规则
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 告警配置 */}
      <Card>
        <CardHeader>
          <CardTitle>告警配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium">告警规则在 Sentry 后台配置</div>
              <div className="text-muted-foreground mt-1">
                请访问 Sentry 项目设置页面配置告警规则、通知渠道和集成
              </div>
            </div>
          </div>

          <Button variant="outline" disabled={!enabled}>
            打开 Sentry 控制台
          </Button>
        </CardContent>
      </Card>

      {/* 当前状态 */}
      <Card>
        <CardHeader>
          <CardTitle>当前状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between p-2 border-b">
              <span className="text-sm text-muted-foreground">
                Sentry SDK 版本
              </span>
              <span className="text-sm font-mono">7.99.0</span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="text-sm text-muted-foreground">连接状态</span>
              <span className="text-sm text-green-600 font-semibold">
                已连接
              </span>
            </div>
            <div className="flex justify-between p-2 border-b">
              <span className="text-sm text-muted-foreground">今日错误数</span>
              <span className="text-sm font-mono">23</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-sm text-muted-foreground">今日事件数</span>
              <span className="text-sm font-mono">15,234</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
