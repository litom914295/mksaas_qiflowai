'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface EnhancedLoadingProps {
  className?: string;
  text?: string;
  subText?: string;
  tips?: string[];
  showProgress?: boolean;
}

export function EnhancedLoading({
  className,
  text = '加载中...',
  subText,
  tips = [],
  showProgress = false,
}: EnhancedLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (showProgress) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(timer);
    }
  }, [showProgress]);

  useEffect(() => {
    if (tips.length > 0) {
      const timer = setInterval(() => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [tips.length]);

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
      {/* 主加载动画 */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* 加载文字 */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-900">{text}</p>
        {subText && <p className="text-sm text-gray-600">{subText}</p>}
      </div>

      {/* 进度条 */}
      {showProgress && (
        <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* 提示信息轮播 */}
      {tips.length > 0 && (
        <div className="text-sm text-gray-500 text-center h-6 transition-opacity duration-300">
          {tips[currentTip]}
        </div>
      )}
    </div>
  );
}

// 骨架屏加载
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

// 脉冲加载点
export function PulsingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex space-x-2', className)}>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
    </div>
  );
}