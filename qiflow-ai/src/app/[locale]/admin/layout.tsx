'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { AlertCircle, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status !== 'authenticated' || (user as any)?.role !== 'admin') {
      router.push('/auth/login?redirect=/admin/dashboard');
    }
  }, [user, status, router]);

  if (status === 'loading') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex items-center space-x-2'>
          <Shield className='h-4 w-4 animate-spin' />
          <span>验证管理员权限...</span>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || (user as any)?.role !== 'admin') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Card className='w-full max-w-md'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <AlertCircle className='h-6 w-6 text-red-600' />
            </div>
            <CardTitle className='text-xl'>访问被拒绝</CardTitle>
            <CardDescription>您没有管理员权限访问此页面</CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <p className='text-sm text-muted-foreground mb-4'>
              只有管理员才能访问后台管理功能
            </p>
            <button
              onClick={() => router.push('/')}
              className='text-sm text-blue-600 hover:text-blue-800'
            >
              返回首页
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='border-b bg-white'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center space-x-2'>
            <Shield className='h-6 w-6 text-blue-600' />
            <h1 className='text-xl font-semibold'>后台管理系统</h1>
          </div>
        </div>
      </div>
      <main className='container mx-auto'>{children}</main>
    </div>
  );
}
