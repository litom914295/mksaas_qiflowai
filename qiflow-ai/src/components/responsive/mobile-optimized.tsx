import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Maximize,
    Minimize,
    Monitor,
    RotateCcw,
    Smartphone,
    Tablet
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Device breakpoint definitions
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
} as const;

// Responsive Hook
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width < BREAKPOINTS.mobile) {
        setDevice('mobile');
      } else if (width < BREAKPOINTS.tablet) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    windowSize,
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    isTouchDevice: device === 'mobile' || device === 'tablet'
  };
}

// Touch-friendly button component
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  touchOptimized?: boolean;
}

export function TouchButton({
  children,
  className,
  variant = 'default',
  size = 'md',
  touchOptimized = true,
  ...props
}: TouchButtonProps) {
  const { isTouchDevice } = useResponsive();

  const getTouchStyles = () => {
    if (!touchOptimized || !isTouchDevice) return '';
    
    return cn(
      'min-h-[44px] min-w-[44px]', // Meets Apple and Google touch target size recommendations
      'active:scale-95 transition-transform duration-100', // Touch feedback
      'select-none', // Prevent text selection
      size === 'sm' && 'px-6 py-3 text-base',
      size === 'md' && 'px-8 py-4 text-lg',
      size === 'lg' && 'px-10 py-5 text-xl'
    );
  };

  return (
    <Button
      className={cn(getTouchStyles(), className)}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
}

// Mobile-friendly form input component
interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  touchOptimized?: boolean;
}

export function TouchInput({
  label,
  error,
  helper,
  icon,
  className,
  touchOptimized = true,
  ...props
}: TouchInputProps) {
  const { isTouchDevice } = useResponsive();

  const getTouchStyles = () => {
    if (!touchOptimized || !isTouchDevice) return '';
    
    return cn(
      'min-h-[44px]', // Minimum touch target height
      'text-base', // Prevent iOS Safari zoom
      'rounded-lg', // 更大的圆角
      'px-4 py-3' // 更大的内边距
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          className={cn(
            'w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            getTouchStyles(),
            icon && 'pl-10',
            error && 'border-red-300 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>

      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// 响应式卡片组件
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
}

export function ResponsiveCard({
  children,
  className,
  padding = 'md',
  showBorder = true
}: ResponsiveCardProps) {
  const { device } = useResponsive();

  const getPaddingStyles = () => {
    switch (device) {
      case 'mobile':
        return {
          sm: 'p-3',
          md: 'p-4',
          lg: 'p-6'
        }[padding];
      case 'tablet':
        return {
          sm: 'p-4',
          md: 'p-6',
          lg: 'p-8'
        }[padding];
      default:
        return {
          sm: 'p-4',
          md: 'p-6',
          lg: 'p-8'
        }[padding];
    }
  };

  return (
    <Card
      className={cn(
        'w-full',
        showBorder ? 'border border-gray-200' : 'border-none',
        getPaddingStyles(),
        className
      )}
    >
      {children}
    </Card>
  );
}

// 移动端底部导航
interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  active?: boolean;
}

interface BottomNavigationProps {
  items: BottomNavItem[];
  onItemClick: (item: BottomNavItem) => void;
  className?: string;
}

export function BottomNavigation({
  items,
  onItemClick,
  className
}: BottomNavigationProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50',
        'safe-area-inset-bottom', // iOS 安全区域
        className
      )}
    >
      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 min-h-[60px] transition-colors relative',
              'active:bg-gray-100', // 触摸反馈
              item.active
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </div>
              )}
            </div>
            <span className="text-xs mt-1 font-medium leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 响应式网格
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className
}: ResponsiveGridProps) {
  const { device } = useResponsive();

  const getGridStyles = () => {
    const currentColumns = columns[device];
    const gapSize = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    }[gap];

    return cn(
      'grid',
      gapSize,
      `grid-cols-${currentColumns}`
    );
  };

  return (
    <div className={cn(getGridStyles(), className)}>
      {children}
    </div>
  );
}

// 设备预览器（开发工具）
interface DevicePreviewerProps {
  children: React.ReactNode;
  showPreview?: boolean;
}

export function DevicePreviewer({ children, showPreview = false }: DevicePreviewerProps) {
  const [currentDevice, setCurrentDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const deviceSizes = {
    mobile: { width: 375, height: 812 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 }
  };

  const currentSize = deviceSizes[currentDevice];

  if (!showPreview) {
    return <>{children}</>;
  }

  const DeviceIcon = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor
  }[currentDevice];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* 控制栏 */}
      <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-medium text-gray-900 flex items-center space-x-2">
              <DeviceIcon className="w-5 h-5" />
              <span>{currentDevice} 预览</span>
            </h3>
            
            <div className="text-sm text-gray-500">
              {currentSize.width} × {currentSize.height}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 设备切换 */}
            <div className="flex border rounded-lg overflow-hidden">
              {(['mobile', 'tablet', 'desktop'] as const).map((device) => {
                const Icon = {
                  mobile: Smartphone,
                  tablet: Tablet,
                  desktop: Monitor
                }[device];

                return (
                  <button
                    key={device}
                    onClick={() => setCurrentDevice(device)}
                    className={cn(
                      'p-2 flex items-center justify-center transition-colors',
                      currentDevice === device
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* 控制按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="flex justify-center">
        <div
          className={cn(
            'bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300',
            isFullscreen ? 'w-full h-[calc(100vh-120px)]' : ''
          )}
          style={
            isFullscreen
              ? {}
              : {
                  width: currentSize.width,
                  height: currentSize.height,
                  maxWidth: '100%',
                  maxHeight: '80vh'
                }
          }
        >
          <div className="w-full h-full overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// 手势支持组件
interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
}

export function GestureHandler({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
}: GestureHandlerProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    // 优先处理主要方向
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="touch-pan-y" // 允许垂直滚动
    >
      {children}
    </div>
  );
}