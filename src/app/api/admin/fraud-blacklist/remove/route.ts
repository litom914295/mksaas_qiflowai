import { NextResponse } from 'next/server'
import { getSession } from '@/lib/server'
import { getDb } from '@/db'
import { fraudBlacklist } from '@/db/schema'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'

function isAdmin(role?: string | null) {
  return role === 'admin'
}

const RemoveSchema = z.object({
  id: z.string().uuid().optional(),
  ip: z.string().optional(),
  fingerprint: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = RemoveSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'INVALID_BODY' }, { status: 400 })
    }

    const { id, ip, fingerprint } = parsed.data
    if (!id && !ip && !fingerprint) {
      return NextResponse.json({ success: false, error: 'MISSING_KEY' }, { status: 400 })
    }

    const db = await getDb()

    if (id) {
      await db.delete(fraudBlacklist).where(eq(fraudBlacklist.id, id as any))
    } else {
      // 按 ip 或 fingerprint 删除（任一指定即可）
      if (ip) await db.delete(fraudBlacklist).where(eq(fraudBlacklist.ip, ip as any))
      if (fingerprint) await db.delete(fraudBlacklist).where(eq(fraudBlacklist.fingerprint, fingerprint as any))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('blacklist/remove error:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
