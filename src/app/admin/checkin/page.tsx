'use client';

import { VirtualTable } from '@/components/admin/ui/VirtualList';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  CalendarCheck,
  Plus,
  Save,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CheckInConfig {
  id: string;
  baseReward: number;
  enabled: boolean;
  consecutiveRewards: Array<{ days: number; bonus: number; label?: string }>;
  allowMakeup: boolean;
  makeupCost: number;
  maxMakeupDays: number;
}

interface CheckInStats {
  totalCheckIns: number;
  totalUsers: number;
  todayCheckIns: number;
  totalRewards: number;
}

interface CheckInRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  checkInDate: string;
  consecutiveDays: number;
  totalCheckIns: number;
  baseReward: number;
  bonusReward: number;
  totalReward: number;
  checkInSource: string;
  createdAt: string;
}

export default function CheckInManagementPage() {
  const [config, setConfig] = useState<CheckInConfig | null>(null);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/checkin');
      const data = await res.json();
      setConfig(data.config);
      setStats(data.stats);
      setRecords(data.records || []);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig() {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/checkin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error('保存失败');

      toast.success('配置已保存');
      fetchData();
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !config) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">签到系统管理</h1>
          <p className="text-sm text-gray-600">管理每日签到功能和奖励配置</p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
        />
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总签到次数</CardTitle>
              <CalendarCheck className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCheckIns.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">签到用户数</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日签到</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.todayCheckIns.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总发放积分</CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRewards.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">签到配置</TabsTrigger>
          <TabsTrigger value="records">签到记录</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基础配置</CardTitle>
              <CardDescription>设置签到奖励和限制</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>基础奖励积分</Label>
                  <Input
                    type="number"
                    value={config.baseReward}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        baseReward: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>启用签到功能</Label>
                  <div className="flex h-10 items-center">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(enabled) =>
                        setConfig({ ...config, enabled })
                      }
                    />
                    <span className="ml-2 text-sm">
                      {config.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>允许补签</Label>
                  <div className="flex h-10 items-center">
                    <Switch
                      checked={config.allowMakeup}
                      onCheckedChange={(allowMakeup) =>
                        setConfig({ ...config, allowMakeup })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>补签消耗(积分)</Label>
                  <Input
                    type="number"
                    value={config.makeupCost}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        makeupCost: Number.parseInt(e.target.value),
                      })
                    }
                    disabled={!config.allowMakeup}
                  />
                </div>
                <div>
                  <Label>最多补签天数</Label>
                  <Input
                    type="number"
                    value={config.maxMakeupDays}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        maxMakeupDays: Number.parseInt(e.target.value),
                      })
                    }
                    disabled={!config.allowMakeup}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>连续签到奖励</CardTitle>
                <CardDescription>设置连续签到的额外奖励</CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const newRewards = [
                    ...config.consecutiveRewards,
                    { days: 0, bonus: 0 },
                  ];
                  setConfig({ ...config, consecutiveRewards: newRewards });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                添加
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.consecutiveRewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">连续天数</Label>
                      <Input
                        type="number"
                        value={reward.days}
                        onChange={(e) => {
                          const newRewards = [...config.consecutiveRewards];
                          newRewards[index].days = Number.parseInt(
                            e.target.value
                          );
                          setConfig({
                            ...config,
                            consecutiveRewards: newRewards,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">额外奖励</Label>
                      <Input
                        type="number"
                        value={reward.bonus}
                        onChange={(e) => {
                          const newRewards = [...config.consecutiveRewards];
                          newRewards[index].bonus = Number.parseInt(
                            e.target.value
                          );
                          setConfig({
                            ...config,
                            consecutiveRewards: newRewards,
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">标签(可选)</Label>
                      <Input
                        value={reward.label || ''}
                        onChange={(e) => {
                          const newRewards = [...config.consecutiveRewards];
                          newRewards[index].label = e.target.value;
                          setConfig({
                            ...config,
                            consecutiveRewards: newRewards,
                          });
                        }}
                        placeholder="如: 三日奖励"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newRewards = config.consecutiveRewards.filter(
                        (_, i) => i !== index
                      );
                      setConfig({ ...config, consecutiveRewards: newRewards });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>签到记录</CardTitle>
              <CardDescription>最近的用户签到记录</CardDescription>
            </CardHeader>
            <CardContent>
              <VirtualTable
                items={records}
                columns={[
                  { key: 'userName', label: '用户', width: '150px' },
                  {
                    key: 'checkInDate',
                    label: '签到日期',
                    width: '180px',
                    render: (r) => new Date(r.checkInDate).toLocaleDateString(),
                  },
                  {
                    key: 'consecutiveDays',
                    label: '连续天数',
                    width: '100px',
                    render: (r) => `${r.consecutiveDays}天`,
                  },
                  {
                    key: 'totalCheckIns',
                    label: '总签到',
                    width: '100px',
                    render: (r) => `${r.totalCheckIns}次`,
                  },
                  {
                    key: 'totalReward',
                    label: '获得积分',
                    width: '100px',
                    render: (r) => (
                      <span className="text-green-600">+{r.totalReward}</span>
                    ),
                  },
                  { key: 'checkInSource', label: '来源', width: '100px' },
                ]}
                rowHeight={56}
                containerHeight={500}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
