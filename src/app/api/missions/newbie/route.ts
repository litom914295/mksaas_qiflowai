import { getSession } from '@/lib/server';
import { getUserNewbieMissions } from '@/lib/newbie-missions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 检查是否禁用数据库查询（用于本地开发）
    const disableCreditsDb = process.env.DISABLE_CREDITS_DB === 'true';
    
    if (disableCreditsDb) {
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        missions: [
          {
            id: 'complete_profile',
            title: '完善个人资料',
            description: '设置头像和昵称',
            reward: 20,
            progress: 0,
            target: 1,
            completed: false,
            rewardClaimed: false,
          },
          {
            id: 'first_bazi_analysis',
            title: '首次八字分析',
            description: '完成第一次八字命理分析',
            reward: 30,
            progress: 0,
            target: 1,
            completed: false,
            rewardClaimed: false,
          },
        ],
        completed: 0,
        total: 2,
        progress: 0,
      });
    }

    const result = await getUserNewbieMissions(session.user.id);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get newbie missions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get missions' },
      { status: 500 }
    );
  }
}
