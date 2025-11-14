import { getDb } from '@/db';
import { qiflowReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { renderReportHtmlV22 } from '@/lib/report/v2-2';
import type { ReportOutputV22 } from '@/types/report-v2-2';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;

  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = await getDb();
    const [report] = await db
      .select()
      .from(qiflowReports)
      .where(and(eq(qiflowReports.id, reportId), eq(qiflowReports.userId, session.user.id)))
      .limit(1);

    if (!report) {
      return new NextResponse('Report not found', { status: 404 });
    }

    // Parse report data
    const reportData = (typeof report.output === 'string'
      ? JSON.parse(report.output)
      : report.output) as ReportOutputV22;

    // Render as HTML
    const html = renderReportHtmlV22(reportData);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error retrieving v2-2 report:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
