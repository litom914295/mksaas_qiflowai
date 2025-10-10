import { consumeCreditsAction } from '@/actions/consume-credits';
import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 纯八字分析 API
 * 费用: 10 积分
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
    const { personalInfo } = body;

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

    // 4. 检查并扣除积分（10积分）
    const REQUIRED_CREDITS = 10;
    const deductResult = await consumeCreditsAction({
      amount: REQUIRED_CREDITS,
      description: 'Bazi-only analysis',
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

    // 5. 执行八字分析（这里使用 mock 数据，实际应调用真实分析引擎）
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

    // 6. 返回分析结果
    return NextResponse.json({
      success: true,
      data: {
        personalInfo,
        baziAnalysis,
        engine: 'unified',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Bazi-only analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
