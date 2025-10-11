import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/db'
import { fraudBlacklist, fraudEvents, shareClicks, shareRecords } from '@/db/schema'
import { websiteConfig } from '@/config/website'
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types'
import { addCredits } from '@/credits/credits'
import { and, eq, gte } from 'drizzle-orm'

const TrackSchema = z.object({
  id: z.string().uuid(),
  step: z.enum(['click', 'convert']).default('click'),
  fp: z.string().optional(),
})

function getIp(req: Request) {
  const hdr = (req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '').split(',')[0].trim()
  return hdr || '0.0.0.0'
}

export async function POST(request: Request) {
  try {
    if (!websiteConfig.growth?.share?.enable) {
      return NextResponse.json({ success: false, error: 'SHARE_DISABLED' }, { status: 400 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = TrackSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'INVALID_BODY' }, { status: 400 })
    }

    const { id, step, fp } = parsed.data
    const db = await getDb()

    const [rec] = await db
      .select({ id: shareRecords.id, userId: shareRecords.userId, clickCount: shareRecords.clickCount, conversionCount: shareRecords.conversionCount, rewardGranted: shareRecords.rewardGranted, rewardAmount: shareRecords.rewardAmount })
      .from(shareRecords)
      .where(eq(shareRecords.id, id))
      .limit(1)
    if (!rec) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 })

    const ip = getIp(request)
    const ua = request.headers.get('user-agent') || ''

    // 记录点击明细
    try { await db.insert(shareClicks).values({ shareId: id as any, ip, userAgent: ua, fingerprint: fp }) } catch {}

    if (step === 'click') {
      await db
        .update(shareRecords)
        .set({ clickCount: (rec.clickCount || 0) + 1 })
        .where(eq(shareRecords.id, id))
      return NextResponse.json({ success: true, data: { updated: 'click' } })
    }

    // convert: 停留验证 + 限流发奖
    await db
      .update(shareRecords)
      .set({ conversionCount: (rec.conversionCount || 0) + 1 })
      .where(eq(shareRecords.id, id))

    // 发奖规则（检查黑名单）
    const black = await db
      .select({ id: fraudBlacklist.id })
      .from(fraudBlacklist)
      .where(
        and(
          // 命中 IP 或 指纹 即视为黑名单
          // 使用 or 逻辑：如果两个值都存在，则任意命中即可
          // 简化实现：拆两次查询以兼容部分 Drizzle 逻辑
          eq(fraudBlacklist.ip, ip as any)
        )
      )
      .limit(1)
    const black2 = fp
      ? await db
          .select({ id: fraudBlacklist.id })
          .from(fraudBlacklist)
          .where(eq(fraudBlacklist.fingerprint, fp as any))
          .limit(1)
      : []
    if ((black?.length || 0) > 0 || (black2?.length || 0) > 0) {
      try { await db.insert(fraudEvents).values({ shareId: id as any, ip, fingerprint: fp, reason: 'BLACKLISTED', step: 'convert' }) } catch {}
      return NextResponse.json({ success: true, data: { updated: 'convert', rewarded: false, reason: 'BLACKLISTED' } })
    }

    // 发奖规则
    if (!rec.rewardGranted && (websiteConfig.growth.share.requireConvert ? (rec.conversionCount || 0) + 1 >= 1 : true)) {
      const now = new Date()
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)

      // 今日已得奖次数
      const todays = await db
        .select({ id: shareRecords.id })
        .from(shareRecords)
        .where(and(eq(shareRecords.userId, rec.userId), eq(shareRecords.rewardGranted, true), gte(shareRecords.createdAt as any, startOfDay as any)))

      const dailyMax = websiteConfig.growth.share.dailyMaxRewards ?? 1
      if ((todays?.length || 0) >= dailyMax) {
        return NextResponse.json({ success: true, data: { updated: 'convert', rewarded: false, reason: 'DAILY_LIMIT' } })
      }

      // 冷却：最近一次rewardGranted的记录
      const cooldownMin = websiteConfig.growth.share.cooldownMinutes ?? 60
      if (cooldownMin > 0) {
        const since = new Date(now.getTime() - cooldownMin * 60 * 1000)
        const lastWithin = await db
          .select({ id: shareRecords.id })
          .from(shareRecords)
          .where(and(eq(shareRecords.userId, rec.userId), eq(shareRecords.rewardGranted, true), gte(shareRecords.createdAt as any, since as any)))
          .limit(1)
        if (lastWithin && lastWithin.length > 0) {
          return NextResponse.json({ success: true, data: { updated: 'convert', rewarded: false, reason: 'COOLDOWN' } })
        }
      }

      const credits = websiteConfig.growth.share.rewardCredits ?? 5
      if (credits > 0) {
        await addCredits({ userId: rec.userId, amount: credits, type: CREDIT_TRANSACTION_TYPE.SHARE_REWARD, description: '分享奖励（有效转化）' })
      }
      await db.update(shareRecords).set({ rewardGranted: true, rewardAmount: credits }).where(eq(shareRecords.id, id))

      return NextResponse.json({ success: true, data: { updated: 'convert', rewarded: true, credits } })
    }

    return NextResponse.json({ success: true, data: { updated: 'convert', rewarded: false } })
  } catch (error) {
    console.error('share/track error:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
