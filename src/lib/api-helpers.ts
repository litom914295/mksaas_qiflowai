/**
 * API路由辅助函数
 * 提供统一的错误处理和权限检查
 */

import { getDb } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';

/**
 * 统一的API响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 创建成功响应
 */
export function successResponse<T>(data: T, message?: string): Response {
  return Response.json({
    success: true,
    data,
    message,
  } as ApiResponse<T>);
}

/**
 * 创建错误响应
 */
export function errorResponse(
  error: string,
  status = 400,
  details?: any
): Response {
  return Response.json(
    {
      success: false,
      error,
      details,
    } as ApiResponse,
    { status }
  );
}

/**
 * 检查用户是否为管理员
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    if (!userId) return false;

    const db = await getDb();
    const users = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    return users[0]?.role === 'admin';
  } catch (error) {
    console.error('[API Helper] 检查管理员角色失败:', error);
    return false;
  }
}

/**
 * 从请求中提取用户信息
 * 支持多种认证方式
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ userId: string; userRole: string } | null> {
  try {
    // 1. 尝试从session获取（如果使用NextAuth）
    const sessionHeader = request.headers.get('x-user-id');
    const roleHeader = request.headers.get('x-user-role');

    if (sessionHeader) {
      return {
        userId: sessionHeader,
        userRole: roleHeader || 'user',
      };
    }

    // 2. 尝试从Authorization header获取token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // 这里可以添加JWT验证逻辑
      // const decoded = await verifyToken(token);
      // return { userId: decoded.userId, userRole: decoded.role };
    }

    return null;
  } catch (error) {
    console.error('[API Helper] 提取用户信息失败:', error);
    return null;
  }
}

/**
 * API路由包装器 - 提供统一的错误处理和权限检查
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { userId: string; userRole: string; isAdmin: boolean }
  ) => Promise<Response>,
  options?: {
    requireAdmin?: boolean;
    allowAnonymous?: boolean;
  }
) {
  return async (request: NextRequest, routeContext?: any) => {
    try {
      // 提取用户信息
      const userInfo = await getUserFromRequest(request);

      // 检查是否需要认证
      if (!userInfo && !options?.allowAnonymous) {
        return errorResponse('未授权访问', 401);
      }

      // 检查是否需要管理员权限
      const userIsAdmin = userInfo ? await isAdmin(userInfo.userId) : false;
      if (options?.requireAdmin && !userIsAdmin) {
        return errorResponse('需要管理员权限', 403);
      }

      // 调用实际的处理函数
      return await handler(request, {
        userId: userInfo?.userId || '',
        userRole: userInfo?.userRole || 'anonymous',
        isAdmin: userIsAdmin,
      });
    } catch (error) {
      console.error('[API Error]', error);

      // 确保返回JSON而不是HTML
      if (error instanceof Error) {
        return errorResponse(error.message, 500, {
          stack:
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
      }

      return errorResponse('服务器内部错误', 500);
    }
  };
}

/**
 * 验证请求体
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: { parse: (data: any) => T }
): Promise<T | Response> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    return errorResponse(
      '请求参数验证失败',
      400,
      error instanceof Error ? error.message : undefined
    );
  }
}

/**
 * 带积分检查的API包装器
 */
export function withCreditsCheck(
  handler: (
    request: NextRequest,
    context: {
      userId: string;
      userRole: string;
      isAdmin: boolean;
      skipCreditsCheck: boolean;
    }
  ) => Promise<Response>
) {
  return withAuth(async (request, context) => {
    // 管理员跳过积分检查
    const skipCreditsCheck = context.isAdmin;

    if (skipCreditsCheck) {
      console.log('[API] 管理员用户，跳过积分检查');
    }

    return handler(request, { ...context, skipCreditsCheck });
  });
}

/**
 * 带限流检查的API包装器
 */
export function withRateLimit(
  handler: (request: NextRequest, context: any) => Promise<Response>,
  limiter: (
    identifier: string,
    options?: { skipCheck?: boolean }
  ) => Promise<any>
) {
  return withAuth(async (request, context) => {
    // 管理员跳过限流
    if (!context.isAdmin) {
      const result = await limiter(context.userId);
      if (!result.success) {
        return errorResponse(result.message || '请求过于频繁', 429, {
          reset: result.reset,
        });
      }
    } else {
      console.log('[API] 管理员用户，跳过限流检查');
    }

    return handler(request, context);
  });
}
