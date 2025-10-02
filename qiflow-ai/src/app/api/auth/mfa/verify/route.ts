import { authManager } from '@/lib/auth/auth-manager';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// MFA 验证请求模式
const mfaVerifySchema = z.object({
  code: z.string().length(6, 'MFA code must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    const validatedData = mfaVerifySchema.parse(body);
    
    // 验证用户是否已登录
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // 验证 MFA 代码
    await authManager.verifyMFA(validatedData.code);

    // 记录 MFA 验证成功事件
    console.log('MFA verification successful:', {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'MFA verification successful',
    });

  } catch (error) {
    console.error('MFA verification error:', error);

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
    if (errorMessage.includes('Invalid code') || 
        errorMessage.includes('Code expired')) {
      statusCode = 400;
    }

    return NextResponse.json(
      { 
        error: 'MFA verification failed',
        message: errorMessage,
      },
      { status: statusCode }
    );
  }
}
