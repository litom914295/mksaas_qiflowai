import { getDb } from '@/db';
import { qiflowReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { and, eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';

export default async function ReportV22Page({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const session = await getSession();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/reports/${reportId}/v2-2`);

  const db = await getDb();
  const [report] = await db
    .select()
    .from(qiflowReports)
    .where(and(eq(qiflowReports.id, reportId), eq(qiflowReports.userId, session.user.id)))
    .limit(1);

  if (!report) notFound();

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
}
