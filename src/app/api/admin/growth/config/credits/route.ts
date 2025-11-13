import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { getAllConfig, updateConfigs } from '@/lib/services/credit-config';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 获取积分配置
 */
export const GET = withAdminAuth(async () => {
  try {
    const config = await getAllConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching credit config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit config' },
      { status: 500 }
    );
  }
});

/**
 * 更新积分配置
 */
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();

    // 验证配置格式
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid configuration format' },
        { status: 400 }
      );
    }

    // 将嵌套对象展开为平面键
    const flattenConfig: Record<string, any> = {};

    if (body.signin) {
      flattenConfig.signin = body.signin;
    }
    if (body.milestones) {
      flattenConfig.milestones = body.milestones;
    }
    if (body.tasks) {
      flattenConfig.tasks = body.tasks;
    }
    if (body.referral) {
      flattenConfig.referral = body.referral;
    }

    // 保存到数据库
    await updateConfigs(flattenConfig);

    // 返回更新后的配置
    const updatedConfig = await getAllConfig();

    return NextResponse.json({
      success: true,
      message: '配置更新成功',
      config: updatedConfig,
    });
  } catch (error) {
    console.error('Error updating credit config:', error);
    return NextResponse.json(
      { error: 'Failed to update credit config' },
      { status: 500 }
    );
  }
});
