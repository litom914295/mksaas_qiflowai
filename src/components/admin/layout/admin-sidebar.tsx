'use client';

import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  DollarSign,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Share2,
  Shield,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  locale: string;
}

const menuItems = [
  {
    title: '概览',
    items: [
      { icon: LayoutDashboard, label: '仪表板', href: '/admin/dashboard' },
    ],
  },
  {
    title: '用户管理',
    items: [
      { icon: Users, label: '用户列表', href: '/admin/users' },
      { icon: Shield, label: '角色权限', href: '/admin/users/roles' },
    ],
  },
  {
    title: '内容管理',
    items: [
      { icon: FileText, label: '文章管理', href: '/admin/content/posts' },
      { icon: Package, label: '分类标签', href: '/admin/content/categories' },
    ],
  },
  {
    title: '运营管理',
    items: [
      { icon: Target, label: '增长看板', href: '/admin/metrics' },
      { icon: Share2, label: '推荐管理', href: '/admin/operations/referrals' },
      { icon: TrendingUp, label: '分享管理', href: '/admin/operations/shares' },
      {
        icon: DollarSign,
        label: '积分管理',
        href: '/admin/operations/credits',
      },
      { icon: Shield, label: '风控管理', href: '/admin/operations/fraud' },
      { icon: Package, label: '订单管理', href: '/admin/operations/orders' },
      {
        icon: MessageSquare,
        label: '消息中心',
        href: '/admin/operations/messages',
      },
    ],
  },
  {
    title: '数据分析',
    items: [
      { icon: BarChart3, label: '数据看板', href: '/admin/analytics' },
      { icon: FileText, label: '报表管理', href: '/admin/analytics/reports' },
    ],
  },
  {
    title: '系统设置',
    items: [
      { icon: Settings, label: '系统配置', href: '/admin/settings' },
      { icon: Shield, label: '审计日志', href: '/admin/settings/audit' },
      { icon: BookOpen, label: '文档中心', href: '/admin/docs' },
    ],
  },
];

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-background md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href={`/${locale}/admin/dashboard`}
          className="flex items-center space-x-2"
        >
          <span className="text-xl font-bold">管理后台</span>
        </Link>
      </div>

      {/* 菜单 */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const fullHref = `/${locale}${item.href}`;
                const isActive =
                  pathname === fullHref || pathname.startsWith(fullHref + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={fullHref}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* 底部信息 */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">版本 v5.1.1</div>
      </div>
    </aside>
  );
}
