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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Award,
  Calendar,
  Clock,
  Download,
  Gift,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CreditTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type:
    | 'signin'
    | 'referral_bonus'
    | 'referred_bonus'
    | 'share_bonus'
    | 'milestone'
    | 'task_complete'
    | 'admin_adjust'
    | 'deduction';
  amount: number;
  balance: number;
  description: string;
  metadata?: any;
  createdAt: string;
}

interface UserCredits {
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastSignIn?: string;
  signInStreak: number;
}

interface MilestoneConfig {
  days: number;
  reward: number;
  enabled: boolean;
}

interface CreditConfig {
  signin: {
    daily: number;
    consecutive7: number;
    consecutive30: number;
  };
  milestones: MilestoneConfig[];
  tasks: {
    firstBazi: number;
    firstFengshui: number;
    firstPdfExport: number;
    firstShare: number;
  };
}

interface CreditStats {
  totalUsers: number;
  totalCreditsIssued: number;
  totalCreditsSpent: number;
  averageBalance: number;
  todaySignins: number;
  activeUsers7d: number;
}

export default function CreditsManagement() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredits[]>([]);
  const [config, setConfig] = useState<CreditConfig>({
    signin: {
      daily: 1,
      consecutive7: 5,
      consecutive30: 20,
    },
    milestones: [
      { days: 7, reward: 10, enabled: true },
      { days: 15, reward: 20, enabled: true },
      { days: 30, reward: 50, enabled: true },
      { days: 60, reward: 100, enabled: true },
      { days: 90, reward: 200, enabled: true },
    ],
    tasks: {
      firstBazi: 10,
      firstFengshui: 10,
      firstPdfExport: 5,
      firstShare: 3,
    },
  });
  const [stats, setStats] = useState<CreditStats>({
    totalUsers: 0,
    totalCreditsIssued: 0,
    totalCreditsSpent: 0,
    averageBalance: 0,
    todaySignins: 0,
    activeUsers7d: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserCredits | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('add');

  // 获取积分交易记录
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/growth/credits/transactions');
      const data = await response.json();
      setTransactions(data.transactions);
      setStats(data.stats);
    } catch (error) {
      console.error('获取交易记录失败:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取用户积分列表
  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/admin/growth/credits/users');
      const data = await response.json();
      setUserCredits(data.users);
    } catch (error) {
      console.error('获取用户积分失败:', error);
    }
  };

  // 获取配置
  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/credits');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchUserCredits();
    fetchConfig();
  }, []);

  // 调整用户积分
  const adjustUserCredits = async () => {
    if (!selectedUser || !adjustAmount) return;

    try {
      const amount = Number.parseInt(adjustAmount);
      const response = await fetch('/api/admin/growth/credits/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.userId,
          amount: adjustType === 'add' ? amount : -amount,
          reason: adjustReason || '管理员手动调整',
        }),
      });

      if (response.ok) {
        toast.success('积分调整成功');
        setAdjustDialogOpen(false);
        setAdjustAmount('');
        setAdjustReason('');
        fetchTransactions();
        fetchUserCredits();
      } else {
        toast.error('调整失败');
      }
    } catch (error) {
      console.error('调整积分失败:', error);
      toast.error('调整失败');
    }
  };

  // 保存配置
  const saveConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/credits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success('配置保存成功');
      } else {
        toast.error('保存配置失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存配置失败');
    }
  };

  // 导出数据
  const exportData = async (type: 'transactions' | 'users') => {
    try {
      const response = await fetch(
        `/api/admin/growth/credits/export?type=${type}`,
        {
          method: 'GET',
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credits_${type}_${format(new Date(), 'yyyyMMdd')}.csv`;
      a.click();
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  // 交易记录表格列定义
  const transactionColumns: ColumnDef<CreditTransaction>[] = [
    {
      accessorKey: 'user',
      header: '用户',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.userName}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.userEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          signin: { label: '签到奖励', color: 'bg-blue-500' },
          referral_bonus: { label: '推荐奖励', color: 'bg-green-500' },
          referred_bonus: { label: '被推荐奖励', color: 'bg-emerald-500' },
          share_bonus: { label: '分享奖励', color: 'bg-purple-500' },
          milestone: { label: '里程碑', color: 'bg-yellow-500' },
          task_complete: { label: '任务完成', color: 'bg-indigo-500' },
          admin_adjust: { label: '管理员调整', color: 'bg-gray-500' },
          deduction: { label: '扣除', color: 'bg-red-500' },
        };
        const type = typeMap[row.original.type] || {
          label: row.original.type,
          color: 'bg-gray-500',
        };

        return (
          <Badge className={cn(type.color, 'text-white')}>{type.label}</Badge>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: '金额',
      cell: ({ row }) => (
        <div
          className={cn(
            'font-semibold',
            row.original.amount > 0 ? 'text-green-600' : 'text-red-600'
          )}
        >
          {row.original.amount > 0 ? '+' : ''}
          {row.original.amount}
        </div>
      ),
    },
    {
      accessorKey: 'balance',
      header: '余额',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.balance}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: '说明',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.description}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '时间',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm', {
            locale: zhCN,
          })}
        </div>
      ),
    },
  ];

  // 用户积分表格列定义
  const userColumns: ColumnDef<UserCredits>[] = [
    {
      accessorKey: 'user',
      header: '用户',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.userName}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.userEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'balance',
      header: '当前余额',
      cell: ({ row }) => (
        <div className="text-lg font-bold">{row.original.balance}</div>
      ),
    },
    {
      accessorKey: 'totalEarned',
      header: '累计获得',
      cell: ({ row }) => (
        <div className="text-green-600">+{row.original.totalEarned}</div>
      ),
    },
    {
      accessorKey: 'totalSpent',
      header: '累计消费',
      cell: ({ row }) => (
        <div className="text-red-600">-{row.original.totalSpent}</div>
      ),
    },
    {
      accessorKey: 'signInStreak',
      header: '连续签到',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>{row.original.signInStreak} 天</span>
        </div>
      ),
    },
    {
      accessorKey: 'lastSignIn',
      header: '最后签到',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.lastSignIn
            ? format(new Date(row.original.lastSignIn), 'yyyy-MM-dd', {
                locale: zhCN,
              })
            : '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedUser(row.original);
            setAdjustDialogOpen(true);
          }}
        >
          调整积分
        </Button>
      ),
    },
  ];

  // 过滤交易记录
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      searchQuery === '' ||
      transaction.userName.includes(searchQuery) ||
      transaction.userEmail.includes(searchQuery) ||
      transaction.description.includes(searchQuery);

    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">积分激励管理</h1>
          <p className="text-muted-foreground mt-1">管理用户积分和奖励规则</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchTransactions()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总积分发放
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCreditsIssued}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Gift className="mr-1 h-3 w-3" />
              累计发放
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageBalance.toFixed(1)}
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              人均积分
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日签到
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySignins}</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <Calendar className="mr-1 h-3 w-3" />
              活跃用户
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              7日活跃
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers7d}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Zap className="mr-1 h-3 w-3" />
              近期活跃
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">交易记录</TabsTrigger>
          <TabsTrigger value="users">用户积分</TabsTrigger>
          <TabsTrigger value="config">奖励配置</TabsTrigger>
        </TabsList>

        {/* 交易记录标签页 */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>积分交易记录</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索用户或说明..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="signin">签到</SelectItem>
                      <SelectItem value="referral_bonus">推荐奖励</SelectItem>
                      <SelectItem value="share_bonus">分享奖励</SelectItem>
                      <SelectItem value="milestone">里程碑</SelectItem>
                      <SelectItem value="admin_adjust">调整</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => exportData('transactions')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={transactionColumns}
                data={filteredTransactions}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户积分标签页 */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>用户积分管理</CardTitle>
                <Button variant="outline" onClick={() => exportData('users')}>
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={userColumns}
                data={userCredits}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 配置标签页 */}
        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 签到奖励配置 */}
            <Card>
              <CardHeader>
                <CardTitle>签到奖励</CardTitle>
                <CardDescription>配置每日签到和连续签到奖励</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>每日签到奖励</Label>
                  <Input
                    type="number"
                    value={config.signin.daily}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        signin: {
                          ...config.signin,
                          daily: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>连续7天额外奖励</Label>
                  <Input
                    type="number"
                    value={config.signin.consecutive7}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        signin: {
                          ...config.signin,
                          consecutive7: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>连续30天额外奖励</Label>
                  <Input
                    type="number"
                    value={config.signin.consecutive30}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        signin: {
                          ...config.signin,
                          consecutive30: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 里程碑奖励配置 */}
            <Card>
              <CardHeader>
                <CardTitle>里程碑奖励</CardTitle>
                <CardDescription>配置注册天数里程碑奖励</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm">{milestone.days}天奖励</Label>
                      <Input
                        type="number"
                        value={milestone.reward}
                        onChange={(e) => {
                          const newMilestones = [...config.milestones];
                          newMilestones[index].reward = Number.parseInt(
                            e.target.value
                          );
                          setConfig({
                            ...config,
                            milestones: newMilestones,
                          });
                        }}
                      />
                    </div>
                    <div className="pt-6">
                      <Badge
                        variant={milestone.enabled ? 'success' : 'secondary'}
                      >
                        {milestone.enabled ? '启用' : '禁用'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 任务奖励配置 */}
            <Card>
              <CardHeader>
                <CardTitle>任务奖励</CardTitle>
                <CardDescription>配置首次完成任务的奖励</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>首次八字分析</Label>
                  <Input
                    type="number"
                    value={config.tasks.firstBazi}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tasks: {
                          ...config.tasks,
                          firstBazi: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>首次风水分析</Label>
                  <Input
                    type="number"
                    value={config.tasks.firstFengshui}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tasks: {
                          ...config.tasks,
                          firstFengshui: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>首次PDF导出</Label>
                  <Input
                    type="number"
                    value={config.tasks.firstPdfExport}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tasks: {
                          ...config.tasks,
                          firstPdfExport: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>首次分享</Label>
                  <Input
                    type="number"
                    value={config.tasks.firstShare}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        tasks: {
                          ...config.tasks,
                          firstShare: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 保存按钮 */}
            <div className="lg:col-span-2">
              <Button onClick={saveConfig} className="w-full">
                保存配置
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 积分调整对话框 */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整用户积分</DialogTitle>
            <DialogDescription>
              为用户 {selectedUser?.userName} 调整积分
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>当前余额</Label>
              <div className="text-2xl font-bold">
                {selectedUser?.balance || 0}
              </div>
            </div>
            <div className="space-y-2">
              <Label>调整类型</Label>
              <Select
                value={adjustType}
                onValueChange={(v: 'add' | 'deduct') => setAdjustType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4 text-green-500" />
                      增加积分
                    </div>
                  </SelectItem>
                  <SelectItem value="deduct">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4 text-red-500" />
                      扣除积分
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>调整金额</Label>
              <Input
                type="number"
                placeholder="输入积分数量"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>调整原因</Label>
              <Textarea
                placeholder="请输入调整原因..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdjustDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={adjustUserCredits}>确认调整</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
