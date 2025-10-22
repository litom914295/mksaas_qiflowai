'use client';

import { supabaseBrowser } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';

export function SupabaseClientDemo() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>(
    'loading'
  );
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        // 测试浏览器端 Supabase 客户端
        const { data, error } = await supabaseBrowser.auth.getUser();

        if (error) {
          // 未登录也算正常连接
          if (
            error.message.includes('session') ||
            error.message.includes('JWT')
          ) {
            setStatus('connected');
            setUserEmail(null);
          } else {
            setStatus('error');
            setErrorMessage(error.message);
          }
        } else {
          setStatus('connected');
          setUserEmail(data.user?.email ?? null);
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err?.message ?? '未知错误');
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">💻</span>
        客户端测试 (Browser)
      </h2>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700">连接状态:</span>
          {status === 'loading' && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium animate-pulse">
              ⏳ 检测中...
            </span>
          )}
          {status === 'connected' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✅ 已连接
            </span>
          )}
          {status === 'error' && (
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              ❌ 连接失败
            </span>
          )}
        </div>

        {status === 'connected' && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">认证状态:</span>
            {userEmail ? (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                已登录
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                未登录
              </span>
            )}
          </div>
        )}

        {userEmail && (
          <div className="mt-4 p-4 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-600 mb-1">
              用户信息（客户端获取）：
            </p>
            <p className="text-sm font-mono text-slate-800">
              Email: {userEmail}
            </p>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-200">
            <p className="text-sm font-medium text-red-800 mb-1">错误信息：</p>
            <p className="text-sm text-red-700 font-mono">{errorMessage}</p>
          </div>
        )}

        {status === 'connected' && (
          <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-200">
            <p className="text-sm text-green-800">
              ✨ 客户端 Supabase 连接正常，环境变量已正确加载到浏览器端
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
