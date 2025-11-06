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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Search,
} from 'lucide-react';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { useMemo } from 'react';

type CreditTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
};

type TransactionsResponse = {
  items: CreditTransaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function EnhancedTransactionHistory() {
  // URL状态管理
  const [{ page, pageSize, search, type, sortBy, sortOrder }, setQueryStates] =
    useQueryStates({
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      search: parseAsString.withDefault(''),
      type: parseAsString.withDefault('all'),
      sortBy: parseAsStringLiteral([
        'createdAt',
        'amount',
      ] as const).withDefault('createdAt'),
      sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault(
        'desc'
      ),
    });

  // 获取交易数据
  const { data, isLoading, error } = useQuery<TransactionsResponse>({
    queryKey: ['credit-transactions', page, pageSize, search, type, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(type !== 'all' && { type }),
        sortBy,
        sortOrder,
      });
      const response = await fetch(`/api/credits/transactions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
  });

  // 交易类型映射
  const typeLabels: Record<string, { label: string; color: string }> = {
    DAILY_SIGNIN: { label: '每日签到', color: 'bg-orange-100 text-orange-800' },
    PURCHASE: { label: '购买积分', color: 'bg-green-100 text-green-800' },
    BAZI_ANALYSIS: { label: '八字分析', color: 'bg-purple-100 text-purple-800' },
    FENGSHUI_ANALYSIS: { label: '风水分析', color: 'bg-amber-100 text-amber-800' },
    AI_CHAT: { label: 'AI对话', color: 'bg-blue-100 text-blue-800' },
    PDF_EXPORT: { label: 'PDF导出', color: 'bg-pink-100 text-pink-800' },
    REFERRAL: { label: '推荐奖励', color: 'bg-cyan-100 text-cyan-800' },
    ADMIN_ADJUST: { label: '系统调整', color: 'bg-gray-100 text-gray-800' },
  };

  // 导出CSV功能
  const handleExport = () => {
    if (!data?.items) return;
    
    const csv = [
      ['时间', '类型', '描述', '金额', '余额变化'].join(','),
      ...data.items.map((tx) =>
        [
          format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          typeLabels[tx.type]?.label || tx.type,
          tx.description,
          tx.amount,
          tx.amount > 0 ? `+${tx.amount}` : tx.amount,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `交易记录_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  // 计算统计数据
  const stats = useMemo(() => {
    if (!data?.items) return { income: 0, expense: 0 };
    return data.items.reduce(
      (acc, tx) => {
        if (tx.amount > 0) acc.income += tx.amount;
        else acc.expense += Math.abs(tx.amount);
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [data?.items]);

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          加载交易记录失败，请稍后重试
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>交易记录</CardTitle>
            <CardDescription>
              共 {data?.total || 0} 条记录 · 收入 {stats.income} · 支出 {stats.expense}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!data?.items?.length}>
            <Download className="mr-2 h-4 w-4" />
            导出CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 筛选工具栏 */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索描述..."
              value={search}
              onChange={(e) =>
                setQueryStates({ search: e.target.value, page: 1 })
              }
              className="pl-10"
            />
          </div>
          <Select
            value={type}
            onValueChange={(value) => setQueryStates({ type: value, page: 1 })}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="交易类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="DAILY_SIGNIN">每日签到</SelectItem>
              <SelectItem value="PURCHASE">购买积分</SelectItem>
              <SelectItem value="BAZI_ANALYSIS">八字分析</SelectItem>
              <SelectItem value="FENGSHUI_ANALYSIS">风水分析</SelectItem>
              <SelectItem value="AI_CHAT">AI对话</SelectItem>
              <SelectItem value="PDF_EXPORT">PDF导出</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={(value) => {
              const [newSortBy, newSortOrder] = value.split('-') as [
                'createdAt' | 'amount',
                'asc' | 'desc'
              ];
              setQueryStates({ sortBy: newSortBy, sortOrder: newSortOrder });
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="排序" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">最新优先</SelectItem>
              <SelectItem value="createdAt-asc">最早优先</SelectItem>
              <SelectItem value="amount-desc">金额从高到低</SelectItem>
              <SelectItem value="amount-asc">金额从低到高</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 交易表格 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>描述</TableHead>
                <TableHead className="text-right">金额</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(tx.createdAt), 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={typeLabels[tx.type]?.color || 'bg-gray-100'}
                      >
                        {typeLabels[tx.type]?.label || tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      <div
                        className={`flex items-center justify-end gap-1 ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowUpIcon className="h-3 w-3" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3" />
                        )}
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    暂无交易记录
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页控制 */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              第 {page} 页，共 {data.totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) =>
                  setQueryStates({ pageSize: parseInt(value), page: 1 })
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10条/页</SelectItem>
                  <SelectItem value="20">20条/页</SelectItem>
                  <SelectItem value="50">50条/页</SelectItem>
                  <SelectItem value="100">100条/页</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQueryStates({ page: page - 1 })}
                  disabled={page <= 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQueryStates({ page: page + 1 })}
                  disabled={page >= data.totalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
