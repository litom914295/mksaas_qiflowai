'use client';

import { AuthConfigCheck } from '@/components/auth/auth-config-check';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/lib/auth/context';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { loginSchema } from '../validators';

const getLocaleFromPath = (pathname: string) =>
  pathname.split('/')[1] || 'zh-CN';

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname || '/');
  const { signIn, status, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (status === 'authenticated') {
      const redirectPath =
        sessionStorage.getItem('qiflow_redirect_after_login') || `/${locale}`;
      sessionStorage.removeItem('qiflow_redirect_after_login');
      router.push(redirectPath);
    }
  }, [status, router, locale]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
          setError(parsed.error.issues[0]?.message || '输入格式不正确');
        return;
      }

        await signIn({ email, password });

        // 登录成功，重定向到目标页面
        const redirectPath =
          sessionStorage.getItem('qiflow_redirect_after_login') || `/${locale}`;
        sessionStorage.removeItem('qiflow_redirect_after_login');
        router.push(redirectPath);
    } catch (err) {
        console.error('Login error:', err);
        setError('登录失败，请检查邮箱和密码');
      } finally {
      setIsLoading(false);
    }
    },
    [email, password, signIn, router, locale]
  );

  // 显示加载状态
  if (status === 'loading') {
    return (
      <div className='container py-12 max-w-md flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <AuthConfigCheck>
      <div className='container py-12 max-w-md mx-auto'>
      <div className='bg-white rounded-lg shadow-lg p-8'>
        <h1 className='text-2xl font-bold text-center mb-6'>登录</h1>

        <form onSubmit={onSubmit} className='space-y-4'>
        <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              邮箱
            </label>
          <input
              type='email'
            required
            value={email}
              onChange={e => setEmail(e.target.value)}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='you@example.com'
              disabled={isLoading}
          />
        </div>

        <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              密码
            </label>
          <input
              type='password'
            required
            value={password}
              onChange={e => setPassword(e.target.value)}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder='请输入密码'
              disabled={isLoading}
          />
        </div>

          {(error || authError) && (
            <div className='bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700'>
              {error || authError}
          </div>
        )}

          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? (
              <>
                <LoadingSpinner size='sm' className='mr-2' />
                登录中...
              </>
            ) : (
              '登录'
            )}
        </Button>
      </form>

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>
                或使用第三方登录
              </span>
            </div>
          </div>

          <div className='mt-6 grid grid-cols-3 gap-3'>
            <Button
              variant='outline'
              onClick={() => {
                // 这里需要实现第三方登录
                alert('第三方登录功能开发中');
              }}
              disabled={isLoading}
            >
              Google
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                alert('第三方登录功能开发中');
              }}
              disabled={isLoading}
            >
              Apple
            </Button>
        <Button
              variant='outline'
          onClick={() => {
                alert('第三方登录功能开发中');
          }}
              disabled={isLoading}
        >
          微信
        </Button>
      </div>
        </div>

        <div className='mt-6 text-center text-sm'>
          <a
            href={`/${locale}/auth/register`}
            className='text-blue-600 hover:underline'
          >
            没有账户？去注册
          </a>
        </div>

        <div className='mt-4 text-center text-sm'>
          <a href={`/${locale}`} className='text-gray-500 hover:underline'>
            返回首页
          </a>
        </div>
      </div>
      </div>
    </AuthConfigCheck>
  );
}
