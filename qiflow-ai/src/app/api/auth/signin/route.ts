import { authManager } from '@/lib/auth/auth-manager';
import { rateLimitConfigs, withRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 登录请求验证模式
const signinSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

async function handlePOST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = signinSchema.parse(body);
    
    // 获取设备信息
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                     headersList.get('x-real-ip') || 'unknown';

    // 生成设备指纹
    const deviceFingerprint = authManager.generateDeviceFingerprint();

    // 执行登录
    const { user, session } = await authManager.signIn({
      email: validatedData.email,
      password: validatedData.password,
      rememberMe: validatedData.rememberMe,
    });

    // 记录登录事件
    console.log('User signed in:', {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent: userAgent.substring(0, 100),
      timestamp: new Date().toISOString(),
    });

    // 创建响应
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.display_name,
        preferredLocale: user.user_metadata?.preferred_locale || 'zh-CN',
        timezone: user.user_metadata?.timezone || 'Asia/Shanghai',
        role: user.user_metadata?.role || 'user',
      },
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at! * 1000).toISOString(),
      },
    });

    // 设置会话 Cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    if (validatedData.rememberMe) {
      // 记住我：30天
      response.cookies.set('supabase-auth-token', session.access_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60,
      });
    } else {
      // 会话 Cookie：24小时
      response.cookies.set('supabase-auth-token', session.access_token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60,
      });
    }

    return response;

  } catch (error) {
    console.error('Signin error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: (error as any).errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // 根据错误类型返回不同的状态码
    let statusCode = 500;
    if (errorMessage.includes('Invalid login credentials') || 
        errorMessage.includes('INVALID_CREDENTIALS')) {
      statusCode = 401;
    } else if (errorMessage.includes('User not found') || 
               errorMessage.includes('USER_NOT_FOUND')) {
      statusCode = 404;
    } else if (errorMessage.includes('Too many requests')) {
      statusCode = 429;
    }

    return NextResponse.json(
      { 
        error: 'Authentication failed',
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}

// 应用速率限制的POST处理器
export const POST = withRateLimit(rateLimitConfigs.auth, handlePOST);
