/**
 * Supabase Auth Fallback
 *
 * 临时解决方案：当 Better Auth 数据库连接失败时，
 * 使用 Supabase Auth 进行认证
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 使用 Supabase Auth 登录
 */
export async function signInWithSupabase(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase 登录失败:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error('Supabase 登录异常:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '登录失败',
    };
  }
}

/**
 * 获取当前用户会话
 */
export async function getSupabaseSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * 登出
 */
export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase 登出失败:', error);
    return false;
  }
  return true;
}
