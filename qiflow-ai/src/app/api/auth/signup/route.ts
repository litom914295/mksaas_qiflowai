import { authManager } from '@/lib/auth/auth-manager';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 注册请求验证模式
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Display name is required'),
  preferredLocale: z.string().optional().default('zh-CN'),
  timezone: z.string().optional().default('Asia/Shanghai'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = signupSchema.parse(body);
    
    // 获取设备信息
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                     headersList.get('x-real-ip') || 'unknown';

    // 生成设备指纹
    const deviceFingerprint = authManager.generateDeviceFingerprint();

    // 执行注册
    const { user, session } = await authManager.signUp({
      email: validatedData.email,
      password: validatedData.password,
      displayName: validatedData.displayName,
      preferredLocale: validatedData.preferredLocale,
      timezone: validatedData.timezone,
    });

    // 记录注册事件
    console.log('User registered:', {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent: userAgent.substring(0, 100),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: validatedData.displayName,
        preferredLocale: validatedData.preferredLocale,
        timezone: validatedData.timezone,
      },
      session: session ? {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: new Date(session.expires_at! * 1000).toISOString(),
      } : null,
      message: 'Registration successful. Please check your email to verify your account.',
    });

  } catch (error) {
    console.error('Signup error:', error);

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
    if (errorMessage.includes('Email already registered') || 
        errorMessage.includes('EMAIL_ALREADY_EXISTS')) {
      statusCode = 409;
    } else if (errorMessage.includes('Password') || 
               errorMessage.includes('WEAK_PASSWORD')) {
      statusCode = 400;
    }

    return NextResponse.json(
      { 
        error: 'Registration failed',
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}
