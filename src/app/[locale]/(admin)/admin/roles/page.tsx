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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Key, Plus, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  displayName: string;
  category: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
  });

  // 加载角色列表
  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('加载角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载权限列表
  const loadPermissions = async () => {
    try {
      const res = await fetch('/api/admin/permissions');
      const data = await res.json();
      if (data.success) {
        setPermissions(data.data.all);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  // 创建角色
  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('角色创建成功');
        setShowCreateDialog(false);
        setFormData({ name: '', displayName: '', description: '' });
        loadRoles();
      } else {
        toast.error(data.error || '创建失败');
      }
    } catch (error) {
      toast.error('创建角色失败');
    }
  };

  // 更新角色
  const handleUpdate = async () => {
    if (!selectedRole) return;

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRole.id,
          displayName: formData.displayName,
          description: formData.description,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('角色更新成功');
        setShowEditDialog(false);
        setSelectedRole(null);
        loadRoles();
      } else {
        toast.error(data.error || '更新失败');
      }
    } catch (error) {
      toast.error('更新角色失败');
    }
  };

  // 删除角色
  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      toast.error('系统角色不能删除');
      return;
    }

    if (!confirm(`确定要删除角色"${role.displayName}"吗?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/roles?id=${role.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('角色删除成功');
        loadRoles();
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch (error) {
      toast.error('删除角色失败');
    }
  };

  // 打开权限管理对话框
  const handleManagePermissions = async (role: Role) => {
    setSelectedRole(role);

    // 加载角色的当前权限
    try {
      const res = await fetch(`/api/admin/roles/${role.id}/permissions`);
      const data = await res.json();
      if (data.success) {
        setSelectedPermissions(
          data.data.permissions.map((p: Permission) => p.id)
        );
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }

    setShowPermissionsDialog(true);
  };

  // 保存权限分配
  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      const res = await fetch(
        `/api/admin/roles/${selectedRole.id}/permissions`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            permissionIds: selectedPermissions,
          }),
        }
      );
      const data = await res.json();

      if (data.success) {
        toast.success('权限分配成功');
        setShowPermissionsDialog(false);
        loadRoles();
      } else {
        toast.error(data.error || '分配失败');
      }
    } catch (error) {
      toast.error('分配权限失败');
    }
  };

  // 切换权限选择
  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  // 按分类分组权限
  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* 页头 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            角色管理
          </h1>
          <p className="text-muted-foreground mt-2">管理系统角色和权限</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          创建角色
        </Button>
      </div>

      {/* 角色表格 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>角色名称</TableHead>
              <TableHead>标识</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>权限数量</TableHead>
              <TableHead>类型</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
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
                <TableCell>{role.permissionCount}</TableCell>
                <TableCell>
                  {role.isSystem ? (
                    <Badge variant="secondary">系统角色</Badge>
                  ) : (
                    <Badge variant="outline">自定义</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleManagePermissions(role)}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedRole(role);
                        setFormData({
                          name: role.name,
                          displayName: role.displayName,
                          description: role.description || '',
                        });
                        setShowEditDialog(true);
                      }}
                      disabled={role.isSystem}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(role)}
                      disabled={role.isSystem}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 创建角色对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新角色</DialogTitle>
            <DialogDescription>创建一个新的系统角色</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>角色标识 *</Label>
              <Input
                placeholder="例如: content_manager"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>显示名称 *</Label>
              <Input
                placeholder="例如: 内容管理员"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                placeholder="角色描述..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleCreate}>创建</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>修改角色信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>显示名称 *</Label>
              <Input
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleUpdate}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 权限分配对话框 */}
      <Dialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>管理权限 - {selectedRole?.displayName}</DialogTitle>
            <DialogDescription>为角色分配权限</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <div key={category}>
                <h3 className="font-semibold mb-3">{category}</h3>
                <div className="space-y-2">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        disabled={selectedRole?.isSystem}
                        className="h-4 w-4"
                      />
                      <span className="flex-1">{perm.displayName}</span>
                      <code className="text-xs text-muted-foreground">
                        {perm.name}
                      </code>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowPermissionsDialog(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleSavePermissions}
                disabled={selectedRole?.isSystem}
              >
                保存权限
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
