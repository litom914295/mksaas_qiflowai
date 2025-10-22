/**
 * Supabase Auth Integration
 *
 * 完整替代 Better Auth 的解决方案
 * 保持与原有 API 接口兼容
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 创建 Supabase 客户端（用于服务器端）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 创建 Supabase 客户端（用于客户端）
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 兼容 Better Auth 的 auth 对象
 */
export const auth = {
  api: {
    // 登录
    async signIn(email: string, password: string) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          error: error.message,
          user: null,
          session: null,
        };
      }

      // 同步到 user 表
      if (data.user) {
        await syncUserToTable(data.user);
      }

      return {
        error: null,
        user: data.user,
        session: data.session,
      };
    },

    // 注册
    async signUp(email: string, password: string, name?: string) {
      const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        return {
          error: error.message,
          user: null,
        };
      }

      // 同步到 user 表
      if (data.user) {
        await syncUserToTable(data.user);
      }

      return {
        error: null,
        user: data.user,
      };
    },

    // 登出
    async signOut() {
      const { error } = await supabaseAdmin.auth.signOut();
      return { error: error?.message || null };
    },

    // 获取会话
    async getSession(options?: { headers?: Headers }) {
      // 从 cookies 或 headers 中获取 token
      let token = null;

      if (options?.headers) {
        const authHeader = options.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token && typeof window === 'undefined') {
        // 服务器端：从 cookies 获取
        const cookieStore = await cookies();
        token = cookieStore.get('supabase-auth-token')?.value;
      }

      if (!token) {
        // 使用 Supabase 客户端获取
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        if (session) {
          token = session.access_token;
        }
      }

      if (!token) {
        return { session: null, user: null };
      }

      // 验证 token
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return { session: null, user: null };
      }

      // 从 user 表获取额外信息
      const userInfo = await getUserFromTable(user.id);

      return {
        session: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
        user: {
          ...user,
          ...userInfo,
        },
      };
    },
  },
};

/**
 * 同步用户到 user 表
 */
async function syncUserToTable(authUser: any) {
  try {
    const { data: existingUser } = await supabaseAdmin
      .from('user')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!existingUser) {
      // 创建新用户记录
      await supabaseAdmin.from('user').insert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
        email_verified: !!authUser.email_confirmed_at,
        role: authUser.email === 'admin@mksaas.com' ? 'admin' : 'user',
        created_at: authUser.created_at,
        updated_at: new Date().toISOString(),
      });
    } else {
      // 更新现有记录
      await supabaseAdmin
        .from('user')
        .update({
          email_verified: !!authUser.email_confirmed_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);
    }
  } catch (error) {
    console.error('同步用户到表失败:', error);
  }
}

/**
 * 从 user 表获取用户信息
 */
async function getUserFromTable(userId: string) {
  try {
    const { data } = await supabaseAdmin
      .from('user')
      .select('*')
      .eq('id', userId)
      .single();

    return data || {};
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {};
  }
}

/**
 * 验证认证（兼容 Better Auth）
 */
export async function verifyAuth(request: Request): Promise<{
  authenticated: boolean;
  userId: string | null;
}> {
  try {
    const result = await auth.api.getSession({ headers: request.headers });

    if (!result.session || !result.user) {
      return { authenticated: false, userId: null };
    }

    return {
      authenticated: true,
      userId: result.user.id,
    };
  } catch (error) {
    console.error('verifyAuth error:', error);
    return { authenticated: false, userId: null };
  }
}

/**
 * 中间件：保护路由
 */
export async function requireAuth(request: Request) {
  const { authenticated, userId } = await verifyAuth(request);

  if (!authenticated) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return { userId };
}

// 导出类型（兼容 Better Auth）
export type User = {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  role?: string;
  customerId?: string;
  banned?: boolean;
};

export type Session = {
  userId: string;
  token: string;
  expiresAt: Date;
};
