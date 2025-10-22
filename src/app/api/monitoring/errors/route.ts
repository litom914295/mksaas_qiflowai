/**
 * 错误监控 API
 * GET - 获取错误列表
 */

import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { type NextRequest, NextResponse } from 'next/server';

// 模拟数据库查询 - 实际项目中应从数据库或 Sentry 获取
async function getErrors(params: {
  page?: number;
  limit?: number;
  level?: string;
  status?: string;
  search?: string;
}) {
  const { page = 1, limit = 20, level, status, search } = params;

  // 模拟错误数据
  const mockErrors = [
    {
      id: '1',
      message: 'Database connection timeout',
      level: 'error',
      status: 'unresolved',
      count: 15,
      firstSeen: '2025-10-13T02:15:30Z',
      lastSeen: '2025-10-13T14:30:25Z',
      environment: 'production',
      culprit: 'api/divination/bazi',
      tags: { browser: 'Chrome', os: 'Windows' },
    },
    {
      id: '2',
      message: 'OpenAI API rate limit exceeded',
      level: 'warning',
      status: 'unresolved',
      count: 8,
      firstSeen: '2025-10-13T10:20:15Z',
      lastSeen: '2025-10-13T14:25:10Z',
      environment: 'production',
      culprit: 'api/chat/completion',
      tags: { service: 'openai' },
    },
  ];

  // 应用过滤
  let filtered = mockErrors;
  if (level) {
    filtered = filtered.filter((e) => e.level === level);
  }
  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  }
  if (search) {
    filtered = filtered.filter(
      (e) =>
        e.message.toLowerCase().includes(search.toLowerCase()) ||
        e.culprit.toLowerCase().includes(search.toLowerCase())
    );
  }

  return {
    errors: filtered,
    total: filtered.length,
    page,
    limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '20');
    const level = searchParams.get('level') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await getErrors({ page, limit, level, status, search });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching monitoring errors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
