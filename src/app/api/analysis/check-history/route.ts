import { getSession } from '@/lib/server';
import { getDb } from '@/db';
import { baziCalculations, fengshuiAnalysis } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();

    // 检查八字分析记录
    const [baziCount] = await db
      .select({ count: count() })
      .from(baziCalculations)
      .where(eq(baziCalculations.userId, session.user.id));

    // 检查风水分析记录
    const [fengshuiCount] = await db
      .select({ count: count() })
      .from(fengshuiAnalysis)
      .where(eq(fengshuiAnalysis.userId, session.user.id));

    return NextResponse.json({
      success: true,
      hasAnalysis: {
        bazi: (baziCount?.count || 0) > 0,
        fengshui: (fengshuiCount?.count || 0) > 0,
      },
    });
  } catch (error) {
    console.error('Check analysis history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check history' },
      { status: 500 }
    );
  }
}
