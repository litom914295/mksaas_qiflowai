import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 验证schema
const referralQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'expired', 'all']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const createReferralSchema = z.object({
  userId: z.string(),
  campaignId: z.string().optional(),
  customCode: z.string().optional(),
  expiresAt: z.string().optional(),
  maxUses: z.number().optional(),
  rewardAmount: z.number(),
});

// 获取推荐列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = referralQuerySchema.parse(searchParams);

    const page = Number.parseInt(query.page);
    const limit = Number.parseInt(query.limit);
    const offset = (page - 1) * limit;

    // 模拟数据 - 实际应从数据库获取
    const mockData = generateMockReferrals(100);

    // 应用过滤
    let filtered = mockData;
    if (query.search) {
      filtered = filtered.filter(
        (r) =>
          r.code.includes(query.search!) ||
          r.referrerName.includes(query.search!)
      );
    }
    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((r) => r.status === query.status);
    }

    // 分页
    const paginatedData = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        referrals: paginatedData,
        pagination: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

// 创建推荐链接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createReferralSchema.parse(body);

    // 生成推荐码
    const code = validatedData.customCode || generateReferralCode();

    // 模拟创建 - 实际应插入数据库
    const newReferral = {
      id: `ref_${Date.now()}`,
      code,
      userId: validatedData.userId,
      campaignId: validatedData.campaignId,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: validatedData.expiresAt,
      maxUses: validatedData.maxUses || null,
      currentUses: 0,
      rewardAmount: validatedData.rewardAmount,
      link: `https://app.example.com/invite/${code}`,
      shortLink: `https://s.example.com/${code}`,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Referral link created successfully',
        data: newReferral,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating referral:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}

// 更新推荐配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralId, updates } = body;

    if (!referralId) {
      return NextResponse.json(
        { success: false, error: 'Referral ID is required' },
        { status: 400 }
      );
    }

    // 模拟更新 - 实际应更新数据库
    console.log('Updating referral:', referralId, updates);

    return NextResponse.json({
      success: true,
      message: 'Referral updated successfully',
      data: { referralId, ...updates },
    });
  } catch (error) {
    console.error('Error updating referral:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update referral' },
      { status: 500 }
    );
  }
}

// 删除推荐链接
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const referralId = searchParams.get('id');

    if (!referralId) {
      return NextResponse.json(
        { success: false, error: 'Referral ID is required' },
        { status: 400 }
      );
    }

    // 模拟删除 - 实际应从数据库删除
    console.log('Deleting referral:', referralId);

    return NextResponse.json({
      success: true,
      message: 'Referral deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting referral:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete referral' },
      { status: 500 }
    );
  }
}

// 生成推荐码
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 生成模拟数据
function generateMockReferrals(count: number) {
  const statuses = ['active', 'inactive', 'expired'];
  const referrals = [];

  for (let i = 0; i < count; i++) {
    referrals.push({
      id: `ref_${i}`,
      code: generateReferralCode(),
      referrerId: `user_${i}`,
      referrerName: `用户${i}`,
      referrerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      referredCount: Math.floor(Math.random() * 20),
      successCount: Math.floor(Math.random() * 10),
      totalReward: Math.floor(Math.random() * 1000),
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      lastUsed:
        Math.random() > 0.5
          ? new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
    });
  }

  return referrals;
}
