import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import { adaptToFrontend } from '@/lib/qiflow/unified/adapters/frontend-adapter';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    // 使用统一分析引擎
    const engine = new UnifiedFengshuiEngine();
    const observationDate = observedAt ? new Date(observedAt) : new Date();

    // 构建默认的八字信息（由于该 API 不处理个人信息）
    const defaultBazi = {
      birthYear: observationDate.getFullYear(),
      birthMonth: 1,
      birthDay: 1,
      gender: 'male' as const,
    };

    // 构建符合 UnifiedAnalysisInput 类型的参数
    const unifiedResult = await engine.analyze({
      bazi: defaultBazi,
      house: {
        facing: direction,
        buildYear: observationDate.getFullYear(),
        period: ((Math.floor((observationDate.getFullYear() - 1864) / 20) % 9) + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
      },
      time: {
        currentYear: observationDate.getFullYear(),
        currentMonth: observationDate.getMonth() + 1,
        currentDay: observationDate.getDate(),
      },
      options: {
        includeLiunian: true,
        includePersonalization: false, // 该 API 不启用个性化分析
        includeTigua: true,
        includeLingzheng: true,
        includeChengmenjue: true,
        depth: 'comprehensive',
        config: {
          applyTiGua: true,
          applyFanGua: true,
          evaluationProfile: 'standard',
        },
      },
    });

    // 使用适配器转换为前端格式
    const result = adaptToFrontend(unifiedResult);

    // 计算置信度（基于统一评分）
    const confidence = Math.min(
      0.95,
      unifiedResult.assessment.overallScore / 100
    );

    // 格式化返回结果
    const formattedResult = {
      address,
      direction: `${direction}度`,
      houseType: houseType || '未指定',
      ...result.basicAnalysis,
      overallAssessment: result.overallAssessment,
      smartRecommendations: result.smartRecommendations,
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
        details: error instanceof Error ? error.message : String(error),
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
