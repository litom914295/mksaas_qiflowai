import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not found');
  }

  return createClient(supabaseUrl, serviceKey);
}

/**
 * POST /api/admin/ai-cost/export
 * 导出AI成本数据为CSV格式
 */
export async function POST() {
  try {
    // 验证管理员权限
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = initSupabase();

    // 获取本月所有成本记录
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();

    const { data, error } = await supabase
      .from('ai_cost_tracking')
      .select('*')
      .gte('created_at', monthStart)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 生成CSV内容
    const csvHeaders = [
      'Date',
      'Time',
      'User ID',
      'Model',
      'Prompt Tokens',
      'Completion Tokens',
      'Total Tokens',
      'Cost (USD)',
      'Request Type',
    ].join(',');

    const csvRows = (data || []).map((record) => {
      const date = new Date(record.created_at);
      return [
        date.toISOString().split('T')[0],
        date.toISOString().split('T')[1].split('.')[0],
        record.user_id || 'N/A',
        record.model || 'N/A',
        record.prompt_tokens || 0,
        record.completion_tokens || 0,
        record.total_tokens || 0,
        record.cost_usd?.toFixed(6) || '0',
        record.request_type || 'N/A',
      ].join(',');
    });

    const csv = [csvHeaders, ...csvRows].join('\n');

    // 返回CSV文件
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="ai-cost-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('AI Cost Export Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to export cost data',
      },
      { status: 500 }
    );
  }
}
