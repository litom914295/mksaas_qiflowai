'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  BarChart3,
  BookOpen,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  Gift,
  LayoutDashboard,
  LineChart,
  PieChart,
  Settings,
  Share2,
  Shield,
  ShieldAlert,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminMainPage() {
  const router = useRouter();

  const adminModules = [
    {
      category: '数据概览',
      modules: [
        {
          icon: <LayoutDashboard className="h-6 w-6" />,
          title: '仪表板',
          description: '系统核心数据概览',
          path: '/zh-CN/admin/dashboard',
          badge: '实时',
          color: 'bg-blue-500',
        },
        {
          icon: <BarChart3 className="h-6 w-6" />,
          title: '数据分析',
          description: '深度数据分析报表',
          path: '/zh-CN/admin/analytics/dashboard',
          color: 'bg-purple-500',
        },
      ],
    },
    {
      category: '增长运营',
      modules: [
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: '增长仪表板',
          description: 'K因子、留存率、激活率监控',
          path: '/zh-CN/admin/operations/growth/dashboard',
          badge: '核心',
          color: 'bg-green-500',
        },
        {
          icon: <CreditCard className="h-6 w-6" />,
          title: '积分管理',
          description: '积分发放、消耗、余额管理',
          path: '/zh-CN/admin/operations/growth/credits',
          color: 'bg-yellow-500',
        },
        {
          icon: <UserPlus className="h-6 w-6" />,
          title: '推荐系统',
          description: '推荐链、奖励发放、转化追踪',
          path: '/zh-CN/admin/operations/growth/referrals',
          badge: '重要',
          color: 'bg-indigo-500',
        },
        {
          icon: <Share2 className="h-6 w-6" />,
          title: '分享激励',
          description: '分享记录、转化统计、奖励管理',
          path: '/zh-CN/admin/operations/growth/shares',
          color: 'bg-pink-500',
        },
        {
          icon: <ShieldAlert className="h-6 w-6" />,
          title: '反欺诈监控',
          description: '风控规则、异常检测、黑名单管理',
          path: '/zh-CN/admin/operations/growth/fraud',
          badge: '安全',
          color: 'bg-red-500',
        },
      ],
    },
    {
      category: '用户与内容',
      modules: [
        {
          icon: <Users className="h-6 w-6" />,
          title: '用户管理',
          description: '用户列表、权限、状态管理',
          path: '/zh-CN/admin/users',
          color: 'bg-cyan-500',
        },
        {
          icon: <FileText className="h-6 w-6" />,
          title: '内容管理',
          description: '文章、资源、SEO配置',
          path: '/zh-CN/admin/content',
          color: 'bg-orange-500',
        },
      ],
    },
    {
      category: '系统管理',
      modules: [
        {
          icon: <BookOpen className="h-6 w-6" />,
          title: '文档中心',
          description: '系统文档、API文档、操作手册',
          path: '/zh-CN/admin/docs',
          badge: '文档',
          color: 'bg-teal-500',
        },
        {
          icon: <Settings className="h-6 w-6" />,
          title: '系统设置',
          description: '全局配置、邮件、支付设置',
          path: '/zh-CN/admin/settings',
          color: 'bg-gray-500',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎯 MKSaaS 超级管理后台
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          完整的系统管理与运营工具集
        </p>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">今日活跃</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-sm opacity-90">+12.5%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">积分消耗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <p className="text-sm opacity-90">+8.3%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">推荐转化</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-sm opacity-90">+2.1%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">风控拦截</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-sm opacity-90">-15.2%</p>
          </CardContent>
        </Card>
      </div>

      {/* 功能模块 */}
      {adminModules.map((category, idx) => (
        <div key={idx} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            {category.category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.modules.map((module, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                onClick={() => router.push(module.path)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-lg ${module.color} bg-opacity-10`}
                    >
                      <div
                        className={`${module.color} bg-opacity-100 text-white rounded-lg p-2`}
                      >
                        {module.icon}
                      </div>
                    </div>
                    {module.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* 底部提示 */}
      <div className="mt-12 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">需要帮助？</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              查看文档中心了解详细的使用说明，或联系技术支持
            </p>
          </div>
          <div className="space-x-2">
            <Badge variant="outline">v1.0.0</Badge>
            <Badge variant="outline" className="text-green-600">
              系统正常
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
