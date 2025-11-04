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
import { zhCN } from 'date-fns/locale/zh-CN';
import {
  BarChart3,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Link2,
  MousePointer,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

interface ShareRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  shareId: string;
  shareUrl: string;
  platform: 'wechat' | 'weibo' | 'qq' | 'link' | 'other';
  title: string;
  description: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  rewardIssued: boolean;
  createdAt: string;
  lastClickAt?: string;
}

interface ShareClick {
  id: string;
  shareId: string;
  visitorId: string;
  ip: string;
  userAgent: string;
  referer: string;
  converted: boolean;
  createdAt: string;
}

interface ShareConfig {
  rewards: {
    firstShare: number;
    perClick: number;
    perConversion: number;
  };
  limits: {
    dailyShares: number;
    cooldownMinutes: number;
    maxRewardPerDay: number;
  };
  templates: {
    id: string;
    name: string;
    title: string;
    description: string;
    image: string;
    enabled: boolean;
  }[];
}

interface ShareStats {
  totalShares: number;
  totalClicks: number;
  totalConversions: number;
  averageConversionRate: number;
  todayShares: number;
  todayClicks: number;
  todayConversions: number;
  topPlatform: string;
}

export default function SharesManagement() {
  const [loading, setLoading] = useState(true);
  const [shareRecords, setShareRecords] = useState<ShareRecord[]>([]);
  const [shareClicks, setShareClicks] = useState<ShareClick[]>([]);
  const [config, setConfig] = useState<ShareConfig>({
    rewards: {
      firstShare: 3,
      perClick: 0,
      perConversion: 5,
    },
    limits: {
      dailyShares: 1,
      cooldownMinutes: 60,
      maxRewardPerDay: 20,
    },
    templates: [
      {
        id: '1',
        name: '默认模板',
        title: '发现一个超准的AI命理大师',
        description: '免费测算八字、风水，还有AI大师在线解答',
        image: '/images/share-default.jpg',
        enabled: true,
      },
    ],
  });
  const [stats, setStats] = useState<ShareStats>({
    totalShares: 0,
    totalClicks: 0,
    totalConversions: 0,
    averageConversionRate: 0,
    todayShares: 0,
    todayClicks: 0,
    todayConversions: 0,
    topPlatform: 'wechat',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedShare, setSelectedShare] = useState<ShareRecord | null>(null);
  const [clicksDialogOpen, setClicksDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [conversionChartData, setConversionChartData] = useState<any[]>([]);

  // 获取分享记录
  const fetchShareRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/growth/shares');
      const data = await response.json();
      setShareRecords(data.shares || []);
      setStats(data.stats || stats);
      setConversionChartData(data.chartData || []);
    } catch (error) {
      console.error('获取分享记录失败:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取点击详情
  const fetchShareClicks = async (shareId: string) => {
    try {
      const response = await fetch(
        `/api/admin/growth/shares/${shareId}/clicks`
      );
      const data = await response.json();
      setShareClicks(data.clicks || []);
    } catch (error) {
      console.error('获取点击详情失败:', error);
      toast.error('获取点击详情失败');
    }
  };

  // 获取配置
  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/share');
      const data = await response.json();
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  };

  useEffect(() => {
    fetchShareRecords();
    fetchConfig();
  }, []);

  // 保存配置
  const saveConfig = async () => {
    try {
      const response = await fetch('/api/admin/growth/config/share', {
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

  // 复制分享链接
  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('分享链接已复制');
  };

  // 导出数据
  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/growth/shares/export', {
        method: 'GET',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shares_${format(new Date(), 'yyyyMMdd')}.csv`;
      a.click();
      toast.success('导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  // 保存模板
  const saveTemplate = async () => {
    try {
      const templates = [...config.templates];
      if (selectedTemplate.id) {
        const index = templates.findIndex((t) => t.id === selectedTemplate.id);
        templates[index] = selectedTemplate;
      } else {
        templates.push({
          ...selectedTemplate,
          id: Date.now().toString(),
        });
      }

      setConfig({ ...config, templates });
      await saveConfig();
      setTemplateDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error('保存模板失败');
    }
  };

  // 表格列定义
  const columns: ColumnDef<ShareRecord>[] = [
    {
      accessorKey: 'shareId',
      header: '分享ID',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {row.original.shareId.slice(0, 8)}...
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => copyShareLink(row.original.shareUrl)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: 'user',
      header: '分享用户',
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
      accessorKey: 'platform',
      header: '平台',
      cell: ({ row }) => {
        const platformMap: Record<string, { label: string; color: string }> = {
          wechat: { label: '微信', color: 'bg-green-500' },
          weibo: { label: '微博', color: 'bg-red-500' },
          qq: { label: 'QQ', color: 'bg-blue-500' },
          link: { label: '链接', color: 'bg-gray-500' },
          other: { label: '其他', color: 'bg-purple-500' },
        };
        const platform = platformMap[row.original.platform] || {
          label: '未知',
          color: 'bg-gray-400',
        };

        return (
          <Badge className={cn(platform.color, 'text-white')}>
            {platform.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'clicks',
      header: '点击',
      cell: ({ row }) => (
        <Button
          variant="link"
          size="sm"
          onClick={() => {
            setSelectedShare(row.original);
            fetchShareClicks(row.original.shareId);
            setClicksDialogOpen(true);
          }}
          className="p-0 h-auto font-medium"
        >
          {row.original.clicks}
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      ),
    },
    {
      accessorKey: 'conversions',
      header: '转化',
      cell: ({ row }) => (
        <div className="font-medium text-green-600">
          {row.original.conversions}
        </div>
      ),
    },
    {
      accessorKey: 'conversionRate',
      header: '转化率',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="font-medium">
            {(row.original.conversionRate * 100).toFixed(1)}%
          </div>
          {row.original.conversionRate > 0.1 && (
            <TrendingUp className="h-3 w-3 text-green-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'rewardIssued',
      header: '奖励',
      cell: ({ row }) => (
        <Badge variant={row.original.rewardIssued ? 'success' : 'secondary'}>
          {row.original.rewardIssued ? '已发放' : '未发放'}
        </Badge>
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
  ];

  // 点击详情列定义
  const clickColumns: ColumnDef<ShareClick>[] = [
    {
      accessorKey: 'visitorId',
      header: '访客ID',
      cell: ({ row }) => (
        <code className="text-xs">{row.original.visitorId.slice(0, 8)}...</code>
      ),
    },
    {
      accessorKey: 'ip',
      header: 'IP地址',
      cell: ({ row }) => row.original.ip,
    },
    {
      accessorKey: 'converted',
      header: '是否转化',
      cell: ({ row }) => (
        <Badge variant={row.original.converted ? 'success' : 'secondary'}>
          {row.original.converted ? '已转化' : '未转化'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: '点击时间',
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'yyyy-MM-dd HH:mm:ss', {
            locale: zhCN,
          })}
        </div>
      ),
    },
  ];

  // 过滤数据
  const filteredShares = shareRecords.filter((share) => {
    const matchesSearch =
      searchQuery === '' ||
      share.userName.includes(searchQuery) ||
      share.userEmail.includes(searchQuery) ||
      share.title.includes(searchQuery) ||
      share.shareId.includes(searchQuery);

    const matchesPlatform =
      platformFilter === 'all' || share.platform === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">分享传播管理</h1>
          <p className="text-muted-foreground mt-1">管理分享记录和传播效果</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchShareRecords()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
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
              总分享数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShares}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Share2 className="mr-1 h-3 w-3" />
              今日 +{stats.todayShares}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总点击数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <MousePointer className="mr-1 h-3 w-3" />
              今日 +{stats.todayClicks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总转化数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <Target className="mr-1 h-3 w-3" />
              今日 +{stats.todayConversions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均转化率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.averageConversionRate * 100).toFixed(1)}%
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3" />
              转化效果
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 转化趋势图 */}
      <Card>
        <CardHeader>
          <CardTitle>转化趋势</CardTitle>
          <CardDescription>分享点击和转化趋势图</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={conversionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="shares"
                stroke="#8884d8"
                name="分享数"
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#82ca9d"
                name="点击数"
              />
              <Line
                type="monotone"
                dataKey="conversions"
                stroke="#ffc658"
                name="转化数"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 标签页 */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">分享记录</TabsTrigger>
          <TabsTrigger value="templates">分享模板</TabsTrigger>
          <TabsTrigger value="config">配置管理</TabsTrigger>
        </TabsList>

        {/* 分享记录标签页 */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>分享记录列表</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索用户或分享ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select
                    value={platformFilter}
                    onValueChange={setPlatformFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部平台</SelectItem>
                      <SelectItem value="wechat">微信</SelectItem>
                      <SelectItem value="weibo">微博</SelectItem>
                      <SelectItem value="qq">QQ</SelectItem>
                      <SelectItem value="link">链接</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredShares}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分享模板标签页 */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>分享模板管理</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedTemplate({
                      name: '',
                      title: '',
                      description: '',
                      image: '',
                      enabled: true,
                    });
                    setTemplateDialogOpen(true);
                  }}
                >
                  添加模板
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {config.templates.map((template) => (
                  <Card
                    key={template.id}
                    className={cn(!template.enabled && 'opacity-50')}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {template.name}
                        </CardTitle>
                        <Badge
                          variant={template.enabled ? 'success' : 'secondary'}
                        >
                          {template.enabled ? '启用' : '禁用'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-xs">标题</Label>
                        <p className="text-sm">{template.title}</p>
                      </div>
                      <div>
                        <Label className="text-xs">描述</Label>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setTemplateDialogOpen(true);
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const templates = config.templates.filter(
                              (t) => t.id !== template.id
                            );
                            setConfig({ ...config, templates });
                            saveConfig();
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 配置管理标签页 */}
        <TabsContent value="config">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 奖励配置 */}
            <Card>
              <CardHeader>
                <CardTitle>奖励配置</CardTitle>
                <CardDescription>配置分享奖励规则</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>首次分享奖励（积分）</Label>
                  <Input
                    type="number"
                    value={config.rewards.firstShare}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rewards: {
                          ...config.rewards,
                          firstShare: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>每次点击奖励（积分）</Label>
                  <Input
                    type="number"
                    value={config.rewards.perClick}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rewards: {
                          ...config.rewards,
                          perClick: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>每次转化奖励（积分）</Label>
                  <Input
                    type="number"
                    value={config.rewards.perConversion}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rewards: {
                          ...config.rewards,
                          perConversion: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* 限制配置 */}
            <Card>
              <CardHeader>
                <CardTitle>限制配置</CardTitle>
                <CardDescription>配置分享限制规则</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>每日分享次数</Label>
                  <Input
                    type="number"
                    value={config.limits.dailyShares}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limits: {
                          ...config.limits,
                          dailyShares: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>冷却时间（分钟）</Label>
                  <Input
                    type="number"
                    value={config.limits.cooldownMinutes}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limits: {
                          ...config.limits,
                          cooldownMinutes: Number.parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>每日最大奖励（积分）</Label>
                  <Input
                    type="number"
                    value={config.limits.maxRewardPerDay}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        limits: {
                          ...config.limits,
                          maxRewardPerDay: Number.parseInt(e.target.value),
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

      {/* 点击详情对话框 */}
      <Dialog open={clicksDialogOpen} onOpenChange={setClicksDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>点击详情</DialogTitle>
            <DialogDescription>
              分享ID: {selectedShare?.shareId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <DataTable
              columns={clickColumns}
              data={shareClicks}
              loading={false}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClicksDialogOpen(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 模板编辑对话框 */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.id ? '编辑' : '添加'}分享模板
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>模板名称</Label>
              <Input
                value={selectedTemplate?.name || ''}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>分享标题</Label>
              <Input
                value={selectedTemplate?.title || ''}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    title: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>分享描述</Label>
              <Textarea
                value={selectedTemplate?.description || ''}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>分享图片URL</Label>
              <Input
                value={selectedTemplate?.image || ''}
                onChange={(e) =>
                  setSelectedTemplate({
                    ...selectedTemplate,
                    image: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTemplateDialogOpen(false);
                setSelectedTemplate(null);
              }}
            >
              取消
            </Button>
            <Button onClick={saveTemplate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
