import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { getUserVouchers } from '@/credits/vouchers';

export async function GET(request: Request) {
  const { authenticated, userId } = await verifyAuth(request);
  if (!authenticated || !userId) {
    return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }
  const list = await getUserVouchers(userId);
  return NextResponse.json({ success: true, data: list });
}