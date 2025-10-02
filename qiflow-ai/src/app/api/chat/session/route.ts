import { NextResponse } from 'next/server';
import { orchestrator } from '../shared';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId')?.trim();
    const userId = searchParams.get('userId')?.trim();

    if (!sessionId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少 sessionId 或 userId 参数',
        },
        { status: 400 }
      );
    }

    const session = await orchestrator.getSession(sessionId, userId);

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: '会话不存在',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        userId,
        context: session.context,
        currentState: session.currentState,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    console.error('[ChatSessionAPI] unexpected error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
