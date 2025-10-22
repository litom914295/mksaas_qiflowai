import { getSupabaseServerClient } from '@/server/supabase';
import { SupabaseClientDemo } from './client-demo';

export default async function SupabaseDemoPage() {
  // 服务端：获取用户信息（如果已登录）
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Supabase 配置测试
          </h1>
          <p className="text-slate-600">验证服务端与客户端 Supabase 连接</p>
        </div>

        {/* 服务端测试结果 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            服务端测试 (RSC)
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">连接状态:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ 已连接
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">认证状态:</span>
              {user ? (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  已登录
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                  未登录
                </span>
              )}
            </div>
            {user && (
              <div className="mt-4 p-4 bg-slate-50 rounded-md">
                <p className="text-sm text-slate-600 mb-1">用户信息：</p>
                <p className="text-sm font-mono text-slate-800">
                  ID: {user.id}
                </p>
                <p className="text-sm font-mono text-slate-800">
                  Email: {user.email ?? '未设置'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 客户端测试组件 */}
        <SupabaseClientDemo />

        {/* API 路由测试 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            API 路由测试
          </h2>
          <p className="text-slate-600 mb-4">
            访问以下端点查看详细的连接测试结果：
          </p>
          <a
            href="/api/supabase-test"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            打开 /api/supabase-test
            <span>→</span>
          </a>
        </div>

        {/* 文档说明 */}
        <div className="bg-slate-900 rounded-lg shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            使用说明
          </h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <p className="font-medium text-white mb-1">服务端使用：</p>
              <code className="block bg-slate-800 p-2 rounded text-xs overflow-x-auto">
                import &#123; getSupabaseServerClient &#125; from
                '@/server/supabase'
                <br />
                const supabase = getSupabaseServerClient()
              </code>
            </div>
            <div>
              <p className="font-medium text-white mb-1">客户端使用：</p>
              <code className="block bg-slate-800 p-2 rounded text-xs overflow-x-auto">
                'use client'
                <br />
                import &#123; supabaseBrowser &#125; from
                '@/lib/supabase-client'
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
