import { consumeCreditsAction } from '@/actions/consume-credits';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { auth } from '@/lib/auth';
import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import { adaptToFrontend } from '@/lib/qiflow/unified/adapters/frontend-adapter';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 请求参数验证Schema
const CompleteRequestSchema = z.object({
  personal: z.object({
    name: z.string().min(1, '姓名不能为空'),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
    birthTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式错误'),
    gender: z.enum(['male', 'female']),
    birthCity: z.string().optional(),
    calendarType: z.enum(['solar', 'lunar']).default('solar'),
  }),
  house: z.object({
    direction: z.string().min(1, '房屋朝向不能为空'),
    roomCount: z.string().min(1, '房间数量不能为空'),
    layoutImage: z.string().nullable().optional(),
    standardLayout: z.string().optional(),
  }),
});

type CompleteRequest = z.infer<typeof CompleteRequestSchema>;

/**
 * 完整分析API（八字 + 风水）- 扣除30积分
 * POST /api/qiflow/complete-unified
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: '请先登录',
          needsLogin: true,
        },
        { status: 401 }
      );
    }

    // 2. 解析和验证请求参数
    const body = await req.json();
    const parsed = CompleteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { personal, house } = parsed.data;

    // 3. 检查积分余额
    const REQUIRED_CREDITS = 30;
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

    // 4. 扣除积分
    const consumeResult = await consumeCreditsAction({
      amount: REQUIRED_CREDITS,
      description: `完整分析（八字+风水） - ${personal.name}`,
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

    // 5. 调用八字分析引擎
    // TODO: 集成实际的八字分析引擎
    const baziAnalysisResult = {
      bazi: {
        year: { gan: '甲', zhi: '子' },
        month: { gan: '丙', zhi: '寅' },
        day: { gan: '戊', zhi: '辰' },
        hour: { gan: '庚', zhi: '申' },
      },
      wuxing: {
        wood: 2,
        fire: 2,
        earth: 2,
        metal: 1,
        water: 1,
        analysis: '五行较为平衡，略缺金水',
        favorableElement: '金', // 喜用神
        unfavorableElement: '火', // 忌神
      },
      personality: {
        summary: '性格稳重，做事踏实，善于思考',
        strengths: ['责任心强', '有条理', '善于分析'],
        weaknesses: ['有时过于谨慎', '决断力需提升'],
      },
    };

    // 6. 调用风水统一引擎
    const engine = new UnifiedFengshuiEngine();
    const direction = Number.parseFloat(house.direction);
    const observationDate = new Date();
    const birthDate = new Date(`${personal.birthDate}T${personal.birthTime}`);

    // 构建符合 UnifiedAnalysisInput 类型的参数
    const unifiedResult = await engine.analyze({
      bazi: {
        birthYear: birthDate.getFullYear(),
        birthMonth: birthDate.getMonth() + 1,
        birthDay: birthDate.getDate(),
        birthHour: birthDate.getHours(),
        gender: personal.gender,
        // 从八字分析结果提取五行信息
        favorableElements: [baziAnalysisResult.wuxing.favorableElement as any],
        unfavorableElements: [
          baziAnalysisResult.wuxing.unfavorableElement as any,
        ],
      },
      house: {
        facing: direction,
        buildYear: observationDate.getFullYear(),
        period: ((Math.floor((observationDate.getFullYear() - 1864) / 20) % 9) +
          1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
      },
      time: {
        currentYear: observationDate.getFullYear(),
        currentMonth: observationDate.getMonth() + 1,
        currentDay: observationDate.getDate(),
      },
      options: {
        includeLiunian: true,
        includePersonalization: true, // 启用个性化分析
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

    // 7. 使用适配器转换为前端格式
    const fengshuiResult = adaptToFrontend(unifiedResult);

    // 8. 整合八字和风水，生成个性化建议
    const personalizedAdvice = {
      roomRecommendations:
        fengshuiResult.personalizedAnalysis?.roomRecommendations || [],
      careerEnhancement:
        fengshuiResult.personalizedAnalysis?.careerEnhancement || '',
      healthAndWellness:
        fengshuiResult.personalizedAnalysis?.healthAndWellness || '',
      wealthAndProsperity:
        fengshuiResult.personalizedAnalysis?.wealthAndProsperity || '',
      relationshipHarmony:
        fengshuiResult.personalizedAnalysis?.relationshipHarmony || '',
    };

    // 9. 月度运势预测（结合八字和流年）
    const liunianForecast = fengshuiResult.liunianAnalysis?.yearlyTrends || [];
    const monthlyForecast = generateMonthlyForecast(
      baziAnalysisResult,
      liunianForecast
    );

    // 10. 返回完整分析结果
    return NextResponse.json({
      success: true,
      data: {
        // 八字分析
        bazi: baziAnalysisResult,

        // 风水分析
        fengshui: {
          basicAnalysis: fengshuiResult.basicAnalysis,
          enhancedPlate: fengshuiResult.enhancedPlate,
          liunianAnalysis: fengshuiResult.liunianAnalysis,
        },

        // 个性化建议（八字+风水结合）
        personalized: personalizedAdvice,

        // 房间布局建议
        roomAdvice:
          fengshuiResult.personalizedAnalysis?.roomRecommendations || [],

        // 月度运势
        monthlyForecast,

        // 综合评估
        overallAssessment: fengshuiResult.overallAssessment,

        // 智能推荐
        smartRecommendations: fengshuiResult.smartRecommendations,

        // 元数据
        creditsUsed: REQUIRED_CREDITS,
        analysisDate: new Date().toISOString(),
        inputData: {
          personal,
          house,
        },
      },
      message: '完整分析完成',
    });
  } catch (error) {
    console.error('完整分析API错误:', error);
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

/**
 * 生成月度运势预测（结合八字和流年飞星）
 */
function generateMonthlyForecast(baziAnalysis: any, fengshuiForecast: any[]) {
  // 简化版：直接返回风水预测，后续可以添加八字流年的影响
  return fengshuiForecast.map((month: any) => ({
    ...month,
    baziInfluence: {
      favorableElement: baziAnalysis.wuxing.favorableElement,
      advice: `本月宜多使用${baziAnalysis.wuxing.favorableElement}元素物品`,
    },
  }));
}

/**
 * GET 方法 - 返回API信息
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'complete-unified',
    version: '1.0.0',
    methods: ['POST'],
    requiredCredits: 30,
    description:
      '完整的八字命理和玄空风水综合分析，包含个性化建议、房间布局、月度运势等',
  });
}
