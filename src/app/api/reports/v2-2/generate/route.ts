import { getDb } from '@/db';
import { qiflowReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { generateFullReportV22 } from '@/lib/report/report-generator-v2.2';
import { renderReportHtmlV22 } from '@/lib/report/v2-2';
import { type NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log('[Generate v2-2] Request received at', new Date().toISOString());
  
  // 获取语言前缀（从 referer）
  const referer = req.headers.get('referer') || '';
  const localeMatch = referer.match(/\/(zh-CN|en|ja|ko|es|fr|de)\//); 
  const locale = localeMatch ? localeMatch[1] : 'zh-CN';
  
  console.log('[Generate v2-2] Detected locale:', locale);
  
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      console.log('[Generate v2-2] Unauthorized');
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
    }
    
    console.log('[Generate v2-2] User:', session.user.id);

    const body = await req.json();
    const {
      personal,
      house,
      userContext,
    }: {
      personal: { name: string; gender: 'male' | 'female'; birthDate: string; birthTime?: string; birthCity?: string };
      house?: { direction?: string; directionDegree?: number };
      userContext?: Record<string, unknown>;
    } = body || {};

    const baziInput = {
      name: personal?.name || '用户',
      gender: personal?.gender || 'male',
      date: personal?.birthDate || '2000-01-01',
      time: personal?.birthTime || '00:00',
      city: personal?.birthCity || '',
    };
    const fengshuiInput = house || {};
    
    console.log('[Generate v2-2] Generating report with input:', { baziInput, hasFengshui: !!house });

    // 1) 生成 v2-2 报告对象
    const reportGenStart = Date.now();
    const report = await generateFullReportV22(baziInput as any, fengshuiInput as any, userContext || {});
    console.log(`[Generate v2-2] Report generated in ${Date.now() - reportGenStart}ms`);

    // 2) 渲染 HTML
    const renderStart = Date.now();
    const html = renderReportHtmlV22(report);
    console.log(`[Generate v2-2] HTML rendered in ${Date.now() - renderStart}ms, length: ${html.length}`);

    // 3) 写入数据库
    const dbStart = Date.now();
    const db = await getDb();
    console.log(`[Generate v2-2] DB connection obtained in ${Date.now() - dbStart}ms`);
    
    const creditsUsed = house ? 20 : 10;
    const now = new Date();

    const insertStart = Date.now();
    const [row] = await db
      .insert(qiflowReports)
      .values({
        userId: session.user.id,
        reportType: house ? 'essential' : 'basic',
        status: 'completed',
        input: {
          birthInfo: {
            date: baziInput.date,
            time: baziInput.time,
            location: baziInput.city,
            gender: baziInput.gender,
          },
        },
        output: {
          v2_2: true,
          version: 'v2-2',
          html,
        } as any,
        creditsUsed,
        generatedAt: now as any,
        expiresAt: null as any,
        metadata: {
          aiModel: 'local-v2-2',
          generationTimeMs: 0,
          aiCostUSD: 0,
          purchaseMethod: 'credits',
        } as any,
      })
      .returning();

    console.log(`[Generate v2-2] Report inserted in ${Date.now() - insertStart}ms, ID: ${row.id}`);
    
    // 验证数据已经可以查询
    const [verifyRow] = await db
      .select()
      .from(qiflowReports)
      .where(and(eq(qiflowReports.id, row.id), eq(qiflowReports.userId, session.user.id)))
      .limit(1);
    
    if (!verifyRow) {
      console.error('[Generate v2-2] Verification failed - report not found after insert');
      throw new Error('Report verification failed');
    }
    
    console.log('[Generate v2-2] Report verified, status:', verifyRow.status);

    // 返回不带语言前缀的 URL，让 next-intl 路由器自动处理
    const viewUrl = `/reports/${row.id}/v2-2`;
    
    const totalTime = Date.now() - startTime;
    console.log(`[Generate v2-2] Total request time: ${totalTime}ms`);
    console.log('[Generate v2-2] Returning URL (without locale):', viewUrl);
    console.log('[Generate v2-2] Router will add locale prefix automatically');

    return NextResponse.json({ success: true, reportId: row.id, viewUrl });
  } catch (e: any) {
    console.error('[Generate v2-2] Error:', e);
    return NextResponse.json({ success: false, error: e?.message || 'generate_failed' }, { status: 500 });
  }
}
