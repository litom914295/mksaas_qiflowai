import { signInWithSupabase } from '@/lib/auth-supabase-fallback';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: '请提供邮箱和密码' }, { status: 400 });
    }

    console.log('尝试使用 Supabase Auth 登录:', email);

    const result = await signInWithSupabase(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '登录失败' },
        { status: 401 }
      );
    }

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      user: result.user,
      session: result.session,
    });

    // 设置 Supabase session cookies
    if (result.session) {
      response.cookies.set('supabase-auth-token', result.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error('登录 API 错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
