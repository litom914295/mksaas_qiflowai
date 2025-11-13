/**
 * Phase 8 Step 6: 月度运势自动生成 API 路由
 *
 * 路由: POST /api/cron/generate-monthly-fortunes
 *
 * 功能：
 * 1. 接收 Vercel Cron 触发请求
 * 2. 验证授权密钥（防止未授权调用）
 * 3. 执行批量生成任务
 * 4. 返回执行结果
 *
 * Vercel Cron 配置 (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/generate-monthly-fortunes",
 *     "schedule": "0 2 1 * *"
 *   }]
 * }
 */

import {
  generateFortuneForUser,
  generateMonthlyFortunesForAllProUsers,
} from '@/cron/generate-monthly-fortunes';
import { type NextRequest, NextResponse } from 'next/server';

// ==================== 主处理函数 ====================

export async function POST(request: NextRequest) {
  try {
    // 1. 验证授权密钥
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 如果设置了 CRON_SECRET，则进行验证
    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        console.error('[Cron API] Unauthorized request');
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      console.warn(
        '[Cron API] No CRON_SECRET set, skipping authorization check'
      );
    }

    console.log('[Cron API] Authorized, starting batch generation...');

    // 2. 执行批量生成
    const result = await generateMonthlyFortunesForAllProUsers();

    // 3. 返回结果
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: {
            totalUsers: result.totalUsers,
            successCount: result.successCount,
            failureCount: result.failureCount,
            skippedCount: result.skippedCount,
            executionTime: result.executionTime,
          },
        },
        { status: 200 }
      );
    } else {
      // 部分失败或完全失败
      return NextResponse.json(
        {
          success: false,
          data: {
            totalUsers: result.totalUsers,
            successCount: result.successCount,
            failureCount: result.failureCount,
            skippedCount: result.skippedCount,
            executionTime: result.executionTime,
            errors: result.errors,
          },
        },
        { status: 207 } // 207 Multi-Status
      );
    }
  } catch (error) {
    console.error('[Cron API] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==================== 手动触发（仅用于测试） ====================

export async function GET(request: NextRequest) {
  try {
    // 仅在开发环境允许 GET 请求
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { success: false, error: 'Method not allowed in production' },
        { status: 405 }
      );
    }

    // 从查询参数获取用户 ID（可选）
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (userId) {
      // 单用户测试
      const result = await generateFortuneForUser({ userId });
      return NextResponse.json(result);
    } else {
      // 批量生成测试
      const result = await generateMonthlyFortunesForAllProUsers();
      return NextResponse.json({
        success: result.success,
        totalUsers: result.totalUsers,
        successCount: result.successCount,
        failureCount: result.failureCount,
        skippedCount: result.skippedCount,
        executionTime: result.executionTime,
        errors: result.errors,
      });
    }
  } catch (error) {
    console.error('[Cron API] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ==================== OPTIONS (CORS 预检) ====================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        Allow: 'POST, GET, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    }
  );
}
