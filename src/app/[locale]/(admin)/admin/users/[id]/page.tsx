'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  CreditCard,
  FileText,
  Mail,
  Shield,
  TrendingUp,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  useEffect(() => {
    if (userId) {
      // 加载用户信息
      fetch(`/api/admin/users/${userId}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setData(result.data);
          }
        })
        .finally(() => setLoading(false));

      // 加载用户角色
      fetch(`/api/admin/users/${userId}/roles`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setUserRoles(result.data.roles);
          }
        });

      // 加载所有可用角色
      fetch('/api/admin/roles')
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setAvailableRoles(result.data);
          }
        });
    }
  }, [userId]);

  // 分配角色
  const handleAssignRole = async (roleId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('角色分配成功');
        setShowAssignDialog(false);
        // 重新加载角色列表
        fetch(`/api/admin/users/${userId}/roles`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success) {
              setUserRoles(result.data.roles);
            }
          });
      } else {
        toast.error(data.error || '分配失败');
      }
    } catch (error) {
      toast.error('分配角色失败');
    }
  };

  // 移除角色
  const handleRemoveRole = async (roleId: string) => {
    if (!confirm('确定要移除此角色吗?')) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/users/${userId}/roles?roleId=${roleId}`,
        {
          method: 'DELETE',
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('角色移除成功');
        // 重新加载角色列表
        fetch(`/api/admin/users/${userId}/roles`)
          .then((res) => res.json())
          .then((result) => {
            if (result.success) {
              setUserRoles(result.data.roles);
            }
          });
      } else {
        toast.error(data.error || '移除失败');
      }
    } catch (error) {
      toast.error('移除角色失败');
    }
  };

  if (loading) return <div className="p-6">加载中...</div>;
  if (!data) return <div className="p-6">用户不存在</div>;

  const { user, credit, transactions, analyses, referrals } = data;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/zh-CN/admin/users">
          <ArrowLeft className="h-6 w-6 cursor-pointer" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">用户详情</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              用户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              <strong>姓名:</strong> {user.name || '未设置'}
            </div>
            <div>
              <strong>邮箱:</strong> {user.email}
            </div>
            <div>
              <strong>注册:</strong>{' '}
              {new Date(user.createdAt).toLocaleDateString('zh-CN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-yellow-500" />
              积分余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {credit?.currentCredits || 0}
            </div>
            <p className="text-xs text-muted-foreground">积分</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              分析记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses.length}</div>
            <p className="text-xs text-muted-foreground">次</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-500" />
              推荐用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.given.length}</div>
            <p className="text-xs text-muted-foreground">位</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>积分交易记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    暂无交易记录
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm">
                      {new Date(tx.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.type}</Badge>
                    </TableCell>
                    <TableCell
                      className={
                        tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.description || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>分析历史</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    暂无分析记录
                  </TableCell>
                </TableRow>
              ) : (
                analyses.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      {new Date(a.createdAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {a.type === 'bazi'
                          ? '八字'
                          : a.type === 'xuankong'
                            ? '玄空'
                            : a.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 角色管理 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            角色管理
          </CardTitle>
          <Button onClick={() => setShowAssignDialog(true)} size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            分配角色
          </Button>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              该用户还没有分配任何角色
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>角色名称</TableHead>
                  <TableHead>标识</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>分配时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((role: any) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {role.displayName}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {role.name}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(role.assignedAt).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveRole(role.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {referrals.given.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>推荐的用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {referrals.given.map((ref: any) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium">
                      {ref.referredName || '未知用户'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ref.referredEmail}
                    </div>
                  </div>
                  <Badge
                    variant={
                      ref.status === 'activated' ? 'default' : 'secondary'
                    }
                  >
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分配角色对话框 */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分配角色</DialogTitle>
            <DialogDescription>为用户 {user.name} 分配角色</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableRoles.filter(
              (r) => !userRoles.some((ur) => ur.id === r.id)
            ).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                没有可分配的角色
              </div>
            ) : (
              availableRoles
                .filter((r) => !userRoles.some((ur) => ur.id === r.id))
                .map((role: any) => (
                  <div
                    key={role.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => handleAssignRole(role.id)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{role.displayName}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.description || '-'}
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {role.name}
                      </code>
                    </div>
                    <Button size="sm" variant="ghost">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
