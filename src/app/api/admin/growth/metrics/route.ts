import { type NextRequest, NextResponse } from 'next/server';

// 增长指标API - 获取核心增长KPI
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('dateRange') || '7d';
    const type = searchParams.get('type') || 'summary';

    // 模拟数据 - 实际应从数据库获取
    const metrics = {
      summary: {
        // K因子 (病毒系数)
        kFactor: {
          value: 1.35,
          trend: 12.5,
          breakdown: {
            invitationRate: 0.45, // 邀请率
            conversionRate: 0.3, // 转化率
            averageInvites: 10, // 平均邀请数
          },
        },
        // 激活率
        activationRate: {
          value: 0.68,
          trend: 5.2,
          total: 12500,
          activated: 8500,
        },
        // 留存率
        retentionRate: {
          d1: 0.85,
          d7: 0.65,
          d30: 0.45,
          trend: -2.1,
        },
        // 分享统计
        shareStats: {
          totalShares: 45000,
          uniqueSharers: 8900,
          shareConversion: 0.12,
          trend: 18.3,
        },
        // 积分统计
        creditsStats: {
          totalDistributed: 1250000,
          totalRedeemed: 890000,
          averageBalance: 450,
          activeUsers: 15600,
        },
        // 风控统计
        fraudStats: {
          blockedUsers: 234,
          fraudAttempts: 1567,
          preventionRate: 0.95,
          falsePositiveRate: 0.02,
        },
      },
      // 详细数据
      detailed: {
        // 按时间段的增长数据
        timeline: generateTimelineData(dateRange),
        // 渠道分布
        channels: [
          { name: '微信', users: 45000, conversion: 0.15 },
          { name: 'QQ', users: 23000, conversion: 0.12 },
          { name: '短信', users: 12000, conversion: 0.08 },
          { name: '邮件', users: 8000, conversion: 0.05 },
        ],
        // 用户分层
        userSegments: [
          { segment: '高价值用户', count: 2500, avgLTV: 1250 },
          { segment: '活跃用户', count: 8900, avgLTV: 450 },
          { segment: '普通用户', count: 25000, avgLTV: 120 },
          { segment: '休眠用户', count: 12000, avgLTV: 30 },
        ],
      },
    };

    return NextResponse.json({
      success: true,
      data: type === 'summary' ? metrics.summary : metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching growth metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}

// 更新指标配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { metricType, config } = body;

    // 验证参数
    if (!metricType || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 模拟更新配置 - 实际应更新数据库
    console.log('Updating metric config:', { metricType, config });

    return NextResponse.json({
      success: true,
      message: 'Metric configuration updated successfully',
      data: { metricType, config },
    });
  } catch (error) {
    console.error('Error updating metric config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

// 生成时间线数据
function generateTimelineData(range: string) {
  const days = range === '30d' ? 30 : range === '14d' ? 14 : 7;
  const data = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 500) + 200,
      referrals: Math.floor(Math.random() * 300) + 100,
      shares: Math.floor(Math.random() * 1000) + 500,
      credits: Math.floor(Math.random() * 10000) + 5000,
      kFactor: (Math.random() * 0.5 + 1).toFixed(2),
    });
  }

  return data.reverse();
}
