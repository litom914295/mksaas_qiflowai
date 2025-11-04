'use client';

/**
 * 响应式断点 Hook
 * 任务13: 响应式优化 - 检测当前屏幕断点
 */

import { useEffect, useState } from 'react';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * 检测当前屏幕断点
 */
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;

      // 确定当前断点
      let breakpoint: Breakpoint = 'sm';
      if (width >= breakpoints['2xl']) {
        breakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        breakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        breakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        breakpoint = 'md';
      }

      setCurrentBreakpoint(breakpoint);
      setIsMobile(width < breakpoints.md);
      setIsTablet(width >= breakpoints.md && width < breakpoints.lg);
      setIsDesktop(width >= breakpoints.lg);
    };

    // 初始检查
    checkBreakpoint();

    // 监听窗口大小变化
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint: currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isAtLeast: (bp: Breakpoint) => {
      if (!currentBreakpoint) return false;
      return breakpoints[currentBreakpoint] >= breakpoints[bp];
    },
    isBelow: (bp: Breakpoint) => {
      if (!currentBreakpoint) return false;
      return breakpoints[currentBreakpoint] < breakpoints[bp];
    },
  };
}

/**
 * 媒体查询 Hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    // 新版浏览器
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    // 旧版浏览器

    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

/**
 * 视口尺寸 Hook
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 初始值
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
