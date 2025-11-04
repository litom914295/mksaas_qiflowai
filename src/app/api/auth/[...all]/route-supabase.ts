import { auth } from '@/lib/auth-supabase-integration';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 处理 Better Auth 兼容的路由
export async function POST(
  request: NextRequest,
  { params }: { params: { all: string[] } }
) {
  const path = params.all?.join('/') || '';

  try {
    // 登录请求
    if (path === 'sign-in/email') {
      const body = await request.json();
      const { email, password } = body;

      const result = await auth.api.signIn(email, password);

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }

      const response = NextResponse.json({
        user: result.user,
        session: result.session,
      });

      // 设置 cookie
      if (result.session) {
        response.cookies.set(
          'supabase-auth-token',
          result.session.access_token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          }
        );
      }

      return response;
    }

    // 注册请求
    if (path === 'sign-up/email') {
      const body = await request.json();
      const { email, password, name } = body;

      const result = await auth.api.signUp(email, password, name);

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        user: result.user,
      });
    }

    // 登出请求
    if (path === 'sign-out') {
      await auth.api.signOut();

      const response = NextResponse.json({ success: true });
      response.cookies.delete('supabase-auth-token');

      return response;
    }

    // 其他未实现的路由
    return NextResponse.json({ error: 'Not implemented' }, { status: 404 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { all: string[] } }
) {
  const path = params.all?.join('/') || '';

  try {
    // 获取会话
    if (path === 'session') {
      const result = await auth.api.getSession({
        headers: request.headers,
      });

      if (!result.session) {
        return NextResponse.json({ error: 'No session' }, { status: 401 });
      }

      return NextResponse.json({
        session: result.session,
        user: result.user,
      });
    }

    return NextResponse.json({ error: 'Not implemented' }, { status: 404 });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
