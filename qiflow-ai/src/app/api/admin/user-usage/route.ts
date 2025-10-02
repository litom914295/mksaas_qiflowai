import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserUsageRecord {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  responseTimeMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const provider = searchParams.get('provider');
    const model = searchParams.get('model');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // 构建查询条件
    let query = supabase
      .from('ai_usage_metrics')
      .select(
        `
        *,
        users:user_id (
          id,
          email,
          full_name
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (provider) {
      query = query.eq('provider', provider);
    }
    if (model) {
      query = query.eq('model', model);
    }

    const { data, error } = await query;

    if (error) throw error;

    // 转换数据格式
    const records: UserUsageRecord[] =
      data?.map(record => ({
        id: record.id,
        sessionId: record.session_id,
        userId: record.user_id,
        userName: record.users?.full_name || 'Unknown',
        userEmail: record.users?.email || 'Unknown',
        provider: record.provider,
        model: record.model,
        promptTokens: record.prompt_tokens || 0,
        completionTokens: record.completion_tokens || 0,
        totalTokens: record.total_tokens || 0,
        costUsd: record.cost_usd || 0,
        responseTimeMs: record.response_time_ms || 0,
        success: record.success,
        errorMessage: record.error_message,
        createdAt: record.created_at,
        traceId: record.trace_id,
        metadata: record.metadata,
      })) || [];

    // 获取总数用于分页
    let countQuery = supabase
      .from('ai_usage_metrics')
      .select('*', { count: 'exact', head: true });

    if (userId) {
      countQuery = countQuery.eq('user_id', userId);
    }
    if (startDate) {
      countQuery = countQuery.gte('created_at', startDate);
    }
    if (endDate) {
      countQuery = countQuery.lte('created_at', endDate);
    }
    if (provider) {
      countQuery = countQuery.eq('provider', provider);
    }
    if (model) {
      countQuery = countQuery.eq('model', model);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user usage records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user usage records' },
      { status: 500 }
    );
  }
}

// 导出用户使用数据
export async function POST(request: NextRequest) {
  try {
    const { userId, startDate, endDate, format = 'csv' } = await request.json();

    // 获取用户使用记录
    let query = supabase
      .from('ai_usage_metrics')
      .select(
        `
        *,
        users:user_id (
          id,
          email,
          full_name
        )
      `
      )
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeaders = [
        'ID',
        'Session ID',
        'User ID',
        'User Name',
        'User Email',
        'Provider',
        'Model',
        'Prompt Tokens',
        'Completion Tokens',
        'Total Tokens',
        'Cost USD',
        'Response Time (ms)',
        'Success',
        'Error Message',
        'Created At',
        'Trace ID',
      ];

      const csvRows =
        data?.map(record => [
          record.id,
          record.session_id,
          record.user_id,
          record.users?.full_name || 'Unknown',
          record.users?.email || 'Unknown',
          record.provider,
          record.model,
          record.prompt_tokens || 0,
          record.completion_tokens || 0,
          record.total_tokens || 0,
          record.cost_usd || 0,
          record.response_time_ms || 0,
          record.success,
          record.error_message || '',
          record.created_at,
          record.trace_id || '',
        ]) || [];

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="user-usage-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // 返回JSON格式
    return NextResponse.json({
      records:
        data?.map(record => ({
          id: record.id,
          sessionId: record.session_id,
          userId: record.user_id,
          userName: record.users?.full_name || 'Unknown',
          userEmail: record.users?.email || 'Unknown',
          provider: record.provider,
          model: record.model,
          promptTokens: record.prompt_tokens || 0,
          completionTokens: record.completion_tokens || 0,
          totalTokens: record.total_tokens || 0,
          costUsd: record.cost_usd || 0,
          responseTimeMs: record.response_time_ms || 0,
          success: record.success,
          errorMessage: record.error_message,
          createdAt: record.created_at,
          traceId: record.trace_id,
          metadata: record.metadata,
        })) || [],
    });
  } catch (error) {
    console.error('Error exporting user usage data:', error);
    return NextResponse.json(
      { error: 'Failed to export user usage data' },
      { status: 500 }
    );
  }
}
