'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-4 py-2 md:px-6 md:py-4',
  md: 'px-4 py-4 md:px-8 md:py-6 lg:px-12 lg:py-8',
  lg: 'px-6 py-6 md:px-10 md:py-8 lg:px-16 lg:py-12',
};

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  center = true,
}: ResponsiveContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && 'mx-auto',
        isMobile && 'mobile-optimized',
        className
      )}
    >
      {children}
    </div>
  );
}

// 移动端优化的卡片布局
export function MobileOptimizedCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm',
        'p-4 md:p-6 lg:p-8',
        'transition-all duration-200',
        'hover:shadow-md',
        // 移动端特殊样式
        'mobile:rounded-none mobile:shadow-none mobile:border-y',
        className
      )}
    >
      {children}
    </div>
  );
}

// 响应式网格布局
export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className,
}: {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const gapClasses = {
    sm: 'gap-2 md:gap-3 lg:gap-4',
    md: 'gap-4 md:gap-6 lg:gap-8',
    lg: 'gap-6 md:gap-8 lg:gap-12',
  };

  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${columns.mobile || 1}`,
        `md:grid-cols-${columns.tablet || 2}`,
        `lg:grid-cols-${columns.desktop || 3}`,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

// 触摸优化按钮
export function TouchOptimizedButton({
  children,
  onClick,
  className,
  variant = 'primary',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'min-h-[44px] min-w-[44px]', // 符合移动端触摸目标大小
        'px-4 py-3',
        'rounded-lg',
        'font-medium',
        'transition-all duration-150',
        'active:scale-95', // 触摸反馈
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </button>
  );
}