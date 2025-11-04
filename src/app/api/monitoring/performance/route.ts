/**
 * 性能监控 API
 * GET - 获取性能指标数据
 */

import { verifyAuth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

// 模拟性能数据查询
async function getPerformanceMetrics(params: {
  timeRange?: string;
  metric?: string;
}) {
  const { timeRange = '24h', metric } = params;

  // 系统资源指标
  const systemMetrics = {
    cpu: {
      usage: 45,
      cores: 4,
      loadAverage: [2.1, 2.3, 2.2],
    },
    memory: {
      total: 5368709120, // 5GB in bytes
      used: 3649044480, // 3.4GB
      free: 1719664640,
      percentage: 68,
    },
    responseTime: {
      avg: 420,
      p95: 1200,
      p99: 2500,
    },
    database: {
      connections: {
        active: 12,
        idle: 8,
        total: 20,
      },
      queryTime: {
        avg: 45,
        p95: 180,
        p99: 450,
      },
    },
  };

  // API 端点性能
  const apiPerformance = [
    {
      endpoint: '/api/chat',
      avgTime: 450,
      p95: 1200,
      p99: 2500,
      calls: 15234,
      errors: 23,
      successRate: 99.85,
    },
    {
      endpoint: '/api/divination/bazi',
      avgTime: 850,
      p95: 2100,
      p99: 3800,
      calls: 5432,
      errors: 12,
      successRate: 99.78,
    },
    {
      endpoint: '/api/payment/create',
      avgTime: 320,
      p95: 800,
      p99: 1500,
      calls: 892,
      errors: 2,
      successRate: 99.78,
    },
  ];

  // 数据库查询性能
  const dbQueries = [
    {
      query: 'SELECT * FROM users WHERE email = ?',
      avgTime: 45,
      count: 8234,
      slowest: 450,
      table: 'users',
    },
    {
      query: 'INSERT INTO chat_logs (user_id, message, ...)',
      avgTime: 23,
      count: 15234,
      slowest: 180,
      table: 'chat_logs',
    },
    {
      query: 'UPDATE credits SET balance = balance - ? WHERE user_id = ?',
      avgTime: 67,
      count: 2341,
      slowest: 890,
      table: 'credits',
    },
  ];

  // 性能趋势数据（过去24小时）
  const performanceTrend = Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    responseTime: Math.floor(400 + Math.random() * 200),
    requests: Math.floor(500 + Math.random() * 300),
    errors: Math.floor(Math.random() * 10),
  }));

  return {
    systemMetrics,
    apiPerformance,
    dbQueries,
    performanceTrend,
    timeRange,
  };
}

export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const { authenticated } = await verifyAuth(request as unknown as Request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '24h';
    const metric = searchParams.get('metric') || undefined;

    const data = await getPerformanceMetrics({ timeRange, metric });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
