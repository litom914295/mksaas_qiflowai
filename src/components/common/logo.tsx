/**
 * 自适应Logo组件
 * 任务12: Logo深浅色双版本与自适应
 */

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LogoProps {
  /**
   * Logo尺寸
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 是否显示文字
   */
  showText?: boolean;
  /**
   * 强制使用特定主题的Logo
   */
  forceTheme?: 'light' | 'dark';
}

const sizeConfig = {
  sm: { width: 32, height: 32, text: 'text-lg' },
  md: { width: 48, height: 48, text: 'text-xl' },
  lg: { width: 64, height: 64, text: 'text-2xl' },
  xl: { width: 96, height: 96, text: 'text-3xl' },
};

export function Logo({
  size = 'md',
  className,
  showText = true,
  forceTheme,
}: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免服务器端渲染不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  // 确定当前主题
  const currentTheme =
    forceTheme ||
    (mounted ? (theme === 'system' ? systemTheme : theme) : 'light');
  const isDark = currentTheme === 'dark';

  const { width, height, text } = sizeConfig[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo图标 */}
      <div className="relative">
        {/* 深色模式Logo */}
        <Image
          src="/brand/logo-dark.svg"
          alt="QiFlow AI Logo"
          width={width}
          height={height}
          priority
          className={cn(
            'transition-opacity duration-300',
            isDark ? 'opacity-100' : 'opacity-0 absolute inset-0'
          )}
        />

        {/* 浅色模式Logo */}
        <Image
          src="/brand/logo.svg"
          alt="QiFlow AI Logo"
          width={width}
          height={height}
          priority
          className={cn(
            'transition-opacity duration-300',
            isDark ? 'opacity-0' : 'opacity-100'
          )}
        />
      </div>

      {/* Logo文字 */}
      {showText && (
        <span
          className={cn(
            'font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent',
            text
          )}
        >
          QiFlow AI
        </span>
      )}
    </div>
  );
}

/**
 * 仅图标Logo
 */
export function LogoIcon({
  size = 'md',
  className,
}: Pick<LogoProps, 'size' | 'className'>) {
  return <Logo size={size} className={className} showText={false} />;
}

/**
 * 简化版Logo (SVG内联)
 */
export function SimpleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-12 h-12', className)}
    >
      {/* 八卦图案 */}
      <circle
        cx="50"
        cy="50"
        r="45"
        className="stroke-current text-primary"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M50 5 L50 50 L85 25 Z"
        className="fill-current text-primary/80"
      />
      <path
        d="M50 50 L95 50 L72.5 85 Z"
        className="fill-current text-primary/60"
      />
      <path
        d="M50 50 L50 95 L15 75 Z"
        className="fill-current text-primary/40"
      />
      <path
        d="M50 50 L5 50 L27.5 15 Z"
        className="fill-current text-primary/20"
      />
      <circle cx="50" cy="50" r="15" className="fill-current text-background" />
      <circle
        cx="50"
        cy="50"
        r="12"
        className="stroke-current text-primary"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
