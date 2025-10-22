import { AdminHeader } from '@/components/admin/layout/admin-header';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';
import { getSession } from '@/lib/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 检查用户权限
  const session = await getSession();
  const currentUser = session?.user;

  // 只允许管理员访问
  if (!currentUser?.id || currentUser.role !== 'admin') {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 管理后台布局 */}
      <div className="flex h-screen overflow-hidden">
        {/* 侧边栏 */}
        <AdminSidebar locale={locale} />

        {/* 主内容区 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 顶部导航 */}
          <AdminHeader user={currentUser} locale={locale} />

          {/* 内容区域 */}
          <main className="flex-1 overflow-y-auto bg-muted/10">
            <div className="container mx-auto p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
