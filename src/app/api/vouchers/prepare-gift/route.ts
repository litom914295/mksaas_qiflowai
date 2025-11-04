import { prepareGift } from '@/credits/vouchers';
import { verifyAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { authenticated, userId } = await verifyAuth(request);
  if (!authenticated || !userId) {
    return NextResponse.json(
      { success: false, error: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }
  const body = await request.json().catch(() => ({}));
  const voucherId = String(body?.voucherId || '');
  if (!voucherId)
    return NextResponse.json(
      { success: false, error: 'INVALID_VOUCHER_ID' },
      { status: 400 }
    );

  try {
    const { token } = await prepareGift(userId, voucherId);
    const sharePath = `/settings/credits?gift_token=${token}`;
    return NextResponse.json({ success: true, data: { token, sharePath } });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || 'GIFT_PREPARE_FAILED' },
      { status: 400 }
    );
  }
}
