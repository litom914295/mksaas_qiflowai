import { referralRelationships, user } from '@/db/schema';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { and, eq, inArray, or } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/referral/network
 * 获取推荐关系网络数据
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const maxNodes = Number.parseInt(searchParams.get('maxNodes') || '100');

    // 获取推荐关系
    let relationshipsQuery = db
      .select({
        id: referralRelationships.id,
        referrerId: referralRelationships.referrerId,
        refereeId: referralRelationships.refereeId,
        level: referralRelationships.level,
        status: referralRelationships.status,
      })
      .from(referralRelationships)
      .where(eq(referralRelationships.status, 'active'))
      .limit(maxNodes)
      .$dynamic();

    if (userId) {
      // 获取特定用户的推荐网络(包括上下游)
      relationshipsQuery = relationshipsQuery.where(
        or(
          eq(referralRelationships.referrerId, userId),
          eq(referralRelationships.refereeId, userId)
        )
      );
    }

    const relationships = await relationshipsQuery;

    // 收集所有相关用户ID
    const userIds = new Set<string>();
    relationships.forEach((rel) => {
      userIds.add(rel.referrerId);
      userIds.add(rel.refereeId);
    });

    // 获取用户信息
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(inArray(user.id, Array.from(userIds)));

    // 计算每个用户的推荐人数
    const referralCounts = new Map<string, number>();
    relationships.forEach((rel) => {
      const count = referralCounts.get(rel.referrerId) || 0;
      referralCounts.set(rel.referrerId, count + 1);
    });

    // 构建节点数据
    const nodes = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      level: relationships.find((r) => r.refereeId === u.id)?.level || 0,
      referrals: referralCounts.get(u.id) || 0,
    }));

    // 构建边数据
    const edges = relationships.map((rel) => ({
      source: rel.referrerId,
      target: rel.refereeId,
    }));

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('获取推荐网络失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
