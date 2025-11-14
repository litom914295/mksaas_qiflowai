'use client';

import { authClient } from '@/lib/auth-client';
import { useState } from 'react';

export default function AuthDebugPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('wrongpassword');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testDirectAPI = async () => {
    setLoading(true);
    clearLogs();

    try {
      addLog('开始直接 API 测试');
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      addLog(`API 响应状态: ${response.status} ${response.statusText}`);

      const text = await response.text();
      addLog(`API 响应内容: ${text}`);

      if (text) {
        try {
          const data = JSON.parse(text);
          addLog(`解析的 JSON 数据: ${JSON.stringify(data, null, 2)}`);
        } catch (e) {
          addLog(`JSON 解析失败: ${e}`);
        }
      }
    } catch (error) {
      addLog(`直接 API 错误: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthClient = async () => {
    setLoading(true);
    clearLogs();

    try {
      addLog('开始 authClient 测试');

      await authClient.signIn.email(
        { email, password },
        {
          onRequest: (ctx) => {
            addLog(`onRequest: ${JSON.stringify(ctx, null, 2)}`);
          },
          onResponse: (ctx) => {
            addLog(`onResponse: 状态 ${ctx.response?.status}`);
          },
          onSuccess: (ctx) => {
            addLog(`onSuccess: ${JSON.stringify(ctx, null, 2)}`);
          },
          onError: (ctx) => {
            addLog(`onError: ${JSON.stringify(ctx, null, 2)}`);
          },
        }
      );
    } catch (error) {
      addLog(`authClient 异常: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setLoading(true);
    clearLogs();

    try {
      addLog('测试基本连接性');
      const response = await fetch('/api/health');
      addLog(`健康检查响应: ${response.status}`);
      const text = await response.text();
      addLog(`健康检查内容: ${text}`);
    } catch (error) {
      addLog(`健康检查失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            认证系统调试页面
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="email-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                邮箱
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="password-input"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                密码
              </label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              type="button"
              onClick={testHealthCheck}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              健康检查
            </button>

            <button
              type="button"
              onClick={testDirectAPI}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              测试直接 API
            </button>

            <button
              type="button"
              onClick={testAuthClient}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              测试 Auth Client
            </button>

            <button
              type="button"
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              清除日志
            </button>
          </div>

          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              调试日志{' '}
              {loading && <span className="text-blue-500">(运行中...)</span>}
            </h2>

            <div className="max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">暂无日志</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            快速测试
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => {
                setEmail('test@example.com');
                setPassword('password123');
              }}
              className="p-3 text-left border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <div className="font-medium">测试用户</div>
              <div className="text-sm text-gray-500">test@example.com</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('demo@mksaas.com');
                setPassword('demo123456');
              }}
              className="p-3 text-left border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <div className="font-medium">Demo 用户</div>
              <div className="text-sm text-gray-500">demo@mksaas.com</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('admin@mksaas.com');
                setPassword('admin123456');
              }}
              className="p-3 text-left border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <div className="font-medium">管理员</div>
              <div className="text-sm text-gray-500">admin@mksaas.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
