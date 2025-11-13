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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  Calendar,
  Download,
  Eye,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface BaziStats {
  total: number;
  today: number;
  thisMonth: number;
  lastMonth: number;
  uniqueUsers: number;
  monthlyGrowth: string;
  trend: Array<{ date: string; count: number }>;
}

interface BaziRecord {
  id: string;
  userId: string;
  input: any;
  result: any;
  createdAt: string;
  userName: string | null;
  userEmail: string | null;
  userCredits: number;
}

export default function BaziManagementPage() {
  const [stats, setStats] = useState<BaziStats | null>(null);
  const [records, setRecords] = useState<BaziRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<BaziRecord | null>(null);

  // 加载统计数据
  useEffect(() => {
    fetchStats();
  }, []);

  // 加载分析记录
  useEffect(() => {
    fetchRecords();
  }, [page, search]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/qiflow/bazi?type=stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'list',
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/admin/qiflow/bazi?${params}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data.records);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error('加载分析记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchRecords();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBirthInfo = (input: any) => {
    if (!input) return '-';
    const { year, month, day, hour, gender } = input;
    return `${year}年${month}月${day}日 ${hour || '未知'}时 ${gender === 'male' ? '男' : '女'}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">八字分析管理</h1>
        <p className="text-muted-foreground">
          查看和管理所有八字测算记录,监控分析质量和用户行为
        </p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总分析数</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                今日新增 {stats.today}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月分析</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">
                较上月 {stats.monthlyGrowth}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">独立用户</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">
                使用过八字分析的用户
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">增长趋势</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.trend[stats.trend.length - 1]?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">最近一日</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 趋势图表 */}
      {stats && stats.trend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最近7天分析趋势</CardTitle>
            <CardDescription>每日八字分析数量统计</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end space-x-2">
              {stats.trend.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-amber-500 rounded-t"
                    style={{
                      height: `${(item.count / Math.max(...stats.trend.map((t) => t.count))) * 180}px`,
                      minHeight: '10px',
                    }}
                  />
                  <div className="text-xs mt-2 text-muted-foreground">
                    {item.date.split('-')[2]}
                  </div>
                  <div className="text-xs font-semibold">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>分析记录列表</CardTitle>
          <CardDescription>查看所有八字分析详细记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索用户名或邮箱..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          </div>

          {/* 数据表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>出生信息</TableHead>
                  <TableHead>分析时间</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      加载中...
                    </TableCell>
                  </TableRow>
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.userName || '未知用户'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.userEmail || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatBirthInfo(record.input)}</TableCell>
                      <TableCell>{formatDate(record.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          已完成
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {total > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                共 {total} 条记录,第 {page} / {Math.ceil(total / pageSize)} 页
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(total / pageSize)}
                  onClick={() => setPage(page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 (简化版) */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedRecord(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>分析详情</CardTitle>
              <CardDescription>
                {formatDate(selectedRecord.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">用户信息</h3>
                <div className="text-sm space-y-1">
                  <div>姓名: {selectedRecord.userName || '未知'}</div>
                  <div>邮箱: {selectedRecord.userEmail || '-'}</div>
                  <div>积分余额: {selectedRecord.userCredits}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">出生信息</h3>
                <div className="text-sm">
                  {formatBirthInfo(selectedRecord.input)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">分析结果</h3>
                <div className="text-sm bg-muted p-4 rounded-md">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedRecord.result, null, 2)}
                  </pre>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setSelectedRecord(null)}
              >
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
