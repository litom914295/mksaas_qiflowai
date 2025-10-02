import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UsageAnalytics {
  totalUsers: number;
  totalSessions: number;
  totalCost: number;
  totalTokens: number;
  averageResponseTime: number;
  successRate: number;
  dailyStats: Array<{
    date: string;
    users: number;
    sessions: number;
    cost: number;
    tokens: number;
  }>;
  providerStats: Array<{
    provider: string;
    count: number;
    cost: number;
    tokens: number;
    avgResponseTime: number;
  }>;
  modelStats: Array<{
    model: string;
    provider: string;
    count: number;
    cost: number;
    tokens: number;
    avgResponseTime: number;
  }>;
  userStats: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    sessions: number;
    cost: number;
    tokens: number;
    lastActive: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate =
      searchParams.get('startDate') ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const limit = parseInt(searchParams.get('limit') || '100');

    // 获取基础统计数据
    const { data: totalStats, error: totalError } = await supabase
      .from('ai_usage_metrics')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (totalError) throw totalError;

    // 计算总体统计
    const totalUsers = new Set(
      totalStats?.map(record => record.user_id).filter(Boolean) || []
    ).size;
    const totalSessions = new Set(
      totalStats?.map(record => record.session_id) || []
    ).size;
    const totalCost =
      totalStats?.reduce((sum, record) => sum + (record.cost_usd || 0), 0) || 0;
    const totalTokens =
      totalStats?.reduce(
        (sum, record) => sum + (record.total_tokens || 0),
        0
      ) || 0;
    const averageResponseTime =
      totalStats?.reduce(
        (sum, record) => sum + (record.response_time_ms || 0),
        0
      ) / (totalStats?.length || 1) || 0;
    const successCount =
      totalStats?.filter(record => record.success).length || 0;
    const successRate = totalStats?.length
      ? (successCount / totalStats.length) * 100
      : 0;

    // 获取每日统计
    const dailyStats = await getDailyStats(startDate, endDate);

    // 获取提供商统计
    const providerStats = await getProviderStats(startDate, endDate);

    // 获取模型统计
    const modelStats = await getModelStats(startDate, endDate);

    // 获取用户统计
    const userStats = await getUserStats(startDate, endDate, limit);

    const analytics: UsageAnalytics = {
      totalUsers,
      totalSessions,
      totalCost,
      totalTokens,
      averageResponseTime,
      successRate,
      dailyStats,
      providerStats,
      modelStats,
      userStats,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage analytics' },
      { status: 500 }
    );
  }
}

async function getDailyStats(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('ai_usage_metrics')
    .select('created_at, user_id, session_id, cost_usd, total_tokens')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // 按日期分组统计
  const dailyMap = new Map<
    string,
    {
      users: Set<string>;
      sessions: Set<string>;
      cost: number;
      tokens: number;
    }
  >();

  data?.forEach(record => {
    const date = record.created_at.split('T')[0];
    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        users: new Set(),
        sessions: new Set(),
        cost: 0,
        tokens: 0,
      });
    }

    const dayData = dailyMap.get(date)!;
    if (record.user_id) dayData.users.add(record.user_id);
    if (record.session_id) dayData.sessions.add(record.session_id);
    dayData.cost += record.cost_usd || 0;
    dayData.tokens += record.total_tokens || 0;
  });

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    users: data.users.size,
    sessions: data.sessions.size,
    cost: data.cost,
    tokens: data.tokens,
  }));
}

async function getProviderStats(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('ai_usage_metrics')
    .select('provider, cost_usd, total_tokens, response_time_ms')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) throw error;

  const providerMap = new Map<
    string,
    {
      count: number;
      cost: number;
      tokens: number;
      responseTimes: number[];
    }
  >();

  data?.forEach(record => {
    if (!providerMap.has(record.provider)) {
      providerMap.set(record.provider, {
        count: 0,
        cost: 0,
        tokens: 0,
        responseTimes: [],
      });
    }

    const providerData = providerMap.get(record.provider)!;
    providerData.count++;
    providerData.cost += record.cost_usd || 0;
    providerData.tokens += record.total_tokens || 0;
    if (record.response_time_ms) {
      providerData.responseTimes.push(record.response_time_ms);
    }
  });

  return Array.from(providerMap.entries()).map(([provider, data]) => ({
    provider,
    count: data.count,
    cost: data.cost,
    tokens: data.tokens,
    avgResponseTime: data.responseTimes.length
      ? data.responseTimes.reduce((sum, time) => sum + time, 0) /
        data.responseTimes.length
      : 0,
  }));
}

async function getModelStats(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('ai_usage_metrics')
    .select('provider, model, cost_usd, total_tokens, response_time_ms')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) throw error;

  const modelMap = new Map<
    string,
    {
      provider: string;
      count: number;
      cost: number;
      tokens: number;
      responseTimes: number[];
    }
  >();

  data?.forEach(record => {
    const key = `${record.provider}:${record.model}`;
    if (!modelMap.has(key)) {
      modelMap.set(key, {
        provider: record.provider,
        count: 0,
        cost: 0,
        tokens: 0,
        responseTimes: [],
      });
    }

    const modelData = modelMap.get(key)!;
    modelData.count++;
    modelData.cost += record.cost_usd || 0;
    modelData.tokens += record.total_tokens || 0;
    if (record.response_time_ms) {
      modelData.responseTimes.push(record.response_time_ms);
    }
  });

  return Array.from(modelMap.entries()).map(([key, data]) => ({
    model: key.split(':')[1],
    provider: data.provider,
    count: data.count,
    cost: data.cost,
    tokens: data.tokens,
    avgResponseTime: data.responseTimes.length
      ? data.responseTimes.reduce((sum, time) => sum + time, 0) /
        data.responseTimes.length
      : 0,
  }));
}

async function getUserStats(startDate: string, endDate: string, limit: number) {
  // 获取用户使用统计
  const { data: usageData, error: usageError } = await supabase
    .from('ai_usage_metrics')
    .select('user_id, session_id, cost_usd, total_tokens, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .not('user_id', 'is', null);

  if (usageError) throw usageError;

  // 按用户分组统计
  const userMap = new Map<
    string,
    {
      sessions: Set<string>;
      cost: number;
      tokens: number;
      lastActive: string;
    }
  >();

  usageData?.forEach(record => {
    if (!userMap.has(record.user_id)) {
      userMap.set(record.user_id, {
        sessions: new Set(),
        cost: 0,
        tokens: 0,
        lastActive: record.created_at,
      });
    }

    const userData = userMap.get(record.user_id)!;
    if (record.session_id) userData.sessions.add(record.session_id);
    userData.cost += record.cost_usd || 0;
    userData.tokens += record.total_tokens || 0;
    if (record.created_at > userData.lastActive) {
      userData.lastActive = record.created_at;
    }
  });

  // 获取用户详细信息
  const userIds = Array.from(userMap.keys()).slice(0, limit);
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, email, full_name')
    .in('id', userIds);

  if (usersError) throw usersError;

  // 合并数据
  return userIds.map(userId => {
    const userData = userMap.get(userId)!;
    const userInfo = usersData?.find(u => u.id === userId);

    return {
      userId,
      userName: userInfo?.full_name || 'Unknown',
      userEmail: userInfo?.email || 'Unknown',
      sessions: userData.sessions.size,
      cost: userData.cost,
      tokens: userData.tokens,
      lastActive: userData.lastActive,
    };
  });
}
