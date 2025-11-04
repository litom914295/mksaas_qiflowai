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
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import {
  Calendar,
  Check,
  Copy,
  DollarSign,
  Download,
  Gift,
  Link2,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ReferralRelation {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referredId: string;
  referredName: string;
  referredEmail: string;
  status: 'pending' | 'activated' | 'expired';
  referralCode: string;
  createdAt: string;
  activatedAt?: string;
  rewardIssued: boolean;
}

interface ReferralConfig {
  referrerReward: number;
  referredReward: number;
  activationConditions: {
    requireBazi: boolean;
    requireFengshui: boolean;
    requirePdfExport: boolean;
    requireAiChat: boolean;
    aiChatCount: number;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    totalLimit: number;
  };
  expirationDays: number;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  activatedReferrals: number;
  totalRewardsIssued: number;
  averageActivationTime: number;
  conversionRate: number;
}

export default function ReferralsManagement() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralRelation[]>([]);
  const [config, setConfig] = useState<ReferralConfig>({
    referrerReward: 15,
    referredReward: 20,
    activationConditions: {
      requireBazi: true,
      requireFengshui: true,
      requirePdfExport: true,
      requireAiChat: true,
      aiChatCount: 3,
    },
    limits: {
      dailyLimit: 3,
      monthlyLimit: 40,
      totalLimit: 1000,
    },
    expirationDays: 30,
  });
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    pendingReferrals: 0,
    activatedReferrals: 0,
    totalRewardsIssued: 0,
    averageActivationTime: 0,
    conversionRate: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);

  // 获取推荐关系数据
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/growth/referrals');
      const data = await response.json();
      setReferrals(data.referrals);
      setStats(data.stats);
    } catch (error) {
      console.error('获取推荐数据失败:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取配置
  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/referral');
      const data = await response.json();
      setConfig(data);
      setTempConfig(data);
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  };

  useEffect(() => {
    fetchReferrals();
    fetchConfig();
  }, []);

  // 保存配置
  const saveConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/referral', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempConfig),
      });

      if (response.ok) {
        setConfig(tempConfig);
        setConfigDialogOpen(false);
        toast.success('配置保存成功');
      } else {
        toast.error('保存配置失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存配置失败');
    }
  };

  // 确保所有用户有推荐码
  const ensureReferralCodes = async () => {
    try {
      const response = await fetch('/api/admin/referral/ensure-codes', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`成功生成 ${data.generated} 个推荐码`);
        fetchReferrals();
      }
    } catch (error) {
      console.error('生成推荐码失败:', error);
      toast.error('生成推荐码失败');
    }
  };

  // 复制推荐链接
  const copyReferralLink = (code: string) => {
    const link = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(link);
    toast.success('推荐链接已复制');
  };

  // 导出数据
  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/growth/referrals/export', {
        method: 'GET',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `referrals_${format(new Date(), 'yyyyMMdd')}.csv`;
      a.click();
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  // 表格列定义
  const columns: ColumnDef<ReferralRelation>[] = [
    {
      accessorKey: 'referralCode',
      header: '推荐码',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {row.original.referralCode}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => copyReferralLink(row.original.referralCode)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: 'referrer',
      header: '推荐人',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.referrerName}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.referrerEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'referred',
      header: '被推荐人',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.referredName}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.referredEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'activated'
                ? 'success'
                : status === 'pending'
                  ? 'warning'
                  : 'secondary'
            }
          >
            {status === 'activated'
              ? '已激活'
              : status === 'pending'
                ? '待激活'
                : '已过期'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'rewardIssued',
      header: '奖励状态',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.rewardIssued ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">已发放</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">未发放</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm', {
            locale: zhCN,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'activatedAt',
      header: '激活时间',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.activatedAt
            ? format(new Date(row.original.activatedAt), 'yyyy-MM-dd HH:mm', {
                locale: zhCN,
              })
            : '-'}
        </div>
      ),
    },
  ];

  // 过滤数据
  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      searchQuery === '' ||
      referral.referrerName.includes(searchQuery) ||
      referral.referrerEmail.includes(searchQuery) ||
      referral.referredName.includes(searchQuery) ||
      referral.referredEmail.includes(searchQuery) ||
      referral.referralCode.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'all' || referral.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">推荐裂变管理</h1>
          <p className="text-muted-foreground mt-1">
            管理用户推荐关系和奖励配置
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={ensureReferralCodes}>
            <UserPlus className="mr-2 h-4 w-4" />
            生成推荐码
          </Button>
          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                配置
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>推荐奖励配置</DialogTitle>
                <DialogDescription>
                  配置推荐奖励规则和激活条件
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* 奖励设置 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">奖励设置</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>推荐人奖励（积分）</Label>
                      <Input
                        type="number"
                        value={tempConfig.referrerReward}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            referrerReward: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>被推荐人奖励（积分）</Label>
                      <Input
                        type="number"
                        value={tempConfig.referredReward}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            referredReward: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* 激活条件 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">激活条件</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>需要完成八字分析</Label>
                      <Switch
                        checked={tempConfig.activationConditions.requireBazi}
                        onCheckedChange={(checked) =>
                          setTempConfig({
                            ...tempConfig,
                            activationConditions: {
                              ...tempConfig.activationConditions,
                              requireBazi: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>需要完成风水分析</Label>
                      <Switch
                        checked={
                          tempConfig.activationConditions.requireFengshui
                        }
                        onCheckedChange={(checked) =>
                          setTempConfig({
                            ...tempConfig,
                            activationConditions: {
                              ...tempConfig.activationConditions,
                              requireFengshui: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>需要导出PDF</Label>
                      <Switch
                        checked={
                          tempConfig.activationConditions.requirePdfExport
                        }
                        onCheckedChange={(checked) =>
                          setTempConfig({
                            ...tempConfig,
                            activationConditions: {
                              ...tempConfig.activationConditions,
                              requirePdfExport: checked,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>需要AI对话（次数）</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={
                            tempConfig.activationConditions.requireAiChat
                          }
                          onCheckedChange={(checked) =>
                            setTempConfig({
                              ...tempConfig,
                              activationConditions: {
                                ...tempConfig.activationConditions,
                                requireAiChat: checked,
                              },
                            })
                          }
                        />
                        {tempConfig.activationConditions.requireAiChat && (
                          <Input
                            type="number"
                            className="w-20"
                            value={tempConfig.activationConditions.aiChatCount}
                            onChange={(e) =>
                              setTempConfig({
                                ...tempConfig,
                                activationConditions: {
                                  ...tempConfig.activationConditions,
                                  aiChatCount: Number.parseInt(e.target.value),
                                },
                              })
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 限制设置 */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">限制设置</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>每日限制</Label>
                      <Input
                        type="number"
                        value={tempConfig.limits.dailyLimit}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            limits: {
                              ...tempConfig.limits,
                              dailyLimit: Number.parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>每月限制</Label>
                      <Input
                        type="number"
                        value={tempConfig.limits.monthlyLimit}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            limits: {
                              ...tempConfig.limits,
                              monthlyLimit: Number.parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>总限制</Label>
                      <Input
                        type="number"
                        value={tempConfig.limits.totalLimit}
                        onChange={(e) =>
                          setTempConfig({
                            ...tempConfig,
                            limits: {
                              ...tempConfig.limits,
                              totalLimit: Number.parseInt(e.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>过期天数</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[tempConfig.expirationDays]}
                        onValueChange={(value) =>
                          setTempConfig({
                            ...tempConfig,
                            expirationDays: value[0],
                          })
                        }
                        max={90}
                        min={7}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm">
                        {tempConfig.expirationDays}天
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfigDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={saveConfig}>保存配置</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总推荐数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Users className="mr-1 h-3 w-3" />
              累计推荐
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待激活
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
            <div className="flex items-center mt-2 text-sm text-warning">
              <Calendar className="mr-1 h-3 w-3" />
              等待激活
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              激活率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.conversionRate * 100).toFixed(1)}%
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              转化率
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已发放积分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRewardsIssued}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Gift className="mr-1 h-3 w-3" />
              总积分
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>推荐关系列表</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户或推荐码..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待激活</SelectItem>
                  <SelectItem value="activated">已激活</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchReferrals}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredReferrals}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
