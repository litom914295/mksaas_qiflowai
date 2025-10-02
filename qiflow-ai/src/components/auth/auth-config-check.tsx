'use client';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AuthConfigCheckProps {
  children: React.ReactNode;
}

export function AuthConfigCheck({ children }: AuthConfigCheckProps) {
  const router = useRouter();

  // 检查环境配置
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('demo.supabase.co') &&
    !supabaseUrl.includes('mock-project') &&
    supabaseUrl !== 'https://your-project.supabase.co';

  // 在开发环境中，即使没有配置Supabase也允许用户继续使用
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isConfigured && !isDevelopment) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4'>
        <div className='max-w-md w-full space-y-6'>
          <Alert className='border-amber-200 bg-amber-50'>
            <div className='flex items-start space-x-3'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-amber-400'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='flex-1'>
                <h3 className='text-sm font-medium text-amber-800'>
                  认证服务未配置
                </h3>
                <div className='mt-2 text-sm text-amber-700'>
                  <p>
                    系统检测到认证服务尚未正确配置。请联系管理员配置 Supabase
                    环境变量，或使用游客模式体验功能。
                  </p>
                </div>
                <div className='mt-4 flex space-x-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => router.push('/')}
                    className='text-amber-800 border-amber-300 hover:bg-amber-100'
                  >
                    返回首页
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => router.push('/zh-CN/bazi-analysis')}
                    className='text-amber-800 border-amber-300 hover:bg-amber-100'
                  >
                    游客模式体验
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
