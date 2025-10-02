import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Demo mode check
const isDemoMode = process.env.DEMO_MODE === 'true' || 
                   process.env.NODE_ENV === 'test' ||
                   process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co';

async function handlePOST(request: NextRequest) {
  try {
    // 检查是否有现有的会话需要续期
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const existingToken = cookieStore.get('guest_session_token')?.value;
    
    let renewed = false;
    let sessionId = 'demo_guest_' + Math.random().toString(36).substr(2, 9);
    // 统一使用毫秒时间戳表示过期时间，便于前后端一致
    let expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;

    if (isDemoMode) {
      // Demo mode: Create a simple guest session without database
      const { signGuestToken, verifyGuestToken } = await import('@/lib/auth/guest');
      const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

      if (existingToken) {
        // 解析既有令牌，判断是否需要续期
        const verified = verifyGuestToken(existingToken);
        if (verified.valid && verified.payload) {
          const payload: any = verified.payload;
          const now = Date.now();
          const currentExpMs = typeof payload.exp === 'number' ? payload.exp : now;
          sessionId = typeof payload.i === 'string' ? payload.i : sessionId;
          if (currentExpMs - now <= SIX_HOURS_MS) {
            // 过期时间在6小时内，续期至 currentExpMs + 24h（保证严格大于原 exp）
            renewed = true;
            expiresAtMs = currentExpMs + 24 * 60 * 60 * 1000;
          } else {
            // 不需要续期，维持原过期时间
            renewed = false;
            expiresAtMs = currentExpMs;
          }
        } else {
          // 令牌无效则重新签发
          renewed = true;
          expiresAtMs = Date.now() + 24 * 60 * 60 * 1000;
        }
      }

      const newToken = signGuestToken({ i: sessionId, exp: expiresAtMs });
      const response = NextResponse.json({
        ok: true,
        renewed,
        session: {
          id: sessionId,
          sessionToken: newToken,
          expiresAt: expiresAtMs,
          maxAnalyses: 3,
          maxAiQueries: 10,
        }
      });

      // Set demo session cookie（保存已签名令牌）
      response.cookies.set('guest_session_token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24小时
        path: '/',
      });

      return response;
    }

    // Production mode: Use the actual guest session manager
    const { guestSessionManager } = await import('@/lib/auth/guest-session');
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // 生成设备指纹
    const deviceFingerprint = guestSessionManager.generateDeviceFingerprint(
      userAgent,
      ipAddress
    );

    // 创建游客会话
    const session = await guestSessionManager.createSession({
      deviceFingerprint,
      userAgent,
      ipAddress,
      metadata: {
        createdAt: new Date().toISOString(),
        source: 'api',
      },
    });

    // 设置 HttpOnly Cookie
    const response = NextResponse.json({
      ok: true,
      renewed: false, // 新创建的会话不是续期
      session: {
        id: session.id,
        sessionToken: session.sessionToken,
        // 返回毫秒时间戳，保持与测试约定一致
        expiresAt: session.expiresAt.getTime(),
        maxAnalyses: session.maxAnalyses,
        maxAiQueries: session.maxAiQueries,
      }
    });

    // 设置安全的会话 Cookie
    response.cookies.set('guest_session_token', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24小时
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Guest session creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create guest session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export without rate limiting for demo mode
export const POST = handlePOST;

// 健康检查
export async function GET() {
  try {
    if (isDemoMode) {
      return NextResponse.json({
        status: 'healthy',
        mode: 'demo',
        cleanedSessions: 0,
        timestamp: new Date().toISOString(),
      });
    }

    // Production mode health check
    const { guestSessionManager } = await import('@/lib/auth/guest-session');
    const cleanedCount = await guestSessionManager.cleanupExpiredSessions();
    
    return NextResponse.json({
      status: 'healthy',
      mode: 'production',
      cleanedSessions: cleanedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}