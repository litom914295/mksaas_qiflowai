import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not found');
  }

  return createClient(supabaseUrl, serviceKey);
}

/**
 * POST /api/admin/knowledge/delete
 * 删除知识库文档及其所有块
 */
export async function POST(request: NextRequest) {
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

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: '请提供文档ID' },
        { status: 400 }
      );
    }

    const supabase = initSupabase();

    // 删除相关的文本块
    const { error: chunkError } = await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('metadata->>document_id', documentId);

    if (chunkError) {
      console.error('Failed to delete chunks:', chunkError);
    }

    // 删除文档记录
    const { error: docError } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('id', documentId);

    if (docError) throw docError;

    return NextResponse.json({
      success: true,
      message: '文档及其所有块已删除',
    });
  } catch (error: any) {
    console.error('Knowledge delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Delete failed',
      },
      { status: 500 }
    );
  }
}
