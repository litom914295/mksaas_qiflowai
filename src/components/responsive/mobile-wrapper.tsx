'use client';

import { cn } from '@/lib/utils';
import type React from 'react';
import { useEffect, useState } from 'react';

interface MobileWrapperProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: number;
}

/**
 * 移动端包装器组件
 * 自动适配移动端布局
 */
export function MobileWrapper({
  children,
  className,
  breakpoint = 768,
}: MobileWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return (
    <div
      className={cn(
        'w-full',
        isMobile ? 'px-4 py-2' : 'container mx-auto px-8 py-6',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 响应式网格组件
 */
export function ResponsiveGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3 },
  gap = 4,
  className,
}: {
  children: React.ReactNode;
  cols?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
}) {
  const gridCols = cn(
    'grid',
    `gap-${gap}`,
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return <div className={gridCols}>{children}</div>;
}

/**
 * 移动端底部固定按钮
 */
export function MobileFixedButton({
  children,
  className,
  show = true,
}: {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
}) {
  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t md:hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 响应式标题
 */
export function ResponsiveTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1 className={cn('text-2xl md:text-3xl lg:text-4xl font-bold', className)}>
      {children}
    </h1>
  );
}

/**
 * 响应式卡片
 */
export function ResponsiveCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card',
        'p-4 md:p-6 lg:p-8',
        'shadow-sm hover:shadow-md transition-shadow',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Hook: 检测是否为移动端
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook: 获取屏幕尺寸
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: screenSize.width < 768,
    isTablet: screenSize.width >= 768 && screenSize.width < 1024,
    isDesktop: screenSize.width >= 1024,
  };
}
