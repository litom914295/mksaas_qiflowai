import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// 初始化Supabase客户端
function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not found');
  }

  return createClient(supabaseUrl, serviceKey);
}

/**
 * GET /api/admin/ai-cost/dashboard
 * 获取AI成本监控仪表板数据
 */
export async function GET() {
  try {
    // 验证管理员权限
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = initSupabase();

    // 获取今日成本数据
    const today = new Date().toISOString().split('T')[0];
    const { data: dailyData, error: dailyError } = await supabase
      .from('ai_cost_tracking')
      .select('cost_usd, model')
      .gte('created_at', today + 'T00:00:00.000Z')
      .lt('created_at', today + 'T23:59:59.999Z');

    if (dailyError) throw dailyError;

    // 获取本月成本数据
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();

    const { data: monthlyData, error: monthlyError } = await supabase
      .from('ai_cost_tracking')
      .select('cost_usd, model, created_at')
      .gte('created_at', monthStart);

    if (monthlyError) throw monthlyError;

    // 获取昨日成本（用于计算日变化）
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];
    const { data: yesterdayData } = await supabase
      .from('ai_cost_tracking')
      .select('cost_usd')
      .gte('created_at', yesterday + 'T00:00:00.000Z')
      .lt('created_at', yesterday + 'T23:59:59.999Z');

    // 计算统计数据
    const dailyUsed = dailyData?.reduce((sum, r) => sum + r.cost_usd, 0) || 0;
    const monthlyUsed =
      monthlyData?.reduce((sum, r) => sum + r.cost_usd, 0) || 0;
    const yesterdayUsed =
      yesterdayData?.reduce((sum, r) => sum + r.cost_usd, 0) || 0;

    // 预算限制（从配置读取，这里使用默认值）
    const dailyLimit = 50; // $50/day
    const monthlyLimit = 1000; // $1000/month

    const dailyPercentage = (dailyUsed / dailyLimit) * 100;
    const monthlyPercentage = (monthlyUsed / monthlyLimit) * 100;

    // 计算日变化
    const dailyChange =
      yesterdayUsed > 0 ? (dailyUsed - yesterdayUsed) / yesterdayUsed : 0;

    // 月度预测（基于当前进度）
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    const daysPassed = new Date().getDate();
    const monthlyProjection = (monthlyUsed / daysPassed) * daysInMonth;

    // 统计各模型使用情况
    const modelStats = new Map<string, { requests: number; cost: number }>();
    monthlyData?.forEach((record) => {
      const model = record.model || 'unknown';
      const current = modelStats.get(model) || { requests: 0, cost: 0 };
      modelStats.set(model, {
        requests: current.requests + 1,
        cost: current.cost + record.cost_usd,
      });
    });

    // 转换为数组并排序
    const topModels = Array.from(modelStats.entries())
      .map(([model, stats]) => ({
        model,
        requests: stats.requests,
        cost: stats.cost,
        percentage: (stats.cost / monthlyUsed) * 100,
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    const responseData = {
      daily: {
        used: dailyUsed,
        limit: dailyLimit,
        remaining: Math.max(0, dailyLimit - dailyUsed),
        percentage: dailyPercentage,
      },
      monthly: {
        used: monthlyUsed,
        limit: monthlyLimit,
        remaining: Math.max(0, monthlyLimit - monthlyUsed),
        percentage: monthlyPercentage,
      },
      nearLimit: dailyPercentage > 80 || monthlyPercentage > 80,
      overLimit: dailyPercentage >= 100 || monthlyPercentage >= 100,
      trends: {
        dailyChange,
        monthlyProjection,
      },
      topModels,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error('AI Cost Dashboard Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch cost data',
      },
      { status: 500 }
    );
  }
}
