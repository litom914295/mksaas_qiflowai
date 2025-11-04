import { consumeCreditsAction } from '@/actions/consume-credits';
import { auth } from '@/lib/auth';
import { evaluateXuankongAnalysis } from '@/lib/qiflow/xuankong-unified-engine';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 完整风水+八字统一分析 API
 * 费用: 30 积分
 * 要求: 用户必须登录
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 验证用户登录状态
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. 解析请求数据
    const body = await req.json();
    const { personalInfo, houseInfo } = body;

    // 3. 验证必填字段
    if (
      !personalInfo?.name ||
      !personalInfo?.birthDate ||
      !personalInfo?.gender
    ) {
      return NextResponse.json(
        { error: 'Missing required personal information fields.' },
        { status: 400 }
      );
    }

    if (!houseInfo?.address || !houseInfo?.direction || !houseInfo?.buildYear) {
      return NextResponse.json(
        { error: 'Missing required house information fields.' },
        { status: 400 }
      );
    }

    // 4. 检查并扣除积分（30积分）
    const REQUIRED_CREDITS = 30;
    const deductResult = await consumeCreditsAction({
      amount: REQUIRED_CREDITS,
      description: 'Unified-full analysis (Feng Shui + BaZi)',
    });

    if (!deductResult?.data || !deductResult.data.success) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: REQUIRED_CREDITS,
          message: deductResult?.data?.error || 'Failed to deduct credits',
        },
        { status: 402 } // Payment Required
      );
    }

    // 5. 执行玄空风水统一引擎分析
    let xuankongAnalysis;
    try {
      xuankongAnalysis = await evaluateXuankongAnalysis(
        personalInfo,
        houseInfo
      );
    } catch (engineError) {
      console.error('Xuankong engine error:', engineError);
      // 如果统一引擎失败，可以考虑降级到本地引擎或返回错误
      return NextResponse.json(
        { error: 'Analysis engine error. Please try again later.' },
        { status: 503 }
      );
    }

    // 6. 集成八字分析（mock 数据）
    const baziAnalysis = {
      fourPillars: {
        year: { heavenlyStem: '甲', earthlyBranch: '子' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑' },
        day: { heavenlyStem: '丙', earthlyBranch: '寅' },
        hour: { heavenlyStem: '丁', earthlyBranch: '卯' },
      },
      elements: {
        wood: 2,
        fire: 2,
        earth: 1,
        metal: 1,
        water: 2,
      },
      luckyElements: ['木', '火'],
      analysis: {
        personality: '性格温和，善于沟通，具有领导才能。',
        career: '适合从事管理、教育、艺术类工作。',
        wealth: '财运平稳，中年后有较大发展。',
        health: '注意肝胆和心脏健康。',
        relationships: '人际关系良好，异性缘佳。',
      },
      recommendations: [
        '多穿绿色、红色衣物增强运势',
        '办公桌或家中可摆放绿植',
        '适合向东方或南方发展',
      ],
    };

    // 7. 返回完整分析结果
    return NextResponse.json({
      success: true,
      data: {
        personalInfo,
        houseInfo,
        xuankongAnalysis,
        baziAnalysis,
        engine: 'unified',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Unified-full analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
