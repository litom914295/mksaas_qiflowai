import { getDb } from '@/db';
import { qiflowReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

// 确保这是一个动态路由
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportV22Page({ params }: { params: Promise<{ reportId: string }> }) {
  try {
    const { reportId } = await params;
    
    console.log('[Report V2-2 Page] ===== START =====');
    console.log('[Report V2-2 Page] Loading report:', reportId);
    console.log('[Report V2-2 Page] Timestamp:', new Date().toISOString());
    
    const session = await getSession();
    console.log('[Report V2-2 Page] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id?.substring(0, 8) || 'none'
    });
    
    if (!session?.user?.id) {
      console.log('[Report V2-2 Page] No session, redirecting to login');
      redirect(`/login?callbackUrl=/reports/${reportId}/v2-2`);
    }

    console.log('[Report V2-2 Page] Fetching from database...');
    const db = await getDb();
    const [report] = await db
      .select()
      .from(qiflowReports)
      .where(and(eq(qiflowReports.id, reportId), eq(qiflowReports.userId, session.user.id)))
      .limit(1);

    console.log('[Report V2-2 Page] Query result:', {
      found: !!report,
      reportId: report?.id?.substring(0, 8) || 'none',
      status: report?.status || 'none'
    });

    if (!report) {
      console.log('[Report V2-2 Page] Report not found - calling notFound()');
      notFound();
    }
    
    console.log('[Report V2-2 Page] Rendering iframe...');
    console.log('[Report V2-2 Page] ===== END =====');

    return (
      <div className="w-full h-[calc(100vh-80px)]">
        <div className="px-4 py-3 flex items-center justify-between border-b">
          <div className="text-sm text-muted-foreground">专业报告 v2-2 预览 · #{reportId.slice(0, 8)}</div>
          <div className="flex gap-2">
            <a
              href={`/api/reports/${reportId}/v2-2`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 border rounded hover:bg-muted text-sm"
            >
              在新窗口打开
            </a>
            <a
              href={`/api/reports/${reportId}/v2-2`}
              download={`v2-2_${reportId}.html`}
              className="px-3 py-1.5 border rounded hover:bg-muted text-sm"
            >
              导出HTML
            </a>
          </div>
        </div>
        <iframe
          src={`/api/reports/${reportId}/v2-2`}
          className="w-full h-full"
          sandbox="allow-scripts allow-same-origin allow-popups allow-top-navigation-by-user-activation"
        />
      </div>
    );
  } catch (error) {
    console.error('[Report V2-2 Page] ===== ERROR =====');
    console.error('[Report V2-2 Page] Error details:', error);
    console.error('[Report V2-2 Page] Stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}
