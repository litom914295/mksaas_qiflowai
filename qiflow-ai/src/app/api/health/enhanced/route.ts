/**
 * QiFlow AI - 系统健康检查API
 *
 * 提供全面的系统健康状态监控，包括数据库、Redis、AI服务等
 */

import { checkDatabaseHealth } from '@/lib/database/supabase-server';
import { RedisConnection } from '@/lib/redis/connection';
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
} from '@/types/api-errors';
import { NextRequest, NextResponse } from 'next/server';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      metrics: any;
      error?: string;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      metrics: any;
      error?: string;
    };
    stateMachine: {
      status: 'healthy' | 'unhealthy';
      metrics: any;
    };
  };
  summary: {
    totalChecks: number;
    healthyServices: number;
    unhealthyServices: number;
    overallHealth: number; // 0-1
  };
}

/**
 * GET /api/health
 * 系统健康检查
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  try {
    console.log('[HealthAPI] Starting health check:', {
      requestId,
      timestamp: new Date().toISOString(),
    });

    // 并行执行所有健康检查
    const [databaseHealth, redisHealth] = await Promise.allSettled([
      checkDatabaseHealth(),
      RedisConnection.testConnection(),
    ]);

    // 构建响应
    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime() * 1000,
      services: {
        database: {
          status: 'unhealthy',
          responseTime: 0,
          metrics: {},
        },
        redis: {
          status: 'unhealthy',
          responseTime: 0,
          metrics: {},
        },
        stateMachine: {
          status: 'healthy',
          metrics: {
            note: 'State machine health check not implemented in this version',
          },
        },
      },
      summary: {
        totalChecks: 0,
        healthyServices: 0,
        unhealthyServices: 0,
        overallHealth: 0,
      },
    };

    // 处理数据库健康检查结果
    if (databaseHealth.status === 'fulfilled' && databaseHealth.value.healthy) {
      response.services.database = {
        status: 'healthy',
        responseTime: 0, // 可以从metrics中获取
        metrics: (databaseHealth.value as any).metrics || {},
      };
    } else {
      const error =
        databaseHealth.status === 'rejected'
          ? databaseHealth.reason?.message || '数据库检查失败'
          : databaseHealth.value.error || '数据库不健康';

      response.services.database = {
        status: 'unhealthy',
        responseTime: 0,
        metrics:
          databaseHealth.status === 'fulfilled'
            ? (databaseHealth.value as any).metrics || {}
            : {},
        error,
      };
    }

    // 处理Redis健康检查结果
    if (redisHealth.status === 'fulfilled' && redisHealth.value.success) {
      const redisMetrics = await RedisConnection.getHealthStatus();
      response.services.redis = {
        status: 'healthy',
        responseTime: redisHealth.value.responseTime,
        metrics: redisMetrics,
      };
    } else {
      const error =
        redisHealth.status === 'rejected'
          ? redisHealth.reason?.message || 'Redis检查失败'
          : redisHealth.value.error || 'Redis不健康';

      const redisMetrics = await RedisConnection.getHealthStatus().catch(
        () => ({})
      );
      response.services.redis = {
        status: 'unhealthy',
        responseTime:
          redisHealth.status === 'fulfilled'
            ? redisHealth.value.responseTime
            : 0,
        metrics: redisMetrics,
        error,
      };
    }

    // 计算总体健康状态
    const services = Object.values(response.services);
    response.summary.totalChecks = services.length;
    response.summary.healthyServices = services.filter(
      s => s.status === 'healthy'
    ).length;
    response.summary.unhealthyServices = services.filter(
      s => s.status === 'unhealthy'
    ).length;
    response.summary.overallHealth =
      response.summary.healthyServices / response.summary.totalChecks;

    // 确定总体状态
    if (response.summary.overallHealth === 1) {
      response.status = 'healthy';
    } else if (response.summary.overallHealth >= 0.5) {
      response.status = 'degraded';
    } else {
      response.status = 'unhealthy';
    }

    const statusCode =
      response.status === 'healthy'
        ? 200
        : response.status === 'degraded'
          ? 200
          : 503;

    console.log('[HealthAPI] Health check completed:', {
      requestId,
      status: response.status,
      overallHealth: response.summary.overallHealth,
      executionTime: Date.now() - startTime,
    });

    return NextResponse.json(
      createSuccessResponse(response, requestId, Date.now() - startTime),
      { status: statusCode }
    );
  } catch (error) {
    console.error('[HealthAPI] Health check failed:', {
      requestId,
      error: error instanceof Error ? error.message : error,
      executionTime: Date.now() - startTime,
    });

    return NextResponse.json(
      createErrorResponse(
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '健康检查失败',
          details: {
            originalError: error instanceof Error ? error.message : '未知错误',
            executionTime: Date.now() - startTime,
          },
        },
        requestId,
        '/api/health'
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/health/reset
 * 重置系统连接（仅在开发环境可用）
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `health_reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // 只在开发环境允许重置
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        createErrorResponse(
          {
            code: ErrorCode.PERMISSION_DENIED,
            message: '生产环境不允许重置系统连接',
          },
          requestId,
          '/api/health/reset'
        ),
        { status: 403 }
      );
    }

    console.log('[HealthAPI] Resetting system connections:', { requestId });

    // 重置Redis连接
    await RedisConnection.resetConnection();

    // 重置数据库连接
    const { resetDatabaseConnection } = (await import(
      '@/lib/database/supabase-server'
    )) as any;
    await resetDatabaseConnection();

    return NextResponse.json(
      createSuccessResponse(
        {
          message: '系统连接已重置',
          timestamp: new Date().toISOString(),
        },
        requestId
      )
    );
  } catch (error) {
    console.error('[HealthAPI] Reset failed:', {
      requestId,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      createErrorResponse(
        {
          code: ErrorCode.INTERNAL_SERVER_ERROR,
          message: '重置系统连接失败',
          details: {
            originalError: error instanceof Error ? error.message : '未知错误',
          },
        },
        requestId,
        '/api/health/reset'
      ),
      { status: 500 }
    );
  }
}
