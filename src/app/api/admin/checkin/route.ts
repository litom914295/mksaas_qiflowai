import { user } from '@/db/schema';
import { checkInConfig, userCheckIns } from '@/db/schema-credit-config';
import { auth } from '@/lib/auth';
import { getDb } from '@/db';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/checkin
 * 获取签到统计数据
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const db = await getDb();
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '20');

    // 获取签到配置
    const [config] = await db.select().from(checkInConfig).limit(1);

    // 总体统计
    const [stats] = await db
      .select({
        totalCheckIns: sql<number>`count(*)::int`,
        totalUsers: sql<number>`count(distinct ${userCheckIns.userId})::int`,
        todayCheckIns: sql<number>`count(*) filter (where date(${userCheckIns.checkInDate}) = current_date)::int`,
        totalRewards: sql<number>`coalesce(sum(${userCheckIns.totalReward}), 0)::int`,
      })
      .from(userCheckIns);

    // 用户签到记录
    let recordsQuery = db
      .select({
        id: userCheckIns.id,
        userId: userCheckIns.userId,
        userName: user.name,
        userEmail: user.email,
        checkInDate: userCheckIns.checkInDate,
        consecutiveDays: userCheckIns.consecutiveDays,
        totalCheckIns: userCheckIns.totalCheckIns,
        baseReward: userCheckIns.baseReward,
        bonusReward: userCheckIns.bonusReward,
        totalReward: userCheckIns.totalReward,
        checkInSource: userCheckIns.checkInSource,
        createdAt: userCheckIns.createdAt,
      })
      .from(userCheckIns)
      .leftJoin(user, eq(userCheckIns.userId, user.id))
      .orderBy(desc(userCheckIns.createdAt))
      .$dynamic();

    if (userId) {
      recordsQuery = recordsQuery.where(eq(userCheckIns.userId, userId));
    }

    const records = await recordsQuery
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // 获取总数
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userCheckIns)
      .where(userId ? eq(userCheckIns.userId, userId) : undefined);

    return NextResponse.json({
      config,
      stats,
      records,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error('获取签到数据失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

/**
 * POST /api/admin/checkin/config
 * 更新签到配置
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const db = await getDb();
    const body = await req.json();
    const {
      baseReward,
      enabled,
      consecutiveRewards,
      allowMakeup,
      makeupCost,
      maxMakeupDays,
    } = body;

    // 获取现有配置
    const [existingConfig] = await db.select().from(checkInConfig).limit(1);

    let updatedConfig;
    if (existingConfig) {
      // 更新
      [updatedConfig] = await db
        .update(checkInConfig)
        .set({
          baseReward: baseReward ?? existingConfig.baseReward,
          enabled: enabled ?? existingConfig.enabled,
          consecutiveRewards:
            consecutiveRewards ?? existingConfig.consecutiveRewards,
          allowMakeup: allowMakeup ?? existingConfig.allowMakeup,
          makeupCost: makeupCost ?? existingConfig.makeupCost,
          maxMakeupDays: maxMakeupDays ?? existingConfig.maxMakeupDays,
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(checkInConfig.id, existingConfig.id))
        .returning();
    } else {
      // 创建
      [updatedConfig] = await db
        .insert(checkInConfig)
        .values({
          baseReward: baseReward ?? 5,
          enabled: enabled ?? true,
          consecutiveRewards: consecutiveRewards ?? [
            { days: 3, bonus: 10, label: '三日奖励' },
            { days: 7, bonus: 30, label: '七日大礼' },
          ],
          allowMakeup: allowMakeup ?? true,
          makeupCost: makeupCost ?? 10,
          maxMakeupDays: maxMakeupDays ?? 3,
          updatedBy: session.user.id,
        })
        .returning();
    }

    return NextResponse.json({ config: updatedConfig });
  } catch (error) {
    console.error('更新签到配置失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
