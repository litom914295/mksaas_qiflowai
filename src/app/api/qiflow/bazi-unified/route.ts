import { consumeCreditsAction } from '@/actions/consume-credits';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { getDb } from '@/db';
import { baziCalculations } from '@/db/schema';
import { auth } from '@/lib/auth';
import { type EnhancedBirthData, computeBaziSmart } from '@/lib/bazi';
import { buildLegacyBaziResponse } from '@/lib/bazi/legacy-response';
import { computeBaziWithCache } from '@/lib/cache/bazi-cache';
import { tryMarkActivation } from '@/lib/growth/activation';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BaziRequestSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式错误'),
  gender: z.enum(['male', 'female'], {
    message: '性别必须为男或女',
  }),
  birthCity: z.string().optional(),
  calendarType: z.enum(['solar', 'lunar']).default('solar'),
  longitude: z.number().min(-180, '经度不正确').max(180, '经度不正确').optional(),
  latitude: z.number().min(-90, '纬度必须正确').max(90, '纬度必须正确').optional(),
});

type BaziRequest = z.infer<typeof BaziRequestSchema>;

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    const isLoggedIn = !!session?.user;

    const body = await req.json();
    const parsed = BaziRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: '输入验证失败',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      name,
      birthDate,
      birthTime,
      gender,
      birthCity,
      calendarType,
      longitude,
      latitude,
    } = parsed.data;

    const REQUIRED_CREDITS = 10;
    let creditsUsed = 0;
    let isFreeTrial = false;

    if (isLoggedIn) {
      const balanceResult = await getCreditBalanceAction();

      if (
        !balanceResult?.data ||
        !balanceResult.data.success ||
        (balanceResult.data.credits ?? 0) < REQUIRED_CREDITS
      ) {
        return NextResponse.json(
          {
            success: false,
            error: '积分不足',
            needsCredits: true,
            required: REQUIRED_CREDITS,
            available: balanceResult?.data?.credits || 0,
          },
          { status: 402 }
        );
      }

      const consumeResult = await consumeCreditsAction({
        amount: REQUIRED_CREDITS,
        description: `八字分析 - ${name}`,
      });

      if (!consumeResult?.data?.success) {
        return NextResponse.json(
          {
            success: false,
            error: '积分扣除失败',
            details: consumeResult?.data?.error || '未知错误',
          },
          { status: 500 }
        );
      }

      creditsUsed = REQUIRED_CREDITS;
    } else {
      isFreeTrial = true;
    }

    const timezone = 'Asia/Shanghai';
    const datetime = `${birthDate}T${birthTime}:00`;

    const enhancedBirthData: EnhancedBirthData = {
      datetime,
      gender,
      timezone,
      isTimeKnown: true,
      preferredLocale: 'zh-CN',
      calendarType,
      longitude,
      latitude,
    };

    const analysisResult = await computeBaziWithCache(
      {
        datetime,
        gender,
        timezone,
      },
      async () => {
        const computed = await computeBaziSmart(enhancedBirthData);
        if (!computed) {
          throw new Error('未能获取有效的八字分析结果');
        }
        return computed;
      }
    );

    if (!analysisResult) {
      throw new Error('未能获取有效的八字分析结果');
    }

    if (isLoggedIn && session?.user?.id) {
      try {
        const db = await getDb();
        await db.insert(baziCalculations).values({
          userId: session.user.id,
          input: {
            name,
            birthDate,
            birthTime,
            gender,
            birthCity,
            calendarType,
            timezone,
          } as Record<string, unknown>,
          result: analysisResult as any,
          creditsUsed: creditsUsed || 0,
        });

        tryMarkActivation(session.user.id).catch(() => {});
      } catch (persistError) {
        console.warn('bazi unified persist failed:', persistError);
      }
    }

    const responseData = buildLegacyBaziResponse({
      analysis: analysisResult,
      metadata: {
        creditsUsed,
        isFreeTrial,
        analysisDate: new Date().toISOString(),
        inputData: {
          name,
          birthDate,
          birthTime,
          gender,
          birthCity,
          calendarType,
          longitude,
          latitude,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: responseData,
      message: isFreeTrial ? '八字分析完成（免费版）' : '八字分析完成',
    });
  } catch (error) {
    console.error('八字分析API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'bazi-unified',
    version: '2.0.0',
    description: 'Enhanced Bazi calculation with professional features',
    features: [
      'High-precision calculations',
      'Timezone-aware processing',
      'Luck pillars analysis',
      'Daily fortune analysis',
      'Ten Gods system',
      'Result caching',
    ],
  });
}
