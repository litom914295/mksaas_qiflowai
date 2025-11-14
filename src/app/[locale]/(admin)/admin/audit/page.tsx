'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Info, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

// 审计日志类型
interface AuditLog {
  id: string;
  userId: string;
  userEmail: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  description: string;
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  } | null;
  status: 'success' | 'failed' | 'warning';
  errorMessage: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  method: string | null;
  path: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 操作类型选项
const ACTION_OPTIONS = [
  { value: 'USER_CREATE', label: '创建用户' },
  { value: 'USER_UPDATE', label: '更新用户' },
  { value: 'USER_DELETE', label: '删除用户' },
  { value: 'USER_BLOCK', label: '封禁用户' },
  { value: 'USER_UNBLOCK', label: '解封用户' },
  { value: 'USER_ASSIGN_ROLE', label: '分配角色' },
  { value: 'USER_REVOKE_ROLE', label: '撤销角色' },
  { value: 'ROLE_CREATE', label: '创建角色' },
  { value: 'ROLE_UPDATE', label: '更新角色' },
  { value: 'ROLE_DELETE', label: '删除角色' },
  { value: 'ROLE_ASSIGN_PERMISSION', label: '分配权限' },
  { value: 'ROLE_REVOKE_PERMISSION', label: '撤销权限' },
  { value: 'CREDIT_ADJUST', label: '调整积分' },
  { value: 'CREDIT_PURCHASE', label: '购买积分' },
  { value: 'CREDIT_REFUND', label: '退款积分' },
];

// 资源类型选项
const RESOURCE_OPTIONS = [
  { value: 'USER', label: '用户' },
  { value: 'ROLE', label: '角色' },
  { value: 'PERMISSION', label: '权限' },
  { value: 'CREDIT', label: '积分' },
  { value: 'ORDER', label: '订单' },
  { value: 'CONTENT', label: '内容' },
  { value: 'CONFIG', label: '配置' },
  { value: 'AUTH', label: '认证' },
];

// 状态选项
const STATUS_OPTIONS = [
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' },
  { value: 'warning', label: '警告' },
];

import { useToast } from '@/hooks/use-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 筛选条件
  const [keyword, setKeyword] = useState('');
  const [action, setAction] = useState<string>('');
  const [resource, setResource] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 详情弹窗
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // 加载审计日志
  const fetchLogs = async (page: number = pagination.page) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (keyword) params.set('keyword', keyword);
      if (action) params.set('action', action);
      if (resource) params.set('resource', resource);
      if (status) params.set('status', status);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(
        `/api/admin/audit/logs?${params.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
        setPagination(result.data.pagination);
      } else {
        toast({
          title: '加载失败',
          description: result.error || '无法加载审计日志',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast({
        title: '加载失败',
        description: '网络错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchLogs(1);
  }, []);

  // 搜索
  const handleSearch = () => {
    fetchLogs(1);
  };

  // 重置筛选
  const handleReset = () => {
    setKeyword('');
    setAction('');
    setResource('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setTimeout(() => fetchLogs(1), 0);
  };

  // 翻页
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchLogs(newPage);
    }
  };

  // 查看详情
  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  // 状态徽章样式
  const getStatusBadge = (logStatus: string) => {
    const variants = {
      success: 'default' as const,
      failed: 'destructive' as const,
      warning: 'secondary' as const,
    };
    const labels = {
      success: '成功',
      failed: '失败',
      warning: '警告',
    };
    return (
      <Badge
        variant={variants[logStatus as keyof typeof variants] || 'default'}
      >
        {labels[logStatus as keyof typeof labels] || logStatus}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">审计日志</h1>

      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 关键词搜索 */}
          <div>
            <label
              htmlFor="keyword-search"
              className="text-sm font-medium mb-1 block"
            >
              关键词搜索
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="keyword-search"
                placeholder="邮箱或操作描述"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 操作类型 */}
          <div>
            <label
              htmlFor="action-select"
              className="text-sm font-medium mb-1 block"
            >
              操作类型
            </label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="全部操作" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部操作</SelectItem>
                {ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 资源类型 */}
          <div>
            <label
              htmlFor="resource-select"
              className="text-sm font-medium mb-1 block"
            >
              资源类型
            </label>
            <Select value={resource} onValueChange={setResource}>
              <SelectTrigger>
                <SelectValue placeholder="全部资源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部资源</SelectItem>
                {RESOURCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 状态 */}
          <div>
            <label
              htmlFor="status-select"
              className="text-sm font-medium mb-1 block"
            >
              状态
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 开始日期 */}
          <div>
            <label
              htmlFor="start-date"
              className="text-sm font-medium mb-1 block"
            >
              开始日期
            </label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* 结束日期 */}
          <div>
            <label
              htmlFor="end-date"
              className="text-sm font-medium mb-1 block"
            >
              结束日期
            </label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            搜索
          </Button>
          <Button variant="outline" onClick={handleReset}>
            重置
          </Button>
        </div>
      </div>

      {/* 日志表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>时间</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>操作</TableHead>
              <TableHead>资源</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>IP地址</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  暂无审计日志
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium truncate max-w-[150px]">
                        {log.userEmail || log.userId}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {log.userId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{log.resource}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {log.description}
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {log.ipAddress || '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(log)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 分页 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-600">
              共 {pagination.total} 条记录,第 {pagination.page} /{' '}
              {pagination.totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>审计日志详情</DialogTitle>
            <DialogDescription>查看完整的审计日志信息</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    用户ID
                  </div>
                  <div className="text-sm mt-1">{selectedLog.userId}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    用户邮箱
                  </div>
                  <div className="text-sm mt-1">
                    {selectedLog.userEmail || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    操作类型
                  </div>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedLog.action}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    资源类型
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary">{selectedLog.resource}</Badge>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    资源ID
                  </div>
                  <div className="text-sm mt-1">
                    {selectedLog.resourceId || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">状态</div>
                  <div className="mt-1">
                    {getStatusBadge(selectedLog.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    IP地址
                  </div>
                  <div className="text-sm mt-1">
                    {selectedLog.ipAddress || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">时间</div>
                  <div className="text-sm mt-1">
                    {new Date(selectedLog.createdAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  操作描述
                </div>
                <div className="text-sm bg-gray-50 p-3 rounded">
                  {selectedLog.description}
                </div>
              </div>

              {/* 请求信息 */}
              {(selectedLog.method || selectedLog.path) && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    请求信息
                  </div>
                  <div className="text-sm bg-gray-50 p-3 rounded space-y-1">
                    {selectedLog.method && (
                      <div>方法: {selectedLog.method}</div>
                    )}
                    {selectedLog.path && <div>路径: {selectedLog.path}</div>}
                    {selectedLog.userAgent && (
                      <div className="truncate">
                        UA: {selectedLog.userAgent}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 错误信息 */}
              {selectedLog.errorMessage && (
                <div>
                  <div className="text-sm font-medium text-red-600 mb-1">
                    错误信息
                  </div>
                  <div className="text-sm bg-red-50 text-red-700 p-3 rounded">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}

              {/* 变更记录 */}
              {selectedLog.changes && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    变更记录
                  </div>
                  <div className="space-y-3">
                    {selectedLog.changes.before && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          修改前:
                        </div>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                    )}
                    {selectedLog.changes.after && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-1">
                          修改后:
                        </div>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
