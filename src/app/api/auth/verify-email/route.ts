import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = verifyEmailSchema.parse(body);
    
    const supabase = createClient();
    
    // 使用 Supabase 的内置邮箱验证
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });
    
    if (error) {
      console.error('Email verification error:', error);
      return NextResponse.json(
        { error: error.message || 'Verification failed' },
        { status: 400 }
      );
    }
    
    // 更新用户的 email_verified 状态
    if (data.user) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          email_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', data.user.id);
      
      if (updateError) {
        console.error('Failed to update user verification status:', updateError);
      }
      
      // 记录验证事件
      await supabase.from('audit_logs').insert({
        user_id: data.user.id,
        action: 'email_verified',
        metadata: { email: data.user.email },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      user: data.user,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}