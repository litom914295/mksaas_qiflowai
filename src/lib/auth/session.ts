import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * 简单的权限检查函数
 * 在实际使用中应该根据better-auth的session和角色系统实现
 */
export async function requirePermission(permission: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }

  // 这里应该实现实际的权限检查逻辑
  // 目前简化为只检查是否登录
  return session;
}

export async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}
