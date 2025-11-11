'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Shield,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // 使用 Supabase Auth 登录
      const response = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 验证是否为管理员
        if (email === 'admin@qiflowai.com') {
          setSuccess(true);
          // 跳转到管理后台
          setTimeout(() => {
            window.location.href = '/zh-CN/admin';
          }, 1000);
        } else {
          setError('此账户没有管理员权限');
        }
      } else {
        setError(data.error || '登录失败，请检查邮箱和密码');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <Card className="w-full max-w-md mx-4 relative shadow-2xl border-slate-700 bg-slate-900/90 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full w-fit">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            🔮 超级管理后台
          </CardTitle>
          <CardDescription className="text-slate-400">
            QiFlow AI 智能命理风水平台管理中心
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
                <AlertDescription>
                  ✅ 验证成功，正在进入管理后台...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                管理员邮箱
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@qiflowai.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-500"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                管理员密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-purple-500"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">
                  安全提示
                </span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• 仅限授权管理员访问</li>
                <li>• 所有操作将被记录审计</li>
                <li>• 请勿在公共设备上登录</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  验证中...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  进入管理后台
                </>
              )}
            </Button>

            <div className="flex items-center justify-between w-full text-sm">
              <a
                href="/zh-CN/auth/login"
                className="text-slate-400 hover:text-white transition-colors"
              >
                普通用户登录
              </a>
              <a
                href="/zh-CN"
                className="text-slate-400 hover:text-white transition-colors"
              >
                返回首页
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* 背景装饰 */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
    </div>
  );
}
