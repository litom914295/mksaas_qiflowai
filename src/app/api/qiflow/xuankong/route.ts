import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateFlyingStar, type GenerateFlyingStarInput } from '@/lib/qiflow/xuankong';

const RequestSchema = z.object({
  address: z.string().min(1).max(200),
  direction: z.coerce.number().min(0).max(360),
  houseType: z.string().optional(),
  observedAt: z.string().optional(),
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

    const { address, direction, houseType, observedAt } = parsed.data;

    // 使用真实的玄空风水算法
    const analysisInput: GenerateFlyingStarInput = {
      observedAt: observedAt ? new Date(observedAt) : new Date(),
      facing: {
        degrees: direction,
      },
      config: {
        toleranceDeg: 3,
        applyTiGua: true,
        applyFanGua: true,
        enableAdvancedAnalysis: true,
      },
    };

    const result = await generateFlyingStar(analysisInput);

    // 计算置信度
    const gejuStrength = result.geju?.isFavorable ? 0.7 : 0.4;
    const rulesCount = result.meta.rulesApplied.length;
    const confidence = Math.min(0.95, gejuStrength + rulesCount * 0.1);

    // 格式化返回结果
    const formattedResult = {
      address,
      direction: `${direction}度`,
      houseType: houseType || '未指定',
      period: result.period,
      plates: result.plates,
      evaluation: result.evaluation,
      geju: result.geju,
      wenchangwei: result.wenchangwei,
      caiwei: result.caiwei,
      meta: result.meta,
    };

    return NextResponse.json({
      success: true,
      data: formattedResult,
      confidence: Number(confidence.toFixed(2)),
      creditsUsed: 20,
    });
  } catch (error) {
    console.error('Xuankong API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'xuankong',
    version: '1.0.0',
    methods: ['POST'],
  });
}
