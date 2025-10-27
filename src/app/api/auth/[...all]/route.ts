import { addRegisterGiftCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

// 强制使用 Node.js 运行时，避免 Edge 下的 chunk 丢失问题
export const runtime = 'nodejs';

// 处理 Better Auth 兼容的路由
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const { all } = await params;
  const path = all?.join('/') || '';

  try {
    // 登录请求
    if (path === 'sign-in/email') {
      // 检查 Content-Type
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
      }

      // 安全解析 JSON,防止空 body 错误
      let body: any;
      try {
        body = await request.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        );
      }

      if (!body || !body.email || !body.password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const { email, password } = body;

      const result = await auth.api.signIn(email, password);

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }

      // 初始化用户积分（如果还没有） - 后台异步执行，避免阻塞登录
      if (result.user?.id) {
        try {
          setTimeout(() => {
            addRegisterGiftCredits(result.user!.id).catch((error) => {
              console.error('Failed to add register gift credits:', error);
            });
          }, 0);
        } catch (error) {
          console.error('Failed to schedule register gift credits:', error);
        }
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
      // 检查 Content-Type
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
      }

      // 安全解析 JSON
      let body: any;
      try {
        body = await request.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return NextResponse.json(
          { error: 'Invalid request body' },
          { status: 400 }
        );
      }

      if (!body || !body.email || !body.password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      const { email, password, name } = body;

      const result = await auth.api.signUp(email, password, name);

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      // 初始化新用户积分
      if (result.user?.id) {
        try {
          await addRegisterGiftCredits(result.user.id);
        } catch (error) {
          console.error('Failed to add register gift credits:', error);
          // 不阻塞注册流程
        }
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
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  const { all } = await params;
  const path = all?.join('/') || '';

  try {
    // 获取会话
    if (path === 'session' || path === '') {
      const result = await auth.api.getSession({
        headers: request.headers,
      });

      // 即使没有会话也返回 200，让客户端处理 null 值
      return NextResponse.json({
        session: result.session || null,
        user: result.user || null,
      });
    }

    return NextResponse.json({ error: 'Not implemented' }, { status: 404 });
  } catch (error) {
    console.error('Auth API GET error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
