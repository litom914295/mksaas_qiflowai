import { getDb } from '@/db';
import { qiflowReports } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { generateFullReportV22 } from '@/lib/report/report-generator-v2.2';
import { renderReportHtmlV22 } from '@/lib/report/v2-2';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
    }

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

    // 1) 生成 v2-2 报告对象
    const report = await generateFullReportV22(baziInput as any, fengshuiInput as any, userContext || {});

    // 2) 渲染 HTML
    const html = renderReportHtmlV22(report);

    // 3) 写入历史记录（计费依赖是否包含风水信息）
    const db = await getDb();
    const creditsUsed = house ? 20 : 10;
    const now = new Date();

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
          v2_2: true, // 保持向后兼容的标记
          version: 'v2-2', // 新版本标记
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

    // 使用新的 URL 路径
    const viewUrl = `/reports/${row.id}/v2-2`;

    return NextResponse.json({ success: true, reportId: row.id, viewUrl });
  } catch (e: any) {
    console.error('v2-2 generate error:', e);
    return NextResponse.json({ success: false, error: e?.message || 'generate_failed' }, { status: 500 });
  }
}
