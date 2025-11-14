import { abTestManager } from '@/lib/ab-test/manager';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  experimentName: z.string(),
  userId: z.string(),
  eventType: z.string(),
  eventData: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = requestSchema.parse(body);

    await abTestManager.trackEvent(params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ABTest API] Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
