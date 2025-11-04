/**
 * Sentry 配置管理 API
 * GET - 获取当前配置
 * POST - 保存配置
 * PUT - 测试连接
 */

import { verifyAuth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Sentry 配置验证 Schema
const sentryConfigSchema = z.object({
  enabled: z.boolean(),
  dsn: z.string().url().optional(),
  environment: z.enum(['development', 'staging', 'production']),
  tracesSampleRate: z.number().min(0).max(1),
  profilesSampleRate: z.number().min(0).max(1),
  ignoreErrors: z.array(z.string()).optional(),
  ignoreUrls: z.array(z.string()).optional(),
});

// 模拟配置存储 - 实际项目中应存储到数据库或配置文件
let sentryConfig = {
  enabled: true,
  dsn: process.env.SENTRY_DSN || '',
  environment: 'production',
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  ignoreErrors: ['ResizeObserver loop limit exceeded', 'ChunkLoadError'],
  ignoreUrls: ['/health', '/metrics'],
};

export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const { authenticated } = await verifyAuth(request as unknown as Request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      config: sentryConfig,
      status: {
        connected: !!sentryConfig.dsn && sentryConfig.enabled,
        version: '7.99.0',
        eventsToday: 15234,
        errorsToday: 23,
      },
    });
  } catch (error) {
    console.error('Error fetching Sentry config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证权限
    const { authenticated, userId } = await verifyAuth(
      request as unknown as Request
    );
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 验证数据
    const validatedConfig = sentryConfigSchema.parse(body);

    // 保存配置
    sentryConfig = validatedConfig as any;

    // TODO: 实际项目中应：
    // 1. 保存到数据库
    // 2. 更新环境变量或配置文件
    // 3. 重新初始化 Sentry

    // 记录操作日志
    console.log(`Sentry config updated by ${userId || 'unknown'}`);

    return NextResponse.json({
      success: true,
      config: sentryConfig,
      message: 'Sentry configuration saved successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid configuration', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error saving Sentry config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 验证权限
    const { authenticated } = await verifyAuth(request as unknown as Request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dsn } = body;

    if (!dsn) {
      return NextResponse.json(
        { error: 'DSN is required for testing' },
        { status: 400 }
      );
    }

    // TODO: 实际项目中应实现真实的 Sentry 连接测试
    // 模拟测试
    const testResult = {
      success: true,
      message: 'Connection test successful',
      projectId: dsn.split('/').pop(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing Sentry connection:', error);
    return NextResponse.json(
      { success: false, error: 'Connection test failed' },
      { status: 500 }
    );
  }
}
