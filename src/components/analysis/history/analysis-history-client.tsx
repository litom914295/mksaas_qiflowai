'use client';

/**
 * 分析历史客户端组件
 * 显示用户的分析记录列表，支持筛选、搜索、导出等功能
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { AnalysisHistory } from '@/db/schema/analysis';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  MoreHorizontalIcon,
  SearchIcon,
  StarIcon,
  TrashIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type AnalysisType = 'all' | 'bazi' | 'fengshui';

type AnalysisHistoryClientProps = {};

export function AnalysisHistoryClient({}: AnalysisHistoryClientProps) {
  const t = (key: string) => key;
  const [records, setRecords] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AnalysisType>('all');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    hasMore: false,
  });

  // 获取分析记录
  const fetchRecords = useCallback(
    async (append = false) => {
      try {
        setLoading(!append);
        const params = new URLSearchParams({
          limit: pagination.limit.toString(),
          offset: append ? pagination.offset.toString() : '0',
          ...(searchQuery && { search: searchQuery }),
          ...(filterType !== 'all' && { type: filterType }),
        });

        const response = await fetch(`/api/analysis/history?${params}`, {
          credentials: 'include',
        });
        if (response.status === 401) {
          // 未登录：清空数据并退出
          setRecords([]);
          setPagination((prev) => ({
            ...prev,
            offset: 0,
            total: 0,
            hasMore: false,
          }));
          return;
        }
        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(
            `Failed to fetch records: ${response.status} ${errText}`
          );
        }

        const result = await response.json();

        if (append) {
          setRecords((prev) => [...prev, ...result.data]);
        } else {
          setRecords(result.data);
        }

        setPagination((prev) => ({
          ...prev,
          offset: append
            ? prev.offset + result.data.length
            : result.data.length,
          total: result.pagination.total,
          hasMore: result.pagination.hasMore,
        }));
      } catch (error) {
        console.error('Failed to fetch analysis records:', error);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, filterType, pagination.limit, pagination.offset]
  );

  // 初始加载
  useEffect(() => {
    fetchRecords();
  }, []);

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination((prev) => ({ ...prev, offset: 0 }));
      fetchRecords();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterType]);

  // 加载更多
  const loadMore = () => {
    fetchRecords(true);
  };

  // 导出记录
  const exportRecords = async () => {
    // TODO: 实现导出功能
    console.log('Export records');
  };

  // 删除记录
  const deleteRecord = async (id: string) => {
    if (!confirm('确定要删除这条分析记录吗？')) return;

    try {
      const response = await fetch(`/api/analysis/history/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecords((prev) => prev.filter((record) => record.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  // 格式化日期
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取分析类型徽章
  const getTypeBadge = (record: AnalysisHistory) => {
    const hasBazi = record.baziResult;
    const hasFengshui = record.fengshuiResult;

    if (hasBazi && hasFengshui) {
      return <Badge variant="default">综合分析</Badge>;
    }
    if (hasBazi) {
      return <Badge variant="secondary">八字命理</Badge>;
    }
    if (hasFengshui) {
      return <Badge variant="outline">风水分析</Badge>;
    }
    return <Badge variant="destructive">未知类型</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* 搜索和筛选栏 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索分析记录..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as AnalysisType)}
          >
            <SelectTrigger className="w-[180px]">
              <FilterIcon className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="bazi">八字命理</SelectItem>
              <SelectItem value="fengshui">风水分析</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={exportRecords}
            disabled={records.length === 0}
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            {t('export')}
          </Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.total')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.thisMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                records.filter(
                  (r) =>
                    new Date(r.createdAt).getMonth() === new Date().getMonth()
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('stats.favorites')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.filter((r) => r.shareCount && r.shareCount > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 记录列表 */}
      <div className="space-y-4">
        {loading && records.length === 0 ? (
          // 骨架屏
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : records.length === 0 ? (
          // 空状态
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">暂无分析记录</p>
                <p className="text-sm mt-1">您还没有进行过分析，快来开始吧！</p>
                <Button className="mt-4" asChild>
                  <a href="/analysis/bazi">开始分析</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // 记录列表
          records.map((record) => (
            <Card
              key={record.id}
              className="group hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{record.name || '未命名'}</h3>
                    {getTypeBadge(record)}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontalIcon className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`/analysis/history/${record.id}`}>
                          <EyeIcon className="w-4 h-4 mr-2" />
                          查看
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <StarIcon className="w-4 h-4 mr-2" />
                        收藏
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        导出
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => deleteRecord(record.id)}
                      >
                        <TrashIcon className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  {record.birthDate && (
                    <p>
                      出生日期: {record.birthDate} {record.birthTime}
                    </p>
                  )}
                  {record.location && <p>位置: {record.location}</p>}
                  {record.houseAddress && <p>地址: {record.houseAddress}</p>}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {record.aiEnhancedAnalysis && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {record.aiEnhancedAnalysis.slice(0, 120)}...
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>{formatDate(record.createdAt)}</span>
                    {(record.viewCount ?? 0) > 0 ? (
                      <span>浏览: {record.viewCount}</span>
                    ) : null}
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/analysis/history/${record.id}`}>查看详情</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 加载更多按钮 */}
      {pagination.hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? '加载中...' : '加载更多'}
          </Button>
        </div>
      )}
    </div>
  );
}
