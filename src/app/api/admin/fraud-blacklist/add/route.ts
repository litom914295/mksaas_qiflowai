import { NextResponse } from 'next/server'
import { getSession } from '@/lib/server'
import { getDb } from '@/db'
import { fraudBlacklist } from '@/db/schema'
import { z } from 'zod'

function isAdmin(role?: string | null) {
  return role === 'admin'
}

const AddSchema = z.object({
  ip: z.string().optional(),
  fingerprint: z.string().optional(),
  reason: z.string().optional().default('manual'),
  expiresAt: z.string().datetime().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user?.id || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 })
    }

    const json = await request.json().catch(() => ({}))
    const parsed = AddSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'INVALID_BODY' }, { status: 400 })
    }

    const { ip, fingerprint, reason, expiresAt } = parsed.data
    if (!ip && !fingerprint) {
      return NextResponse.json({ success: false, error: 'MISSING_KEY' }, { status: 400 })
    }

    const db = await getDb()
    await db.insert(fraudBlacklist).values({ ip, fingerprint, reason, expiresAt: expiresAt ? new Date(expiresAt) : null as any })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('blacklist/add error:', error)
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
