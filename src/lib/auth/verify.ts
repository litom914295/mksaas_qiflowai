import { auth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

/**
 * 验证请求的身份认证状态
 * @param request Next.js 请求对象
 * @returns 用户ID或null
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return session?.user?.id || null;
  } catch (error) {
    console.error('验证身份失败:', error);
    return null;
  }
}

/**
 * 验证请求并要求必须登录
 * @param request Next.js 请求对象
 * @returns 用户ID
 * @throws 如果未登录则抛出错误
 */
export async function requireAuth(request: NextRequest): Promise<string> {
  const userId = await verifyAuth(request);
  
  if (!userId) {
    throw new Error('未授权:请先登录');
  }
  
  return userId;
}
