import { getDb } from '@/db';
import { qiflowReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { renderReportHtmlV22 } from '@/lib/report/v2-2';
import type { ReportOutputV22 } from '@/types/report-v2-2';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// 确保这是一个动态 API 路由
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_: NextRequest, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  
  console.log('[API v2-2] Fetching report:', reportId);

  try {
    const session = await getSession();
    if (!session?.user?.id) {
      console.log('[API v2-2] Unauthorized access attempt');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    console.log('[API v2-2] User authenticated:', session.user.id);

    const db = await getDb();
    const [report] = await db
      .select()
      .from(qiflowReports)
      .where(and(eq(qiflowReports.id, reportId), eq(qiflowReports.userId, session.user.id)))
      .limit(1);

    if (!report) {
      console.log('[API v2-2] Report not found:', reportId, 'for user:', session.user.id);
      return new NextResponse('Report not found', { status: 404 });
    }
    
    console.log('[API v2-2] Report found, processing output...');

    // 兼容两种存储结构：
    // 1) output.html 直接存HTML
    // 2) output 为 ReportOutputV22 结构，需渲染
    let html: string | null = null;

    const out: any = report.output;
    if (out && typeof out === 'object' && typeof out.html === 'string') {
      console.log('[API v2-2] Using pre-rendered HTML');
      html = out.html as string;
    } else {
      console.log('[API v2-2] Rendering report data to HTML');
      const reportData = (typeof report.output === 'string'
        ? JSON.parse(report.output)
        : report.output) as ReportOutputV22;
      html = renderReportHtmlV22(reportData);
    }
    
    console.log('[API v2-2] HTML generated, length:', html?.length || 0);

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
