import { NextResponse } from 'next/server'
import { getSession } from '@/lib/server'
import { getDb } from '@/db'
import { fraudBlacklist } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

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
    const rows = await db
      .select({ id: fraudBlacklist.id, ip: fraudBlacklist.ip, fingerprint: fraudBlacklist.fingerprint, reason: fraudBlacklist.reason, expiresAt: fraudBlacklist.expiresAt, createdAt: fraudBlacklist.createdAt })
      .from(fraudBlacklist)

    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    console.error('blacklist/list error:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
