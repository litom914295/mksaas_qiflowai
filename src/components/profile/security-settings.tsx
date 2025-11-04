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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Lock,
  Mail,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';

export default function SecuritySettings() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotification, setLoginNotification] = useState(true);

  // 修改密码对话框状态
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  // 安全项目状态
  const securityItems = [
    {
      id: 'password',
      title: '登录密码',
      description: '定期更新密码可以保障账户安全',
      status: 'active',
      icon: Lock,
      lastUpdate: '30天前',
      action: '修改密码',
    },
    {
      id: 'phone',
      title: '手机验证',
      description: '已绑定手机号 138****8888',
      status: 'active',
      icon: Smartphone,
      lastUpdate: '已绑定',
      action: '更换手机',
    },
    {
      id: 'email',
      title: '邮箱验证',
      description: '已绑定邮箱 zhang***@example.com',
      status: 'active',
      icon: Mail,
      lastUpdate: '已绑定',
      action: '更换邮箱',
    },
    {
      id: '2fa',
      title: '双因素认证',
      description: '启用后登录时需要额外验证码',
      status: twoFactorEnabled ? 'active' : 'inactive',
      icon: Key,
      lastUpdate: twoFactorEnabled ? '已启用' : '未启用',
      action: twoFactorEnabled ? '关闭' : '启用',
    },
  ];

  async function handlePasswordChange() {
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: '密码不匹配',
        description: '新密码与确认密码不一致',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: '密码修改成功',
        description: '请使用新密码重新登录',
      });

      setIsPasswordDialogOpen(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast({
        title: '修改失败',
        description: '请稍后重试',
        variant: 'destructive',
      });
    }
  }

  async function handleToggle2FA(enabled: boolean) {
    setTwoFactorEnabled(enabled);
    toast({
      title: enabled ? '双因素认证已启用' : '双因素认证已关闭',
      description: enabled ? '登录时将需要额外的验证码' : '已恢复常规登录方式',
    });
  }

  function getStatusBadge(status: string) {
    if (status === 'active') {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          正常
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
      >
        <AlertTriangle className="mr-1 h-3 w-3" />
        未启用
      </Badge>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-2 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">账户安全</CardTitle>
            <CardDescription>管理您的账户安全设置</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 安全评分 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-300">
                  安全评分
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  您的账户安全等级：良好
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">85/100</p>
              <p className="text-sm text-green-600">良好</p>
            </div>
          </div>
        </motion.div>

        {/* 安全项列表 */}
        <div className="space-y-3">
          {securityItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-lg p-2 ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-500'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.title}</p>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      最后更新：{item.lastUpdate}
                    </p>
                  </div>
                </div>
                {item.id === '2fa' ? (
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                  />
                ) : item.id === 'password' ? (
                  <Dialog
                    open={isPasswordDialogOpen}
                    onOpenChange={setIsPasswordDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        {item.action}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>修改登录密码</DialogTitle>
                        <DialogDescription>
                          为了您的账户安全，请定期更换密码
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">当前密码</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showPassword ? 'text' : 'password'}
                              value={passwordForm.current}
                              onChange={(e) =>
                                setPasswordForm((prev) => ({
                                  ...prev,
                                  current: e.target.value,
                                }))
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">新密码</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={passwordForm.new}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                new: e.target.value,
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            密码长度至少8位，包含字母、数字和符号
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">确认新密码</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordForm.confirm}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirm: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsPasswordDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handlePasswordChange}>确认修改</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" size="sm">
                    {item.action}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 登录通知 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">登录通知</p>
              <p className="mt-1 text-sm text-muted-foreground">
                新设备登录时通过邮件和短信提醒
              </p>
            </div>
            <Switch
              checked={loginNotification}
              onCheckedChange={setLoginNotification}
            />
          </div>
        </motion.div>

        {/* 登录历史 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button variant="link" className="w-full">
            查看登录历史记录 →
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
