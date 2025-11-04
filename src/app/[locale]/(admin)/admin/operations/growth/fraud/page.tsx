'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import {
  Activity,
  AlertTriangle,
  Ban,
  Clock,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  UserX,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

interface BlacklistEntry {
  id: string;
  type: 'ip' | 'fingerprint' | 'user' | 'email' | 'phone';
  value: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
  permanent: boolean;
  hitCount: number;
}

interface FraudEvent {
  id: string;
  userId?: string;
  userName?: string;
  eventType:
    | 'login_attempt'
    | 'share_abuse'
    | 'referral_abuse'
    | 'credit_abuse'
    | 'suspicious_activity';
  description: string;
  ip: string;
  fingerprint: string;
  riskScore: number;
  blocked: boolean;
  metadata: any;
  createdAt: string;
}

interface FraudRule {
  id: string;
  name: string;
  description: string;
  type: 'rate_limit' | 'pattern' | 'threshold' | 'blacklist';
  enabled: boolean;
  config: any;
  priority: number;
  actions: string[];
}

interface FraudConfig {
  enableFraudDetection: boolean;
  autoBlockThreshold: number;
  blockDuration: number;
  rateLimits: {
    login: { attempts: number; window: number };
    share: { attempts: number; window: number };
    referral: { attempts: number; window: number };
    credit: { attempts: number; window: number };
  };
  riskFactors: {
    newAccount: number;
    vpnDetected: number;
    suspiciousPattern: number;
    blacklisted: number;
  };
}

interface FraudStats {
  totalEvents: number;
  blockedEvents: number;
  blacklistEntries: number;
  todayEvents: number;
  todayBlocked: number;
  averageRiskScore: number;
  topEventType: string;
  blockRate: number;
}

export default function FraudManagement() {
  const [loading, setLoading] = useState(true);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [fraudEvents, setFraudEvents] = useState<FraudEvent[]>([]);
  const [fraudRules, setFraudRules] = useState<FraudRule[]>([]);
  const [config, setConfig] = useState<FraudConfig>({
    enableFraudDetection: true,
    autoBlockThreshold: 80,
    blockDuration: 24,
    rateLimits: {
      login: { attempts: 5, window: 15 },
      share: { attempts: 1, window: 60 },
      referral: { attempts: 3, window: 1440 },
      credit: { attempts: 10, window: 60 },
    },
    riskFactors: {
      newAccount: 10,
      vpnDetected: 30,
      suspiciousPattern: 40,
      blacklisted: 100,
    },
  });
  const [stats, setStats] = useState<FraudStats>({
    totalEvents: 0,
    blockedEvents: 0,
    blacklistEntries: 0,
    todayEvents: 0,
    todayBlocked: 0,
    averageRiskScore: 0,
    topEventType: 'login_attempt',
    blockRate: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [newBlacklistEntry, setNewBlacklistEntry] = useState({
    type: 'ip' as const,
    value: '',
    reason: '',
    permanent: false,
    expirationDays: 30,
  });
  const [selectedEvent, setSelectedEvent] = useState<FraudEvent | null>(null);
  const [eventDetailDialogOpen, setEventDetailDialogOpen] = useState(false);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);

  // 获取黑名单
  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/fraud-blacklist/list');
      const data = await response.json();
      setBlacklist(data.entries || []);
      setStats((prev) => ({
        ...prev,
        blacklistEntries: data.entries?.length || 0,
      }));
    } catch (error) {
      console.error('获取黑名单失败:', error);
      toast.error('获取黑名单失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取风控事件
  const fetchFraudEvents = async () => {
    try {
      const response = await fetch('/api/admin/growth/fraud/events');
      const data = await response.json();
      setFraudEvents(data.events || []);
      setStats(data.stats || stats);
      setTrendData(data.trendData || []);
      setRiskDistribution(data.riskDistribution || []);
    } catch (error) {
      console.error('获取风控事件失败:', error);
    }
  };

  // 获取风控规则
  const fetchFraudRules = async () => {
    try {
      const response = await fetch('/api/admin/growth/fraud/rules');
      const data = await response.json();
      setFraudRules(data.rules || []);
    } catch (error) {
      console.error('获取风控规则失败:', error);
    }
  };

  // 获取配置
  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/fraud');
      const data = await response.json();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  };

  useEffect(() => {
    fetchBlacklist();
    fetchFraudEvents();
    fetchFraudRules();
    fetchConfig();
  }, []);

  // 添加黑名单
  const addToBlacklist = async () => {
    try {
      const response = await fetch('/api/admin/fraud-blacklist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newBlacklistEntry.type,
          value: newBlacklistEntry.value,
          reason: newBlacklistEntry.reason,
          permanent: newBlacklistEntry.permanent,
          expirationDays: newBlacklistEntry.permanent
            ? null
            : newBlacklistEntry.expirationDays,
        }),
      });

      if (response.ok) {
        toast.success('添加黑名单成功');
        setBlacklistDialogOpen(false);
        setNewBlacklistEntry({
          type: 'ip',
          value: '',
          reason: '',
          permanent: false,
          expirationDays: 30,
        });
        fetchBlacklist();
      } else {
        toast.error('添加失败');
      }
    } catch (error) {
      console.error('添加黑名单失败:', error);
      toast.error('添加失败');
    }
  };

  // 移除黑名单
  const removeFromBlacklist = async (id: string) => {
    try {
      const response = await fetch('/api/admin/fraud-blacklist/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success('移除成功');
        fetchBlacklist();
      }
    } catch (error) {
      toast.error('移除失败');
    }
  };

  // 保存配置
  const saveConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/fraud', {
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
  const exportData = async (type: 'blacklist' | 'events') => {
    try {
      const response = await fetch(
        `/api/admin/growth/fraud/export?type=${type}`,
        {
          method: 'GET',
        }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fraud_${type}_${format(new Date(), 'yyyyMMdd')}.csv`;
      a.click();
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  // 黑名单表格列定义
  const blacklistColumns: ColumnDef<BlacklistEntry>[] = [
    {
      accessorKey: 'type',
      header: '类型',
      cell: ({ row }) => {
        const typeMap: Record<
          string,
          { label: string; icon: React.ElementType }
        > = {
          ip: { label: 'IP地址', icon: Globe },
          fingerprint: { label: '设备指纹', icon: Fingerprint },
          user: { label: '用户ID', icon: UserX },
          email: { label: '邮箱', icon: UserX },
          phone: { label: '手机号', icon: UserX },
        };
        const type = typeMap[row.original.type] || {
          label: row.original.type,
          icon: Ban,
        };
        const Icon = type.icon;

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{type.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'value',
      header: '值',
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-2 py-1 rounded">
          {row.original.value}
        </code>
      ),
    },
    {
      accessorKey: 'reason',
      header: '原因',
      cell: ({ row }) => row.original.reason,
    },
    {
      accessorKey: 'hitCount',
      header: '拦截次数',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.hitCount} 次</Badge>
      ),
    },
    {
      accessorKey: 'permanent',
      header: '状态',
      cell: ({ row }) => (
        <Badge variant={row.original.permanent ? 'destructive' : 'warning'}>
          {row.original.permanent ? '永久封禁' : '临时封禁'}
        </Badge>
      ),
    },
    {
      accessorKey: 'expiresAt',
      header: '过期时间',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.expiresAt
            ? format(new Date(row.original.expiresAt), 'yyyy-MM-dd HH:mm', {
                locale: zhCN,
              })
            : '永不过期'}
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
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeFromBlacklist(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // 风控事件表格列定义
  const eventColumns: ColumnDef<FraudEvent>[] = [
    {
      accessorKey: 'eventType',
      header: '事件类型',
      cell: ({ row }) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          login_attempt: { label: '登录异常', color: 'bg-blue-500' },
          share_abuse: { label: '分享滥用', color: 'bg-purple-500' },
          referral_abuse: { label: '推荐滥用', color: 'bg-green-500' },
          credit_abuse: { label: '积分滥用', color: 'bg-yellow-500' },
          suspicious_activity: { label: '可疑活动', color: 'bg-red-500' },
        };
        const type = typeMap[row.original.eventType] || {
          label: '未知',
          color: 'bg-gray-500',
        };

        return (
          <Badge className={cn(type.color, 'text-white')}>{type.label}</Badge>
        );
      },
    },
    {
      accessorKey: 'user',
      header: '用户',
      cell: ({ row }) => <div>{row.original.userName || '匿名'}</div>,
    },
    {
      accessorKey: 'description',
      header: '描述',
      cell: ({ row }) => (
        <div className="max-w-xs truncate">{row.original.description}</div>
      ),
    },
    {
      accessorKey: 'riskScore',
      header: '风险分数',
      cell: ({ row }) => {
        const score = row.original.riskScore;
        const color =
          score >= 80
            ? 'text-red-600'
            : score >= 60
              ? 'text-orange-500'
              : score >= 40
                ? 'text-yellow-500'
                : 'text-green-500';

        return <div className={cn('font-bold', color)}>{score}</div>;
      },
    },
    {
      accessorKey: 'ip',
      header: 'IP地址',
      cell: ({ row }) => <code className="text-xs">{row.original.ip}</code>,
    },
    {
      accessorKey: 'blocked',
      header: '处理结果',
      cell: ({ row }) => (
        <Badge variant={row.original.blocked ? 'destructive' : 'success'}>
          {row.original.blocked ? '已拦截' : '已放行'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '时间',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm:ss', {
            locale: zhCN,
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedEvent(row.original);
            setEventDetailDialogOpen(true);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // 过滤事件
  const filteredEvents = fraudEvents.filter((event) => {
    const matchesSearch =
      searchQuery === '' ||
      event.description.includes(searchQuery) ||
      event.ip.includes(searchQuery) ||
      event.userName?.includes(searchQuery);

    const matchesType =
      eventTypeFilter === 'all' || event.eventType === eventTypeFilter;

    return matchesSearch && matchesType;
  });

  const COLORS = ['#FF6B6B', '#FFA06B', '#FFD93D', '#6BCB77', '#4D96FF'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">风控管理系统</h1>
          <p className="text-muted-foreground mt-1">
            监控和管理风险事件与黑名单
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              fetchBlacklist();
              fetchFraudEvents();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 风控状态提示 */}
      {config.enableFraudDetection ? (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>风控系统已启用</AlertTitle>
          <AlertDescription>
            当前自动拦截阈值: {config.autoBlockThreshold}分 | 封禁时长:{' '}
            {config.blockDuration}小时
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>风控系统已禁用</AlertTitle>
          <AlertDescription>
            系统不会自动拦截任何可疑行为，请尽快启用风控系统
          </AlertDescription>
        </Alert>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总事件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Activity className="mr-1 h-3 w-3" />
              今日 +{stats.todayEvents}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              拦截事件
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedEvents}</div>
            <div className="flex items-center mt-2 text-sm text-red-600">
              <Ban className="mr-1 h-3 w-3" />
              今日 +{stats.todayBlocked}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              黑名单数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blacklistEntries}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <UserX className="mr-1 h-3 w-3" />
              活跃封禁
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              拦截率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.blockRate * 100).toFixed(1)}%
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Shield className="mr-1 h-3 w-3" />
              风控效率
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 风险趋势和分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>风险事件趋势</CardTitle>
            <CardDescription>最近7天的风险事件统计</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="总事件"
                />
                <Area
                  type="monotone"
                  dataKey="blocked"
                  stackId="1"
                  stroke="#ff7c7c"
                  fill="#ff7c7c"
                  name="拦截数"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>风险分布</CardTitle>
            <CardDescription>按事件类型分布</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">风控事件</TabsTrigger>
          <TabsTrigger value="blacklist">黑名单管理</TabsTrigger>
          <TabsTrigger value="rules">风控规则</TabsTrigger>
          <TabsTrigger value="config">系统配置</TabsTrigger>
        </TabsList>

        {/* 风控事件标签页 */}
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>风控事件记录</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索事件..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select
                    value={eventTypeFilter}
                    onValueChange={setEventTypeFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="login_attempt">登录异常</SelectItem>
                      <SelectItem value="share_abuse">分享滥用</SelectItem>
                      <SelectItem value="referral_abuse">推荐滥用</SelectItem>
                      <SelectItem value="credit_abuse">积分滥用</SelectItem>
                      <SelectItem value="suspicious_activity">
                        可疑活动
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => exportData('events')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={eventColumns}
                data={filteredEvents}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 黑名单管理标签页 */}
        <TabsContent value="blacklist">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>黑名单列表</CardTitle>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setBlacklistDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    添加黑名单
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportData('blacklist')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={blacklistColumns}
                data={blacklist}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 风控规则标签页 */}
        <TabsContent value="rules">
          <div className="grid grid-cols-1 gap-4">
            {fraudRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <Badge variant={rule.enabled ? 'success' : 'secondary'}>
                        {rule.enabled ? '启用' : '禁用'}
                      </Badge>
                      <Badge variant="outline">优先级 {rule.priority}</Badge>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => {
                        const updatedRules = fraudRules.map((r) =>
                          r.id === rule.id ? { ...r, enabled: checked } : r
                        );
                        setFraudRules(updatedRules);
                        // 这里应该调用API更新规则
                      }}
                    />
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">类型：</span>
                      <Badge variant="outline" className="ml-2">
                        {rule.type}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">动作：</span>
                      {rule.actions.map((action) => (
                        <Badge key={action} variant="outline" className="ml-2">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 系统配置标签页 */}
        <TabsContent value="config">
          <div className="space-y-6">
            {/* 总开关 */}
            <Card>
              <CardHeader>
                <CardTitle>风控系统开关</CardTitle>
                <CardDescription>启用或禁用整个风控系统</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用风控检测</Label>
                    <p className="text-sm text-muted-foreground">
                      启用后系统将自动检测和拦截可疑行为
                    </p>
                  </div>
                  <Switch
                    checked={config.enableFraudDetection}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        enableFraudDetection: checked,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 自动拦截配置 */}
              <Card>
                <CardHeader>
                  <CardTitle>自动拦截配置</CardTitle>
                  <CardDescription>配置自动拦截的阈值和时长</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>风险分数阈值</Label>
                    <Input
                      type="number"
                      value={config.autoBlockThreshold}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          autoBlockThreshold: Number.parseInt(e.target.value),
                        })
                      }
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      风险分数超过此值时自动拦截（0-100）
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>封禁时长（小时）</Label>
                    <Input
                      type="number"
                      value={config.blockDuration}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          blockDuration: Number.parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 速率限制配置 */}
              <Card>
                <CardHeader>
                  <CardTitle>速率限制</CardTitle>
                  <CardDescription>配置各类操作的速率限制</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>登录尝试</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={config.rateLimits.login.attempts}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rateLimits: {
                              ...config.rateLimits,
                              login: {
                                ...config.rateLimits.login,
                                attempts: Number.parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        placeholder="次数"
                      />
                      <Input
                        type="number"
                        value={config.rateLimits.login.window}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rateLimits: {
                              ...config.rateLimits,
                              login: {
                                ...config.rateLimits.login,
                                window: Number.parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        placeholder="分钟"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>分享操作</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={config.rateLimits.share.attempts}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rateLimits: {
                              ...config.rateLimits,
                              share: {
                                ...config.rateLimits.share,
                                attempts: Number.parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        placeholder="次数"
                      />
                      <Input
                        type="number"
                        value={config.rateLimits.share.window}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            rateLimits: {
                              ...config.rateLimits,
                              share: {
                                ...config.rateLimits.share,
                                window: Number.parseInt(e.target.value),
                              },
                            },
                          })
                        }
                        placeholder="分钟"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 风险因子配置 */}
              <Card>
                <CardHeader>
                  <CardTitle>风险因子权重</CardTitle>
                  <CardDescription>配置不同风险因子的分数权重</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>新账号（注册7天内）</Label>
                    <Input
                      type="number"
                      value={config.riskFactors.newAccount}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          riskFactors: {
                            ...config.riskFactors,
                            newAccount: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>VPN/代理检测</Label>
                    <Input
                      type="number"
                      value={config.riskFactors.vpnDetected}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          riskFactors: {
                            ...config.riskFactors,
                            vpnDetected: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>可疑行为模式</Label>
                    <Input
                      type="number"
                      value={config.riskFactors.suspiciousPattern}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          riskFactors: {
                            ...config.riskFactors,
                            suspiciousPattern: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>黑名单命中</Label>
                    <Input
                      type="number"
                      value={config.riskFactors.blacklisted}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          riskFactors: {
                            ...config.riskFactors,
                            blacklisted: Number.parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 保存按钮 */}
            <Button onClick={saveConfig} className="w-full">
              保存配置
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* 添加黑名单对话框 */}
      <Dialog open={blacklistDialogOpen} onOpenChange={setBlacklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加黑名单</DialogTitle>
            <DialogDescription>
              添加IP、设备指纹或用户到黑名单
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Select
                value={newBlacklistEntry.type}
                onValueChange={(v: any) =>
                  setNewBlacklistEntry({
                    ...newBlacklistEntry,
                    type: v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ip">IP地址</SelectItem>
                  <SelectItem value="fingerprint">设备指纹</SelectItem>
                  <SelectItem value="user">用户ID</SelectItem>
                  <SelectItem value="email">邮箱</SelectItem>
                  <SelectItem value="phone">手机号</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>值</Label>
              <Input
                value={newBlacklistEntry.value}
                onChange={(e) =>
                  setNewBlacklistEntry({
                    ...newBlacklistEntry,
                    value: e.target.value,
                  })
                }
                placeholder={
                  newBlacklistEntry.type === 'ip'
                    ? '192.168.1.1'
                    : newBlacklistEntry.type === 'email'
                      ? 'example@email.com'
                      : newBlacklistEntry.type === 'phone'
                        ? '13800138000'
                        : '输入要封禁的值'
                }
              />
            </div>
            <div className="space-y-2">
              <Label>原因</Label>
              <Textarea
                value={newBlacklistEntry.reason}
                onChange={(e) =>
                  setNewBlacklistEntry({
                    ...newBlacklistEntry,
                    reason: e.target.value,
                  })
                }
                placeholder="请输入封禁原因..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>永久封禁</Label>
                <p className="text-xs text-muted-foreground">
                  启用后将永久封禁，否则按时长封禁
                </p>
              </div>
              <Switch
                checked={newBlacklistEntry.permanent}
                onCheckedChange={(checked) =>
                  setNewBlacklistEntry({
                    ...newBlacklistEntry,
                    permanent: checked,
                  })
                }
              />
            </div>
            {!newBlacklistEntry.permanent && (
              <div className="space-y-2">
                <Label>封禁天数</Label>
                <Input
                  type="number"
                  value={newBlacklistEntry.expirationDays}
                  onChange={(e) =>
                    setNewBlacklistEntry({
                      ...newBlacklistEntry,
                      expirationDays: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlacklistDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={addToBlacklist}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 事件详情对话框 */}
      <Dialog
        open={eventDetailDialogOpen}
        onOpenChange={setEventDetailDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>事件详情</DialogTitle>
            <DialogDescription>事件ID: {selectedEvent?.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>事件类型</Label>
                <p className="text-sm">{selectedEvent?.eventType}</p>
              </div>
              <div className="space-y-2">
                <Label>风险分数</Label>
                <p className="text-sm font-bold">{selectedEvent?.riskScore}</p>
              </div>
              <div className="space-y-2">
                <Label>用户</Label>
                <p className="text-sm">{selectedEvent?.userName || '匿名'}</p>
              </div>
              <div className="space-y-2">
                <Label>处理结果</Label>
                <p className="text-sm">
                  {selectedEvent?.blocked ? '已拦截' : '已放行'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>IP地址</Label>
                <p className="text-sm">{selectedEvent?.ip}</p>
              </div>
              <div className="space-y-2">
                <Label>设备指纹</Label>
                <p className="text-sm font-mono text-xs">
                  {selectedEvent?.fingerprint}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>事件描述</Label>
              <p className="text-sm">{selectedEvent?.description}</p>
            </div>
            {selectedEvent?.metadata && (
              <div className="space-y-2">
                <Label>元数据</Label>
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(selectedEvent.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEventDetailDialogOpen(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
