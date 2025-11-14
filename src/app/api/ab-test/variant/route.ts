import { abTestManager } from '@/lib/ab-test/manager';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  experimentName: z.string(),
  userId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = requestSchema.parse(body);

    const result = await abTestManager.getVariant(params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ABTest API] Error getting variant:', error);
    return NextResponse.json(
      { error: 'Failed to get variant' },
      { status: 500 }
    );
  }
}
