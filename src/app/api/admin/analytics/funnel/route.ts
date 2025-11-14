import {
  baziCalculations,
  referralRelationships,
  shareRecords,
  user,
} from '@/db/schema';
import { auth } from '@/lib/auth';
import { CacheKeys, DefaultTTL, cacheManager } from '@/lib/cache/cache-manager';
import { getDb } from '@/db';
import { and, count, countDistinct, gte, lt, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/analytics/funnel
 * 获取用户转化漏斗数据
 *
 * 漏斗阶段:
 * 1. 曝光 (Exposure) - 分享链接被点击
 * 2. 点击 (Click) - 用户访问落地页
 * 3. 注册 (Registration) - 完成账号注册
 * 4. 激活 (Activation) - 完成首次核心操作(八字分析/风水分析)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const db = await getDb();
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, all
    const useCache = searchParams.get('cache') !== 'false';

    // 尝试从缓存获取
    const cacheKey = `${CacheKeys.DASHBOARD_STATS}:funnel:${period}`;
    if (useCache) {
      const cached = await cacheManager.get<any>(cacheKey);
      if (cached) {
        return NextResponse.json({ ...cached, fromCache: true });
      }
    }

    // 计算时间范围
    const { startDate, endDate } = getDateRange(period);

    // 阶段1: 曝光 (分享链接被点击)
    const [exposureResult] = await db
      .select({
        totalClicks: sql<number>`coalesce(sum(${shareRecords.clickCount}), 0)::int`,
        uniqueUsers: sql<number>`count(distinct ${shareRecords.userId})::int`,
      })
      .from(shareRecords)
      .where(
        startDate
          ? and(
              gte(shareRecords.createdAt, startDate),
              lt(shareRecords.createdAt, endDate)
            )
          : undefined
      );

    const exposureCount = exposureResult?.totalClicks || 0;

    // 阶段2: 点击 (实际访问落地页的用户)
    // 使用分享记录的点击数作为近似值
    const clickCount = exposureCount; // 简化:假设所有点击都到达落地页

    // 阶段3: 注册 (完成账号注册)
    const [registrationResult] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(user)
      .where(
        startDate
          ? and(gte(user.createdAt, startDate), lt(user.createdAt, endDate))
          : undefined
      );

    const registrationCount = registrationResult?.count || 0;

    // 阶段4: 激活 (完成首次核心操作)
    // 定义:完成至少一次八字分析或风水分析的用户
    const [activationResult] = await db
      .select({
        count: countDistinct(baziCalculations.userId),
      })
      .from(baziCalculations)
      .innerJoin(user, sql`${baziCalculations.userId} = ${user.id}`)
      .where(
        startDate
          ? and(gte(user.createdAt, startDate), lt(user.createdAt, endDate))
          : undefined
      );

    const activationCount = activationResult?.count || 0;

    // 计算转化率
    const clickToRegRate =
      clickCount > 0 ? (registrationCount / clickCount) * 100 : 0;
    const regToActivationRate =
      registrationCount > 0 ? (activationCount / registrationCount) * 100 : 0;
    const overallRate =
      clickCount > 0 ? (activationCount / clickCount) * 100 : 0;

    // 构建漏斗数据
    const funnelData = {
      stages: [
        {
          name: '曝光',
          stage: 'exposure',
          count: exposureCount,
          percentage: 100,
          dropOff: 0,
          description: '分享链接被点击次数',
        },
        {
          name: '点击',
          stage: 'click',
          count: clickCount,
          percentage: exposureCount > 0 ? 100 : 0,
          dropOff: 0,
          description: '访问落地页的用户',
        },
        {
          name: '注册',
          stage: 'registration',
          count: registrationCount,
          percentage:
            clickCount > 0 ? (registrationCount / clickCount) * 100 : 0,
          dropOff: clickCount - registrationCount,
          description: '完成账号注册的用户',
        },
        {
          name: '激活',
          stage: 'activation',
          count: activationCount,
          percentage: clickCount > 0 ? (activationCount / clickCount) * 100 : 0,
          dropOff: registrationCount - activationCount,
          description: '完成首次核心操作的用户',
        },
      ],
      conversions: {
        clickToRegistration: {
          rate: clickToRegRate,
          label: '点击→注册',
        },
        registrationToActivation: {
          rate: regToActivationRate,
          label: '注册→激活',
        },
        overallConversion: {
          rate: overallRate,
          label: '整体转化率',
        },
      },
      summary: {
        totalExposure: exposureCount,
        totalRegistrations: registrationCount,
        totalActivations: activationCount,
        period,
        startDate: startDate?.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    // 缓存结果
    await cacheManager.set(cacheKey, funnelData, { ttl: DefaultTTL.MEDIUM });

    return NextResponse.json(funnelData);
  } catch (error) {
    console.error('获取转化漏斗数据失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

/**
 * 根据period参数计算日期范围
 */
function getDateRange(period: string): {
  startDate: Date | null;
  endDate: Date;
} {
  const endDate = new Date();
  let startDate: Date | null = null;

  switch (period) {
    case '7d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'all':
      startDate = null; // 不设置开始日期=查询所有数据
      break;
    default:
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
  }

  return { startDate, endDate };
}

/**
 * POST /api/admin/analytics/funnel/clear-cache
 * 清空转化漏斗缓存
 */
export async function POST() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 清空所有漏斗相关缓存
    const deletedCount = await cacheManager.delByPattern(
      `${CacheKeys.DASHBOARD_STATS}:funnel:*`
    );

    return NextResponse.json({
      success: true,
      deletedCount,
      message: '缓存已清空',
    });
  } catch (error) {
    console.error('清空缓存失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
