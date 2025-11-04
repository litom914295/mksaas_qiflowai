'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  BarChart,
  CreditCard,
  Database,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AdminWelcome() {
  const router = useRouter();

  const adminFeatures = [
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: '用户管理',
      description: '管理系统用户、角色和权限',
      action: () => router.push('/zh-CN/admin-protected/users'),
    },
    {
      icon: <CreditCard className="h-8 w-8 text-green-500" />,
      title: '积分管理',
      description: '查看和管理用户积分余额',
      action: () => router.push('/zh-CN/settings/credits'),
    },
    {
      icon: <BarChart className="h-8 w-8 text-purple-500" />,
      title: '数据分析',
      description: '查看系统运营数据和报表',
      action: () => router.push('/zh-CN/admin-protected/metrics'),
    },
    {
      icon: <Settings className="h-8 w-8 text-gray-500" />,
      title: '系统设置',
      description: '配置系统参数和功能',
      action: () => router.push('/zh-CN/settings/profile'),
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
      title: '安全设置',
      description: '管理系统安全和权限策略',
      action: () => router.push('/zh-CN/settings/security'),
    },
    {
      icon: <Database className="h-8 w-8 text-indigo-500" />,
      title: '数据库状态',
      description: '查看数据库连接和性能',
      action: () => console.log('数据库状态'),
    },
    {
      icon: <Activity className="h-8 w-8 text-orange-500" />,
      title: '系统监控',
      description: '实时监控系统运行状态',
      action: () => console.log('系统监控'),
    },
    {
      icon: <Package className="h-8 w-8 text-teal-500" />,
      title: '订阅管理',
      description: '管理用户订阅和套餐',
      action: () => router.push('/zh-CN/settings/billing'),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🎉 欢迎来到 QiFlow AI 管理后台
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          您已成功登录管理员账户，可以管理整个系统
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminFeatures.map((feature, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={feature.action}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                {feature.icon}
              </div>
              <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="text-xl">系统状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">当前用户</p>
              <p className="font-semibold">admin@qiflowai.com</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">用户角色</p>
              <p className="font-semibold text-green-600">超级管理员</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">系统版本</p>
              <p className="font-semibold">v1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">运行状态</p>
              <p className="font-semibold text-green-600">正常运行</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>提示：</strong>
          这是管理后台的主页。您可以点击上面的卡片快速访问各个管理功能。
        </p>
      </div>
    </div>
  );
}
