'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
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
        // 成功后跳转
        setTimeout(() => {
          window.location.href = '/zh-CN/dashboard';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            测试登录页面
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            直接测试 API 登录功能
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="test-email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              邮箱
            </label>
            <input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="test-password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              密码
            </label>
            <input
              id="test-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </div>

        {result && (
          <div
            className={`mt-4 p-4 rounded ${
              result.success
                ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {result.success ? (
              <div>
                <p className="font-semibold">✅ 登录成功！</p>
                <p className="text-sm mt-2">用户ID: {result.data?.user?.id}</p>
                <p className="text-sm">邮箱: {result.data?.user?.email}</p>
                <p className="text-sm mt-2">2秒后跳转到管理后台...</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold">❌ 登录失败</p>
                <p className="text-sm mt-2">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400">
          <p className="font-semibold">可用测试账户:</p>
          <div className="mt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                setEmail('test@example.com');
                setPassword('password123');
              }}
              className="block w-full text-left p-2 rounded bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
            >
              <div>邮箱: test@example.com</div>
              <div>密码: password123</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('demo@mksaas.com');
                setPassword('demo123456');
              }}
              className="block w-full text-left p-2 rounded bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
            >
              <div>邮箱: demo@mksaas.com</div>
              <div>密码: demo123456</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@mksaas.com');
                setPassword('admin123456');
              }}
              className="block w-full text-left p-2 rounded bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500"
            >
              <div>邮箱: admin@mksaas.com (需要重置)</div>
              <div>密码: admin123456</div>
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/zh-CN/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            返回原始登录页面
          </a>
        </div>
      </div>
    </div>
  );
}
