import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from './auth.config';

export interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: 'user' | 'admin' | undefined;
    permissions: string[];
  };
}

/**
 * 获取当前会话
 */
export async function getCurrentSession(): Promise<ExtendedSession | null> {
  const session = await getServerSession(authOptions);
  return session as ExtendedSession | null;
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session?.user;
}

/**
 * 获取当前用户ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id || null;
}

/**
 * 检查用户是否有指定权限
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session) return false;

  const { role, permissions } = session.user;

  // 管理员拥有所有权限（superadmin 已被映射为 admin）
  if (role === 'admin') return true;

  // 检查具体权限
  return permissions.includes(permission) || permissions.includes('*');
}

/**
 * 检查用户是否有多个权限之一
 */
export async function hasAnyPermission(
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await hasPermission(permission)) {
      return true;
    }
  }
  return false;
}

/**
 * 检查用户是否有所有指定权限
 */
export async function hasAllPermissions(
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await hasPermission(permission))) {
      return false;
    }
  }
  return true;
}

/**
 * 检查用户角色
 */
export async function hasRole(role: string): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session) return false;

  return session.user.role === role;
}

/**
 * 检查用户是否有多个角色之一
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  const session = await getCurrentSession();
  if (!session) return false;

  return session.user.role ? roles.includes(session.user.role) : false;
}

/**
 * 获取用户的活动会话
 */
export async function getUserSessions(userId: string) {
  const sessions = await (prisma as any).session.findMany({
    where: {
      userId,
      expires: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      sessionToken: true,
      expires: true,
      createdAt: true,
      ipAddress: true,
      userAgent: true,
      device: true,
    },
  });

  return sessions.map((session: any) => ({
    id: session.id,
    token: session.sessionToken.substring(0, 8) + '...',
    expires: session.expires,
    createdAt: session.createdAt,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    device: session.device || 'Unknown',
    isCurrent: false, // TODO: 标记当前会话
  }));
}

/**
 * 撤销指定会话
 */
export async function revokeSession(
  sessionId: string,
  userId?: string
): Promise<boolean> {
  try {
    const where = userId ? { id: sessionId, userId } : { id: sessionId };

    await (prisma as any).session.delete({ where });
    return true;
  } catch (error) {
    console.error('撤销会话失败:', error);
    return false;
  }
}

/**
 * 撤销用户的所有会话
 */
export async function revokeAllUserSessions(
  userId: string,
  exceptSessionId?: string
): Promise<number> {
  const where = exceptSessionId
    ? { userId, id: { not: exceptSessionId } }
    : { userId };

  const result = await (prisma as any).session.deleteMany({ where });
  return result.count;
}

/**
 * 清理过期会话
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await (prisma as any).session.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });
  return result.count;
}

/**
 * 记录会话活动
 */
export async function recordSessionActivity(
  sessionToken: string,
  activity: {
    action: string;
    resource?: string;
    metadata?: any;
  }
): Promise<void> {
  const session = await (prisma as any).session.findUnique({
    where: { sessionToken },
  });

  if (!session) return;

  await (prisma as any).activityLog.create({
    data: {
      userId: session.userId,
      sessionId: session.id,
      action: activity.action,
      resource: activity.resource,
      metadata: activity.metadata,
      timestamp: new Date(),
    },
  });
}

/**
 * 获取会话统计
 */
export async function getSessionStats(userId?: string) {
  const where = userId ? { userId } : {};

  const [total, active, expired] = await Promise.all([
    (prisma as any).session.count({ where }),
    (prisma as any).session.count({
      where: { ...where, expires: { gt: new Date() } },
    }),
    (prisma as any).session.count({
      where: { ...where, expires: { lte: new Date() } },
    }),
  ]);

  return {
    total,
    active,
    expired,
  };
}

/**
 * 延长会话期限
 */
export async function extendSession(
  sessionToken: string,
  days = 30
): Promise<boolean> {
  try {
    const newExpires = new Date();
    newExpires.setDate(newExpires.getDate() + days);

    await (prisma as any).session.update({
      where: { sessionToken },
      data: { expires: newExpires },
    });

    return true;
  } catch (error) {
    console.error('延长会话失败:', error);
    return false;
  }
}

/**
 * 验证会话权限（用于API路由）
 */
export async function requireAuth(): Promise<ExtendedSession> {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error('未授权：请先登录');
  }

  return session;
}

/**
 * 验证会话权限（需要特定权限）
 */
export async function requirePermission(
  permission: string
): Promise<ExtendedSession> {
  const session = await requireAuth();

  if (!(await hasPermission(permission))) {
    throw new Error(`未授权：缺少权限 ${permission}`);
  }

  return session;
}

/**
 * 验证会话权限（需要特定角色）
 */
export async function requireRole(role: string): Promise<ExtendedSession> {
  const session = await requireAuth();

  if (!(await hasRole(role))) {
    throw new Error(`未授权：需要角色 ${role}`);
  }

  return session;
}
