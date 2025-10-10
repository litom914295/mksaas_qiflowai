import { consumeCreditsAction } from '@/actions/consume-credits';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 请求参数验证Schema
const BaziRequestSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式错误'),
  gender: z.enum(['male', 'female'], {
    message: '性别必须为男或女',
  }),
  birthCity: z.string().optional(),
  calendarType: z.enum(['solar', 'lunar']).default('solar'),
});

type BaziRequest = z.infer<typeof BaziRequestSchema>;

/**
 * 八字分析API - 扣除10积分
 * POST /api/qiflow/bazi-unified
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
    const parsed = BaziRequestSchema.safeParse(body);

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

    const { name, birthDate, birthTime, gender, birthCity, calendarType } =
      parsed.data;

    // 3. 检查积分余额
    const REQUIRED_CREDITS = 10;
    const balanceResult = await getCreditBalanceAction();

    if (!balanceResult?.data || !balanceResult.data.success || (balanceResult.data.credits ?? 0) < REQUIRED_CREDITS) {
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

    // 5. 调用八字分析引擎
    // TODO: 集成实际的八字分析引擎
    // 暂时返回模拟数据
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
      },
      personality: {
        summary: '性格稳重，做事踏实，善于思考',
        strengths: ['责任心强', '有条理', '善于分析'],
        weaknesses: ['有时过于谨慎', '决断力需提升'],
      },
      career: {
        suitable: ['管理', '金融', '教育', '技术'],
        direction: '适合从事需要分析和决策的工作',
        timing: '本年度事业运势平稳，下半年有突破机会',
      },
      wealth: {
        overall: '财运中等偏上',
        advice: '正财稳定，偏财需谨慎，适合稳健投资',
        timing: '农历三、六、九、十二月为财运高峰',
      },
      health: {
        concerns: ['注意肠胃健康', '适度运动', '保持作息规律'],
        advice: '加强锻炼，注意饮食，定期体检',
      },
      relationships: {
        love: '感情运势平稳，单身者有桃花机会',
        family: '家庭和睦，与长辈关系融洽',
        friends: '人际关系良好，贵人运佳',
      },
    };

    // 6. 返回分析结果
    return NextResponse.json({
      success: true,
      data: {
        ...baziAnalysisResult,
        creditsUsed: REQUIRED_CREDITS,
        analysisDate: new Date().toISOString(),
        inputData: {
          name,
          birthDate,
          birthTime,
          gender,
          birthCity,
          calendarType,
        },
      },
      message: '八字分析完成',
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

/**
 * GET 方法 - 返回API信息
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'bazi-unified',
    version: '1.0.0',
    methods: ['POST'],
    requiredCredits: 10,
    description:
      '基于八字四柱的命理分析，包含性格、事业、财运、健康等方面的详细解读',
  });
}
