'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@mksaas.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, data });
        // 成功后根据用户类型跳转
        setTimeout(() => {
          // 管理员跳转到管理后台
          if (email === 'admin@mksaas.com') {
            window.location.href = '/zh-CN/admin/dashboard';
          } else {
            // 普通用户跳转到用户仪表盘
            window.location.href = '/zh-CN/dashboard';
          }
        }, 2000);
      } else {
        setResult({ success: false, error: data.error || 'Login failed' });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            MKSaaS 管理后台登录
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            登录后将进入管理后台
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              邮箱
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              密码
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button onClick={handleLogin} disabled={loading} className="w-full">
            {loading ? '登录中...' : '登录'}
          </Button>
        </div>

        {result && (
          <div
            className={`mt-4 p-4 rounded ${
              result.success
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {result.success ? (
              <div>
                <p className="font-semibold">✅ 登录成功！</p>
                <p className="text-sm mt-2">用户ID: {result.data?.user?.id}</p>
                <p className="text-sm">邮箱: {result.data?.user?.email}</p>
                <p className="text-sm mt-2">正在跳转到管理后台...</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold">❌ 登录失败</p>
                <p className="text-sm mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-600">
          <p>默认管理员账户:</p>
          <p>邮箱: admin@mksaas.com</p>
          <p>密码: admin123456</p>
        </div>
      </div>
    </div>
  );
}
