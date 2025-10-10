import { computeBaziWithCache } from '@/lib/cache/bazi-cache';
import { type EnhancedBirthData, computeBaziSmart } from '@/lib/qiflow/bazi';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const RequestSchema = z.object({
  name: z.string().min(1).max(50),
  birthDate: z.string().min(1),
  gender: z.enum(['male', 'female']).optional(),
  timezone: z.string().optional().default('Asia/Shanghai'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证请求数据
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    // 准备增强型八字输入数据
    const enhancedBirthData: EnhancedBirthData = {
      datetime: parsed.data.birthDate,
      gender: parsed.data.gender || 'male',
      timezone: parsed.data.timezone,
      isTimeKnown: true,
      preferredLocale: 'zh-CN',
    };

    // 使用带缓存的八字计算
    const result = await computeBaziWithCache(
      {
        datetime: enhancedBirthData.datetime,
        gender: enhancedBirthData.gender,
        timezone: enhancedBirthData.timezone,
      },
      async () => computeBaziSmart(enhancedBirthData)
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to compute bazi' },
        { status: 500 }
      );
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
  // 健康检查端点
  return NextResponse.json({
    status: 'ok',
    endpoint: 'bazi',
    version: '1.0.0',
    methods: ['POST'],
  });
}
