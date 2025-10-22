import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateReferralCode } from '@/lib/services/referral';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * 获取用户的推荐信息
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const userId = session.user.id;

    // 获取用户信息和推荐数据
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referralCode: true,
        totalInvites: true,
        successfulInvites: true,
        credits: true,
        referralsGiven: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            activatedAt: true,
            referred: {
              select: {
                name: true,
                email: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 如果没有推荐码,生成一个
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = await generateReferralCode(userId);
    }

    // 计算已获得的推荐奖励
    const referralRewards = await prisma.creditTransaction.aggregate({
      where: {
        userId,
        type: { in: ['referral_bonus', 'milestone'] },
      },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${referralCode}`,
        totalInvites: user.totalInvites,
        successfulInvites: user.successfulInvites,
        totalRewards: referralRewards._sum.amount || 0,
        referrals: user.referralsGiven.map((r) => ({
          id: r.id,
          status: r.status,
          userName: r.referred.name || '新用户',
          createdAt: r.createdAt.toISOString(),
          activatedAt: r.activatedAt?.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Get referral info error:', error);
    return NextResponse.json({ error: '获取推荐信息失败' }, { status: 500 });
  }
}
