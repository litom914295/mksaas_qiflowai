import { authManager } from '@/lib/auth/auth-manager';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// OAuth 请求验证模式
const oauthSchema = z.object({
  provider: z.enum(['google', 'apple', 'wechat', 'github']),
  redirectTo: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = oauthSchema.parse(body);
    
    // 获取重定向 URL
    const redirectTo = validatedData.redirectTo || 
                      `${request.nextUrl.origin}/auth/callback`;

    // 执行 OAuth 登录
    if (validatedData.provider === 'wechat') {
      await authManager.signInWithWeChat();
    } else {
      await authManager.signInWithOAuth(validatedData.provider, redirectTo);
    }

    return NextResponse.json({
      success: true,
      message: `Redirecting to ${validatedData.provider} authentication...`,
      provider: validatedData.provider,
    });

  } catch (error) {
    console.error('OAuth error:', error);

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

    return NextResponse.json(
      { 
        error: 'OAuth authentication failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// 获取支持的 OAuth 提供商
export async function GET() {
  try {
    const supportedProviders = ['google', 'apple', 'wechat', 'github'];
    
    return NextResponse.json({
      providers: supportedProviders.map(provider => ({
        id: provider,
        name: provider.charAt(0).toUpperCase() + provider.slice(1),
        enabled: true,
      })),
    });

  } catch (error) {
    console.error('Get OAuth providers error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get OAuth providers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
