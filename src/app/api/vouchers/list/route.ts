import { getUserVouchers } from '@/credits/vouchers';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { authenticated, userId } = await verifyAuth(request);
  if (!authenticated || !userId) {
    return NextResponse.json(
      { success: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
  const list = await getUserVouchers(userId);
  return NextResponse.json({ success: true, data: list });
}
