import { NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAuth } from '@/lib/auth'
import { getDb } from '@/db'
import { referralRelationships } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { addCredits } from '@/credits/credits'
import { websiteConfig } from '@/config/website'
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types'

const BodySchema = z.object({}) // 预留：无需入参，由当前用户触发

export async function POST(request: Request) {
  try {
    const { authenticated, userId } = await verifyAuth(request)
    if (!authenticated || !userId) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 })
    }

    const db = await getDb()

    // 找到作为被推荐人的 pending/active 关系（未发放奖励）
    const [rel] = await db
      .select({ id: referralRelationships.id, referrerId: referralRelationships.referrerId, rewardGranted: referralRelationships.rewardGranted, status: referralRelationships.status })
      .from(referralRelationships)
      .where(eq(referralRelationships.refereeId, userId))
      .limit(1)

    if (!rel?.id) {
      return NextResponse.json({ success: true, data: { found: false, rewarded: false } })
    }

    // 标记激活状态
    if (rel.status !== 'active') {
      await db
        .update(referralRelationships)
        .set({ status: 'active', activatedAt: new Date() })
        .where(eq(referralRelationships.id, rel.id))
    }

    // 已发放则直接返回
    if (rel.rewardGranted) {
      return NextResponse.json({ success: true, data: { found: true, rewarded: true } })
    }

    const refCfg = websiteConfig.credits.referral || { inviterCredits: 15, inviteeCredits: 20, requireActivation: true }

    // 发放双向奖励（不过期）
    await addCredits({ userId: rel.referrerId!, amount: refCfg.inviterCredits, type: CREDIT_TRANSACTION_TYPE.REFERRAL_REWARD, description: '推荐奖励（推荐人）' })
    await addCredits({ userId, amount: refCfg.inviteeCredits, type: CREDIT_TRANSACTION_TYPE.REFERRAL_REWARD, description: '推荐奖励（被推荐人）' })

    await db
      .update(referralRelationships)
      .set({ rewardGranted: true })
      .where(and(eq(referralRelationships.id, rel.id)))

    return NextResponse.json({ success: true, data: { found: true, rewarded: true } })
  } catch (error) {
    console.error('referral/activate error:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
