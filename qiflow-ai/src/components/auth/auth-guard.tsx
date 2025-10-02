'use client';

// QiFlow AI 认证守卫组件
// 深度思考：设计灵活的路由保护系统，支持不同的认证要求和用户体验

import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/auth/types';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // 是否需要认证
  requiredRole?: UserRole; // 需要的最低角色
  allowGuest?: boolean; // 是否允许游客访问
  fallbackPath?: string; // 重定向路径
  showLoginPrompt?: boolean; // 是否显示登录提示
  customFallback?: React.ReactNode; // 自定义回退组件
}

export function AuthGuard({
  children,
  requireAuth = false,
  requiredRole,
  allowGuest = true,
  fallbackPath = '/auth/login',
  showLoginPrompt = true,
  customFallback,
}: AuthGuardProps) {
  const {
    status,
    user,
    guestSession,
    isLoading,
    hasPermission,
    createGuestSession,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  // 检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return;

      setIsChecking(true);

      try {
        // 如果不需要认证，直接允许访问
        if (!requireAuth && !requiredRole) {
          setIsChecking(false);
          return;
        }

        // 检查用户认证状态
        if (status === 'authenticated' && user) {
          // 检查角色权限
          if (requiredRole && !hasPermission(requiredRole)) {
            // 权限不足，重定向到无权限页面
            router.push('/unauthorized');
            return;
          }
          setIsChecking(false);
          return;
        }

        // 检查游客模式
        if (status === 'guest' && guestSession && allowGuest) {
          // 游客模式下检查是否有角色要求
          if (requiredRole && requiredRole !== 'guest') {
            setShowGuestPrompt(true);
          }
          setIsChecking(false);
          return;
        }

        // 未认证状态处理
        if (status === 'unauthenticated') {
          if (requireAuth || requiredRole) {
            if (allowGuest && !requiredRole) {
              // 可以创建游客会话
              setShowGuestPrompt(true);
            } else {
              // 需要登录
              if (showLoginPrompt) {
                // 保存当前路径用于登录后重定向
                sessionStorage.setItem('qiflow_redirect_after_login', pathname || '/');
              }
              router.push(fallbackPath);
              return;
            }
          }
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [
    status,
    user,
    guestSession,
    isLoading,
    requireAuth,
    requiredRole,
    allowGuest,
    hasPermission,
    router,
    pathname,
    fallbackPath,
    showLoginPrompt,
  ]);

  // 创建游客会话
  const handleCreateGuestSession = async () => {
    try {
      await createGuestSession();
      setShowGuestPrompt(false);
    } catch (error) {
      console.error('Error creating guest session:', error);
      // 如果创建游客会话失败，重定向到登录页
      router.push(fallbackPath);
    }
  };

  // 跳转到登录页
  const handleGoToLogin = () => {
    sessionStorage.setItem('qiflow_redirect_after_login', pathname || '/');
    router.push(fallbackPath);
  };

  // 加载状态
  if (isLoading || isChecking) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  // 显示游客提示
  if (showGuestPrompt) {
    if (customFallback) {
      return <>{customFallback}</>;
    }

    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg'>
          <h2 className='text-xl font-semibold mb-4 text-center'>
            选择访问方式
          </h2>
          <p className='text-gray-600 mb-6 text-center'>
            您可以以游客身份体验基础功能，或登录获得完整功能。
          </p>

          <div className='space-y-3'>
            <Button
              onClick={handleCreateGuestSession}
              className='w-full'
              variant='outline'
            >
              以游客身份继续
            </Button>

            <Button onClick={handleGoToLogin} className='w-full'>
              登录/注册
            </Button>
          </div>

          <div className='mt-4 text-xs text-gray-500 text-center'>
            游客模式限制：最多3次分析，数据不保存
          </div>
        </div>
      </div>
    );
  }

  // 权限不足
  if (requiredRole && status === 'guest') {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg'>
          <h2 className='text-xl font-semibold mb-4 text-center'>需要登录</h2>
          <p className='text-gray-600 mb-6 text-center'>
            此功能需要登录后才能使用。
          </p>

          <Button onClick={handleGoToLogin} className='w-full'>
            立即登录
          </Button>
        </div>
      </div>
    );
  }

  // 通过所有检查，渲染子组件
  return <>{children}</>;
}

// 特定角色守卫
export function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard
      requireAuth
      requiredRole='admin'
      allowGuest={false}
      fallbackPath='/unauthorized'
    >
      {children}
    </AuthGuard>
  );
}

export function PremiumGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard
      requireAuth
      requiredRole='premium'
      allowGuest={false}
      fallbackPath='/pricing'
    >
      {children}
    </AuthGuard>
  );
}

export function UserGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard
      requireAuth
      requiredRole='user'
      allowGuest={false}
      fallbackPath='/auth/login'
    >
      {children}
    </AuthGuard>
  );
}

// 游客模式守卫（允许游客和认证用户）
export function GuestOrUserGuard({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requireAuth={false} allowGuest={true} showLoginPrompt={true}>
      {children}
    </AuthGuard>
  );
}
