'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/admin/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Upload,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Mail,
  RefreshCw
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: 'active' | 'inactive' | 'banned';
  credits: number;
  referralCode: string;
  referredBy: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  _count?: {
    referrals: number;
    transactions: number;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '获取用户列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter]);

  // 删除用户
  const handleDeleteUser = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '删除成功',
          description: `用户 ${user.email} 已被删除`,
        });
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // 更改用户状态
  const handleStatusChange = async (userId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '状态更新成功',
          description: `用户状态已更新为 ${status}`,
        });
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '状态更新失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 批量操作
  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast({
        title: '请选择用户',
        description: '请先选择要操作的用户',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userIds: selectedUsers,
          action 
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: '批量操作成功',
          description: `已对 ${selectedUsers.length} 个用户执行 ${action} 操作`,
        });
        setSelectedUsers([]);
        fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '批量操作失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 定义表格列
  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
    },
    {
      accessorKey: 'email',
      header: '邮箱',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: '姓名',
      cell: ({ row }) => row.original.name || '-',
    },
    {
      accessorKey: 'role',
      header: '角色',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: '状态',
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = 
          status === 'active' ? 'default' :
          status === 'inactive' ? 'secondary' :
          'destructive';
        
        return (
          <Badge variant={variant}>
            {status === 'active' ? '活跃' :
             status === 'inactive' ? '未激活' : '已封禁'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'credits',
      header: '积分',
      cell: ({ row }) => (
        <span className="font-mono">{row.original.credits}</span>
      ),
    },
    {
      accessorKey: 'referrals',
      header: '推荐人数',
      cell: ({ row }) => (
        <span>{row.original._count?.referrals || 0}</span>
      ),
    },
    {
      accessorKey: 'lastLogin',
      header: '最后登录',
      cell: ({ row }) => {
        const date = row.original.lastLogin;
        return date 
          ? format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN })
          : '-';
      },
    },
    {
      accessorKey: 'createdAt',
      header: '注册时间',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return format(new Date(date), 'yyyy-MM-dd', { locale: zhCN });
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>用户操作</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/users/${user.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                编辑用户
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/users/${user.id}/permissions`)}
              >
                <Shield className="mr-2 h-4 w-4" />
                权限管理
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(user.id, 'active')}
                disabled={user.status === 'active'}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                激活用户
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusChange(user.id, 'banned')}
                disabled={user.status === 'banned'}
              >
                <UserX className="mr-2 h-4 w-4" />
                封禁用户
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setUserToDelete(user);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除用户
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>用户管理</CardTitle>
              <CardDescription>管理系统中的所有用户账号</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/users/import')}
              >
                <Upload className="mr-2 h-4 w-4" />
                导入用户
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                <Download className="mr-2 h-4 w-4" />
                导出用户
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/admin/users/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                新建用户
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选栏 */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="搜索用户邮箱、姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="角色筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有角色</SelectItem>
                <SelectItem value="superadmin">超级管理员</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="operator">运营人员</SelectItem>
                <SelectItem value="user">普通用户</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">未激活</SelectItem>
                <SelectItem value="banned">已封禁</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={fetchUsers}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* 批量操作栏 */}
          {selectedUsers.length > 0 && (
            <div className="flex gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
                已选择 {selectedUsers.length} 个用户
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('activate')}
              >
                批量激活
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('ban')}
              >
                批量封禁
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600"
              >
                批量删除
              </Button>
            </div>
          )}

          {/* 用户列表表格 */}
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            onRowSelectionChange={(rows) => {
              setSelectedUsers(rows.map(r => r.original.id));
            }}
          />
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除用户 <strong>{userToDelete?.email}</strong> 吗？
              此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}