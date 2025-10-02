import { NextResponse } from 'next/server';
import { confidenceRepository } from '@/lib/ai/confidence/confidence-aggregator';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId')?.trim();

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 sessionId 参数',
        },
        { status: 400 }
      );
    }

    const record = await confidenceRepository.getLatest(sessionId);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到置信度记录',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('[ConfidenceAPI] unexpected error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
