/**
 * 告警规则配置页面
 */

'use client';

import { Badge } from '@/components/ui/badge';
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
import {
  AlertTriangle,
  Bell,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

export default function AlertsPage() {
  // 模拟告警规则
  const [alertRules, setAlertRules] = useState([
    {
      id: '1',
      name: 'CPU 使用率过高',
      enabled: true,
      condition: 'cpu > 80%',
      duration: '5分钟',
      severity: 'warning',
      channels: ['email', 'slack'],
      description: 'CPU 使用率持续5分钟超过80%时触发告警',
    },
    {
      id: '2',
      name: '错误率异常',
      enabled: true,
      condition: 'error_rate > 5%',
      duration: '1分钟',
      severity: 'critical',
      channels: ['email', 'slack', 'sms'],
      description: '错误率超过5%时立即触发告警',
    },
    {
      id: '3',
      name: 'API 响应时间过长',
      enabled: false,
      condition: 'p95_response_time > 2000ms',
      duration: '10分钟',
      severity: 'warning',
      channels: ['email'],
      description: 'P95响应时间持续10分钟超过2秒时触发告警',
    },
  ]);

  // 通知渠道配置
  const [notificationChannels, setNotificationChannels] = useState([
    {
      id: 'email',
      name: '邮件通知',
      enabled: true,
      config: 'admin@example.com',
    },
    { id: 'slack', name: 'Slack', enabled: true, config: '#monitoring' },
    { id: 'sms', name: '短信通知', enabled: false, config: '+86 138****1234' },
    { id: 'webhook', name: 'Webhook', enabled: false, config: 'https://...' },
  ]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">严重</Badge>;
      case 'warning':
        return (
          <Badge
            variant="outline"
            className="border-yellow-600 text-yellow-600"
          >
            警告
          </Badge>
        );
      case 'info':
        return <Badge variant="secondary">信息</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'slack':
        return <MessageSquare className="h-4 w-4" />;
      case 'sms':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">告警配置</h1>
          <p className="text-muted-foreground">配置监控告警规则和通知渠道</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建告警规则
        </Button>
      </div>

      {/* 告警规则列表 */}
      <Card>
        <CardHeader>
          <CardTitle>告警规则</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{rule.name}</h3>
                    {getSeverityBadge(rule.severity)}
                    <Switch checked={rule.enabled} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rule.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      条件:{' '}
                      <code className="bg-muted px-1 py-0.5 rounded">
                        {rule.condition}
                      </code>
                    </span>
                    <span>持续时间: {rule.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      通知渠道:
                    </span>
                    {rule.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="gap-1">
                        {getChannelIcon(channel)}
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 通知渠道配置 */}
      <Card>
        <CardHeader>
          <CardTitle>通知渠道</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-3">
                  {getChannelIcon(channel.id)}
                  <div>
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {channel.config}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={channel.enabled} />
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              添加通知渠道
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 告警历史 */}
      <Card>
        <CardHeader>
          <CardTitle>最近触发的告警</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              {
                time: '2025-10-13 14:25:30',
                rule: 'CPU 使用率过高',
                severity: 'warning',
                status: 'resolved',
              },
              {
                time: '2025-10-13 10:15:12',
                rule: '错误率异常',
                severity: 'critical',
                status: 'resolved',
              },
              {
                time: '2025-10-12 22:30:45',
                rule: 'CPU 使用率过高',
                severity: 'warning',
                status: 'resolved',
              },
            ].map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="text-sm font-medium">{alert.rule}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(alert.severity)}
                  <Badge variant="outline" className="text-green-600">
                    已解决
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 告警统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃规则</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">共3条规则</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日触发</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">比昨天减少 2 次</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">全部已解决</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5分钟</div>
            <p className="text-xs text-muted-foreground">告警响应时间</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
