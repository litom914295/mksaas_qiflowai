import { getDb } from '@/db';
import { qiflowReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const db = await getDb();
    const [report] = await db
      .select()
      .from(qiflowReports)
      .where(and(eq(qiflowReports.id, params.reportId), eq(qiflowReports.userId, session.user.id)))
      .limit(1);

    if (!report || report.status !== 'completed') {
      return new NextResponse('Not Found', { status: 404 });
    }

    const html = (report.output as any)?.html as string;
    if (!html) {
      return new NextResponse('No content', { status: 404 });
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, max-age=0, no-store',
      },
    });
  } catch (e) {
    return new NextResponse('Server Error', { status: 500 });
  }
}