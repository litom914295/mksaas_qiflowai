import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // 简单校验与打点（此处仅记录日志；生产环境应写入持久化存储/日志系统）
    console.error('[error-report]', {
      errorId: payload?.errorId,
      message: payload?.message,
      url: payload?.url,
      userAgent: payload?.userAgent,
      timestamp: payload?.timestamp,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
