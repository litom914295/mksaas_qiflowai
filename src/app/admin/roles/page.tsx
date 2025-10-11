'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  Users,
  Save,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  _count?: {
    users: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 权限分类
const permissionCategories = {
  user: '用户管理',
  role: '角色管理',
  content: '内容管理',
  finance: '财务管理',
  system: '系统管理',
  analytics: '数据分析',
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  // 获取角色列表
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      
      if (data.success) {
        setRoles(data.roles);
        setPermissions(data.permissions);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '获取角色列表失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // 打开编辑对话框
  const handleEdit = (role: Role) => {
    setCurrentRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
    });
    setDialogOpen(true);
  };

  // 打开新建对话框
  const handleCreate = () => {
    setCurrentRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setDialogOpen(true);
  };

  // 保存角色
  const handleSave = async () => {
    try {
      const url = currentRole 
        ? `/api/admin/roles/${currentRole.id}`
        : '/api/admin/roles';
      
      const method = currentRole ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: currentRole ? '更新成功' : '创建成功',
          description: `角色 ${formData.name} 已${currentRole ? '更新' : '创建'}`,
        });
        setDialogOpen(false);
        fetchRoles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 删除角色
  const handleDelete = async () => {
    if (!currentRole) return;

    try {
      const res = await fetch(`/api/admin/roles/${currentRole.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: '删除成功',
          description: `角色 ${currentRole.name} 已删除`,
        });
        setDeleteDialogOpen(false);
        setCurrentRole(null);
        fetchRoles();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    }
  };

  // 切换权限选择
  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  // 按分类分组权限
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>角色管理</CardTitle>
              <CardDescription>管理系统角色和权限分配</CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              新建角色
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>权限数量</TableHead>
                <TableHead>用户数量</TableHead>
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
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    暂无角色数据
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {role.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role.permissions.length} 个权限
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{role._count?.users || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentRole(role);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={role.name === 'superadmin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建/编辑角色对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {currentRole ? '编辑角色' : '创建角色'}
            </DialogTitle>
            <DialogDescription>
              设置角色的基本信息和权限
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">角色名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：admin, operator"
                disabled={currentRole?.name === 'superadmin'}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">角色描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="描述该角色的职责和权限范围"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>权限分配</Label>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="mb-3 text-sm font-medium">
                        {permissionCategories[category as keyof typeof permissionCategories] || '其他'}
                      </h4>
                      <div className="space-y-2">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start space-x-3 py-2"
                          >
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                              disabled={currentRole?.name === 'superadmin'}
                            />
                            <div className="flex-1 space-y-1">
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium cursor-pointer"
                              >
                                {permission.name}
                              </label>
                              <p className="text-xs text-gray-500">
                                {permission.key} - {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              <X className="mr-2 h-4 w-4" />
              取消
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除角色 <strong>{currentRole?.name}</strong> 吗？
              该角色下有 {currentRole?._count?.users || 0} 个用户，删除后这些用户将失去该角色的权限。
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
              onClick={handleDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}