import { NextResponse } from 'next/server'
import { getSession } from '@/lib/server'
import { getDb } from '@/db'
import { creditTransaction, shareRecords, referralRelationships, fraudEvents } from '@/db/schema'
import { and, eq, gte, sql } from 'drizzle-orm'

function isAdmin(role?: string | null) {
  return role === 'admin'
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    const db = await getDb()
    // DB 健康
    try { await db.execute(sql`SELECT 1`)} catch { return NextResponse.json({ success: false, error: 'DB_UNAVAILABLE' }, { status: 500 }) }

    const now = new Date()
    const since24h = new Date(now.getTime() - 24*60*60*1000)

    // 24小时核心指标
    const metrics: Record<string, number> = {}
    try { const r = await db.select({ c: sql`count(*)` }).from(creditTransaction).where(and(eq(creditTransaction.type, 'DAILY_SIGNIN'), gte(creditTransaction.createdAt as any, since24h as any))); metrics.daily_signin_24h = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(creditTransaction).where(and(eq(creditTransaction.type, 'REFERRAL_REWARD'), gte(creditTransaction.createdAt as any, since24h as any))); metrics.referral_reward_24h = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(creditTransaction).where(and(eq(creditTransaction.type, 'SHARE_REWARD'), gte(creditTransaction.createdAt as any, since24h as any))); metrics.share_reward_24h = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(shareRecords).where(gte(shareRecords.createdAt as any, since24h as any)); metrics.share_created_24h = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(referralRelationships).where(and(eq(referralRelationships.rewardGranted, true), gte(referralRelationships.activatedAt as any, since24h as any))); metrics.referral_rewarded_24h = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(fraudEvents).where(gte(fraudEvents.createdAt as any, since24h as any)); metrics.blocked_24h = Number((r as any)[0]?.c||0) } catch {}

    return NextResponse.json({ success: true, data: { ok: true, metrics, since: since24h.toISOString() } })
  } catch (error) {
    console.error('admin/health/overview error:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
