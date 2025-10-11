import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/server/supabase'

export async function GET() {
  try {
    // 检查环境变量是否已加载（不返回实际值）
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }

    // 测试 Supabase 客户端连接
    const supabase = getSupabaseServerClient()
    
    // 尝试获取当前用户（如果未登录会返回 null，但连接正常）
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    // 尝试简单的数据库查询测试连接（查询 Supabase 内置的元数据表）
    const { data: healthData, error: healthError } = await supabase
      .from('_supabase_health_check')
      .select('*')
      .limit(1)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checks: {
        environment: envCheck,
        supabaseClient: {
          initialized: true,
          authStatus: userError ? 'no_user' : 'user_found',
          userId: userData?.user?.id ?? null,
          userEmail: userData?.user?.email ?? null,
        },
        // 健康检查可能会因表不存在而失败，这是正常的
        healthCheck: {
          attempted: true,
          hasError: !!healthError,
          errorMessage: healthError?.message ?? null,
        },
      },
      message: '✅ Supabase 配置已加载，客户端初始化成功',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
          message: error?.message ?? '未知错误',
          type: error?.constructor?.name ?? 'Error',
        },
        hint: '请检查 .env.local 文件是否存在且包含正确的 Supabase 变量',
      },
      { status: 500 }
    )
  }
}
