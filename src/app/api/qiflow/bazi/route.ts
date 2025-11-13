import { getDb } from '@/db';
import { baziCalculations } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { type EnhancedBirthData, computeBaziSmart } from '@/lib/bazi';
import { computeBaziWithCache } from '@/lib/cache/bazi-cache';
import { tryMarkActivation } from '@/lib/growth/activation';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  name: z.string().min(1).max(50),
  birthDate: z.string().min(1),
  gender: z.enum(['male', 'female']).optional(),
  timezone: z.string().optional().default('Asia/Shanghai'),
  longitude: z.number().min(-180).max(180).optional(),
  latitude: z.number().min(-90).max(90).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const enhancedBirthData: EnhancedBirthData = {
      datetime: parsed.data.birthDate,
      gender: parsed.data.gender || 'male',
      timezone: parsed.data.timezone || 'Asia/Shanghai',
      isTimeKnown: true,
      preferredLocale: 'zh-CN',
      longitude: parsed.data.longitude,
      latitude: parsed.data.latitude,
    };

    const result = await computeBaziWithCache(
      {
        datetime: enhancedBirthData.datetime,
        gender: enhancedBirthData.gender,
        timezone: enhancedBirthData.timezone || 'Asia/Shanghai',
      },
      async () => {
        const computed = await computeBaziSmart(enhancedBirthData);
        if (!computed) {
          throw new Error('Failed to compute bazi');
        }
        return computed;
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to compute bazi' },
        { status: 500 }
      );
    }

    try {
      const auth = await verifyAuth(req as unknown as Request);
      if (auth?.authenticated && auth.userId) {
        const db = await getDb();
        await db.insert(baziCalculations).values({
          userId: auth.userId,
          input: {
            name: parsed.data.name,
            birthDate: parsed.data.birthDate,
            gender: parsed.data.gender || 'male',
            timezone: parsed.data.timezone || 'Asia/Shanghai',
            longitude: parsed.data.longitude,
            latitude: parsed.data.latitude,
          },
          result: result as any,
          creditsUsed: 10,
        });
        tryMarkActivation(auth.userId).catch(() => {});
      }
    } catch (e) {
      console.warn('bazi activation side-effect failed:', e);
    }

    return NextResponse.json({
      success: true,
      data: result,
      creditsUsed: 10,
    });
  } catch (error) {
    console.error('Bazi API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'bazi',
    version: '1.0.0',
    methods: ['POST'],
  });
}
