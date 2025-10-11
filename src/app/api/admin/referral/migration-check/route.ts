import { NextResponse } from 'next/server'
import { getSession } from '@/lib/server'
import { getDb } from '@/db'
import { referralCodes, referralRelationships, shareRecords, taskProgress, achievements, userReferralStats } from '@/db/schema'
import { sql } from 'drizzle-orm'

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

    async function exists(q: string) {
      try { await db.execute(sql.raw(q)); return true } catch { return false }
    }

    const checks = {
      referral_relationships: await exists('SELECT 1 FROM referral_relationships LIMIT 1'),
      referral_codes: await exists('SELECT 1 FROM referral_codes LIMIT 1'),
      share_records: await exists('SELECT 1 FROM share_records LIMIT 1'),
      task_progress: await exists('SELECT 1 FROM task_progress LIMIT 1'),
      achievements: await exists('SELECT 1 FROM achievements LIMIT 1'),
      user_referral_stats: await exists('SELECT 1 FROM user_referral_stats LIMIT 1'),
      referral_leaderboard_view: await exists('SELECT 1 FROM referral_leaderboard LIMIT 1'),
    }

    // 统计概览（若表存在）
    const stats: Record<string, number> = {}
    try { const r = await db.select({ c: sql`count(*)` }).from(referralCodes); stats.referral_codes = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(referralRelationships); stats.referral_relationships = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(shareRecords); stats.share_records = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(taskProgress); stats.task_progress = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(achievements); stats.achievements = Number((r as any)[0]?.c||0) } catch {}
    try { const r = await db.select({ c: sql`count(*)` }).from(userReferralStats); stats.user_referral_stats = Number((r as any)[0]?.c||0) } catch {}

    return NextResponse.json({ success: true, data: { checks, stats } })
  } catch (error) {
    console.error('admin/referral/migration-check error:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
