import { NextRequest, NextResponse } from 'next/server';
import { guestSessionManager } from './guest-session';
import type { GuestSession } from './guest-session';

// 扩展 NextRequest 类型以包含游客会话
declare module 'next/server' {
  interface NextRequest {
    guestSession?: GuestSession;
  }
}

// 游客会话中间件
export async function withGuestSession(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 从 Cookie 中获取会话令牌
    const sessionToken = request.cookies.get('guest_session_token')?.value;
    
    if (!sessionToken) {
      // 没有会话令牌，继续处理（可能是新用户）
      return handler(request);
    }

    // 验证会话
    const validation = await guestSessionManager.validateSession(sessionToken);
    
    if (!validation.isValid) {
      // 会话无效，清除 Cookie 并继续处理
      const response = await handler(request);
      response.cookies.delete('guest_session_token');
      return response;
    }

    // 会话有效，添加到请求对象
    request.guestSession = validation.session!;

    // 如果需要续期，自动续期
    if (validation.needsRenewal) {
      try {
        const renewedSession = await guestSessionManager.renewSession(validation.session!.id);
        request.guestSession = renewedSession;
        
        // 更新 Cookie
        const response = await handler(request);
        response.cookies.set('guest_session_token', renewedSession.sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60,
          path: '/',
        });
        return response;
      } catch (renewalError) {
        console.error('Session renewal failed:', renewalError);
        // 续期失败，继续使用原会话
      }
    }

    return handler(request);

  } catch (error) {
    console.error('Guest session middleware error:', error);
    
    // 中间件错误，清除 Cookie 并继续处理
    const response = await handler(request);
    response.cookies.delete('guest_session_token');
    return response;
  }
}

// 检查是否为游客用户
export function isGuestUser(request: NextRequest): boolean {
  return !!request.guestSession && !request.guestSession.mergedToUserId;
}

// 获取游客会话
export function getGuestSession(request: NextRequest): GuestSession | null {
  return request.guestSession || null;
}

// 检查使用限制
export async function checkGuestUsageLimit(
  request: NextRequest,
  type: 'analysis' | 'ai_query'
): Promise<{ allowed: boolean; reason?: string }> {
  const session = getGuestSession(request);
  
  if (!session) {
    return { allowed: false, reason: 'No guest session' };
  }

  const allowed = await guestSessionManager.checkUsageLimit(session.id, type);
  
  if (!allowed) {
    const limit = type === 'analysis' ? session.maxAnalyses : session.maxAiQueries;
    const used = type === 'analysis' ? session.analysisCount : session.aiQueriesCount;
    
    return {
      allowed: false,
      reason: `Guest usage limit exceeded (${used}/${limit} ${type}s used)`
    };
  }

  return { allowed: true };
}

// 记录使用量
export async function recordGuestUsage(
  request: NextRequest,
  type: 'analysis' | 'ai_query'
): Promise<void> {
  const session = getGuestSession(request);
  
  if (session) {
    await guestSessionManager.incrementUsage(session.id, type);
  }
}
