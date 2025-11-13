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
 * GET /api/admin/knowledge/list
 * 获取知识库文档列表
 */
export async function GET() {
  try {
    // 验证管理员权限
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = initSupabase();

    // 获取文档列表
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      documents: data || [],
    });
  } catch (error: any) {
    console.error('Knowledge list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch documents',
      },
      { status: 500 }
    );
  }
}
