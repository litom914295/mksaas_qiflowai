import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DailySigninHandler } from '@/components/layout/daily-signin-handler';
import { Navbar } from '@/components/layout/navbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { PropsWithChildren } from 'react';

/**
 * inspired by dashboard-01
 * https://ui.shadcn.com/blocks
 */
export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 自动签到处理器 */}
      <DailySigninHandler />

      {/* 全局导航栏 */}
      <Navbar scroll={false} />

      {/* 侧边栏和内容区域 */}
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
        className="flex-1"
      >
        <DashboardSidebar variant="inset" />

        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
