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
  Eye,
  Home,
  Map,
  Search,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FengshuiManagementPage() {
  const [stats, setStats] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [analysisType, setAnalysisType] = useState('all');

  useEffect(() => {
    fetch('/api/admin/qiflow/fengshui?type=stats')
      .then((res) => res.json())
      .then((data) => data.success && setStats(data.data));
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [page, analysisType]);

  const fetchRecords = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      type: 'list',
      page: page.toString(),
      pageSize: '20',
    });
    if (search) params.set('search', search);
    if (analysisType !== 'all') params.set('analysisType', analysisType);

    fetch(`/api/admin/qiflow/fengshui?${params}`)
      .then((res) => res.json())
      .then((data) => data.success && setRecords(data.data.records))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">风水分析管理</h1>
        <p className="text-muted-foreground">玄空风水和户型分析记录管理</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">玄空风水</CardTitle>
              <Home className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.xuankongTotal}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">户型分析</CardTitle>
              <Map className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.floorplanTotal}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">今日分析</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">独立用户</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>分析记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="搜索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="xuankong">玄空</SelectItem>
                <SelectItem value="floorplan">户型</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchRecords}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>类型</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    加载中...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge
                        variant={
                          r.type === 'xuankong' ? 'default' : 'secondary'
                        }
                      >
                        {r.type === 'xuankong' ? '玄空风水' : '户型分析'}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.userName || r.userEmail}</TableCell>
                    <TableCell>
                      {new Date(r.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
