'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';

export default function TestAPIPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any) => {
    setResults((prev) => [
      ...prev,
      { test, success, data, timestamp: new Date().toISOString() },
    ]);
  };

  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      addResult('Health Check', response.ok, { status: response.status, data });
    } catch (error) {
      addResult('Health Check', false, { error: String(error) });
    }
    setLoading(false);
  };

  const testAuthAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });
      const data = await response.json();
      addResult('Auth API (Valid Credentials)', response.ok, {
        status: response.status,
        data,
      });
    } catch (error) {
      addResult('Auth API (Valid Credentials)', false, {
        error: String(error),
      });
    }
    setLoading(false);
  };

  const testAuthAPIInvalid = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        }),
      });
      const data = await response.json();
      addResult(
        'Auth API (Invalid Credentials)',
        !response.ok && response.status === 401,
        { status: response.status, data }
      );
    } catch (error) {
      addResult('Auth API (Invalid Credentials)', false, {
        error: String(error),
      });
    }
    setLoading(false);
  };

  const testDemoLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@mksaas.com',
          password: 'demo123456',
        }),
      });
      const data = await response.json();
      addResult('Demo User Login', response.ok, {
        status: response.status,
        data,
      });
    } catch (error) {
      addResult('Demo User Login', false, { error: String(error) });
    }
    setLoading(false);
  };

  const testBaseURL = () => {
    const baseURL = window.location.origin;
    addResult('Base URL', true, { baseURL, location: window.location.href });
  };

  const testEnvironment = () => {
    addResult('Environment', true, {
      userAgent: navigator.userAgent,
      language: navigator.language,
      online: navigator.onLine,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>API 测试工具</CardTitle>
          <CardDescription>测试 API 连接和配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testHealthCheck} disabled={loading}>
              测试健康检查
            </Button>
            <Button onClick={testAuthAPI} disabled={loading}>
              测试认证 API (有效凭据)
            </Button>
            <Button
              onClick={testAuthAPIInvalid}
              disabled={loading}
              variant="secondary"
            >
              测试认证 API (无效凭据)
            </Button>
            <Button
              onClick={testDemoLogin}
              disabled={loading}
              variant="outline"
            >
              测试 Demo 用户登录
            </Button>
            <Button onClick={testBaseURL} disabled={loading}>
              测试 Base URL
            </Button>
            <Button onClick={testEnvironment} disabled={loading}>
              测试环境
            </Button>
            <Button
              onClick={() => setResults([])}
              variant="outline"
              disabled={loading}
            >
              清除结果
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">测试结果:</h3>
            {results.length === 0 && (
              <p className="text-muted-foreground text-sm">
                点击上面的按钮开始测试
              </p>
            )}
            {results.map((result, index) => (
              <Card
                key={index}
                className={
                  result.success ? 'border-green-500' : 'border-red-500'
                }
              >
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span
                      className={
                        result.success ? 'text-green-500' : 'text-red-500'
                      }
                    >
                      {result.success ? '✓' : '✗'}
                    </span>
                    {result.test}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-48">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
