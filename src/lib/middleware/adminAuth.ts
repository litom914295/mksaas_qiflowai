/**
 * 管理员权限验证中间件
 */

import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';

export type AdminRole = 'admin' | 'superadmin';

export interface AdminAuthOptions {
  requiredRole?: AdminRole;
  logAction?: boolean;
}

/**
 * 验证管理员权限
 */
export async function verifyAdminAuth(
  request: NextRequest,
  options: AdminAuthOptions = {}
) {
  const { requiredRole = 'admin', logAction = true } = options;

  // 获取会话
  const session = await getServerSession(authOptions);

  // 验证登录状态
  if (!session || !session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to continue' },
        { status: 401 }
      ),
    };
  }

  // 验证角色
  const userRole = session.user.role;
  // 对于 NextAuth，只支持 'admin' 和 'user'，superadmin 会被映射为 admin
  const hasPermission = userRole === requiredRole || userRole === 'admin';

  if (!hasPermission) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  // 记录操作日志
  if (logAction) {
    const action = {
      userId: session.user.id,
      email: session.user.email,
      role: userRole,
      method: request.method,
      path: request.nextUrl.pathname,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    };

    // TODO: 保存到数据库
    console.log('Admin action:', action);
  }

  return {
    authorized: true,
    session,
  };
}

/**
 * 创建受保护的 API 处理器
 */
export function withAdminAuth<T>(
  handler: (request: NextRequest, context: { session: any }) => Promise<T>,
  options?: AdminAuthOptions
) {
  return async (request: NextRequest): Promise<T | NextResponse> => {
    const authResult = await verifyAdminAuth(request, options);

    if (!authResult.authorized) {
      return authResult.response as T;
    }

    return handler(request, { session: authResult.session });
  };
}
