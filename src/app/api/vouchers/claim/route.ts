import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { claimGift } from '@/credits/vouchers';

export async function POST(request: Request) {
  const { authenticated, userId } = await verifyAuth(request);
  if (!authenticated || !userId) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const token = String(body?.token || '');
  if (!token) return NextResponse.json({ success: false, error: 'INVALID_TOKEN' }, { status: 400 });
  try {
    await claimGift(userId, token);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'CLAIM_FAILED' }, { status: 400 });
  }
}