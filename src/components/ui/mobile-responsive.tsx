/**
 * Mobile optimization tools and components
 * Responsive interaction experience designed for QiFlow AI
 */

import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Button } from './button';
import { Card } from './enhanced-card';

// ==================== Responsive Container ====================
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = 'xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-none',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12',
    xl: 'px-8 sm:px-12 lg:px-16'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// ==================== Responsive Grid ====================
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({ 
  children, 
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-10'
  };

  const getGridCols = () => {
    const colsClass = [];
    if (cols.default) colsClass.push(`grid-cols-${cols.default}`);
    if (cols.sm) colsClass.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) colsClass.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) colsClass.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) colsClass.push(`xl:grid-cols-${cols.xl}`);
    return colsClass.join(' ');
  };

  return (
    <div className={cn(
      'grid',
      getGridCols(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// ==================== Mobile Navigation ====================
interface MobileNavigationProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function MobileNavigation({ 
  title, 
  onBack, 
  onMenu, 
  actions,
  className 
}: MobileNavigationProps) {
  return (
    <nav className={cn(
      'sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200',
      'lg:hidden', // Only show on mobile
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left buttons */}
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          {onMenu && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenu}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Title */}
        <h1 className="font-semibold text-gray-900 truncate flex-1 text-center px-4">
          {title}
        </h1>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>
    </nav>
  );
}

// ==================== Mobile Tabs ====================
interface MobileTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    badge?: number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({ 
  tabs, 
  activeTab, 
  onTabChange,
  className 
}: MobileTabsProps) {
  return (
    <div className={cn(
      'sticky top-0 z-40 bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide',
      'lg:hidden', // Use standard tabs on desktop
      className
    )}>
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== Collapsible Panel ====================
interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  icon?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function CollapsiblePanel({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  icon,
  className,
  headerClassName,
  contentClassName
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full p-4 text-left hover:bg-gray-50 transition-colors',
          headerClassName
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {icon}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <ChevronDown 
            className={cn(
              'w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2',
              isExpanded && 'rotate-180'
            )} 
          />
        </div>
      </button>
      
      {isExpanded && (
        <div className={cn(
          'border-t border-gray-200 bg-gray-50/50',
          contentClassName
        )}>
          {children}
        </div>
      )}
    </Card>
  );
}

// ==================== Mobile Drawer ====================
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right' | 'bottom';
  className?: string;
}

export function MobileDrawer({ 
  isOpen, 
  onClose, 
  title,
  children, 
  position = 'left',
  className 
}: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    left: 'left-0 top-0 h-full w-80 max-w-[85vw]',
    right: 'right-0 top-0 h-full w-80 max-w-[85vw]',
    bottom: 'bottom-0 left-0 right-0 h-96 max-h-[85vh] rounded-t-2xl'
  };

  const slideClasses = {
    left: 'animate-slide-right',
    right: 'animate-slide-left', 
    bottom: 'animate-slide-up'
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer content */}
      <div className={cn(
        'absolute bg-white shadow-2xl',
        positionClasses[position],
        slideClasses[position],
        className
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ==================== Mobile Bottom Bar ====================
interface MobileBottomBarProps {
  actions: Array<{
    id: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
    badge?: number;
    active?: boolean;
  }>;
  className?: string;
}

export function MobileBottomBar({ actions, className }: MobileBottomBarProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe',
      'lg:hidden', // Only show on mobile
      className
    )}>
      <div className="grid grid-cols-4 h-16">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 transition-colors relative',
              action.active 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <div className="relative">
              {action.icon}
              {action.badge !== undefined && action.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-4 flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </div>
            <span className="text-xs font-medium truncate w-full px-1">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== Responsive Text ====================
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: {
    default?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function ResponsiveText({ 
  children, 
  className,
  size = { default: 'base' },
  weight = 'normal'
}: ResponsiveTextProps) {
  const sizeClasses = [];
  
  if (size.default) sizeClasses.push(`text-${size.default}`);
  if (size.sm) sizeClasses.push(`sm:text-${size.sm}`);
  if (size.md) sizeClasses.push(`md:text-${size.md}`);
  if (size.lg) sizeClasses.push(`lg:text-${size.lg}`);

  const weightClass = `font-${weight}`;

  return (
    <span className={cn(
      sizeClasses.join(' '),
      weightClass,
      className
    )}>
      {children}
    </span>
  );
}

// ==================== Touch Gesture Support ====================
interface TouchGestureProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
}

export function TouchGesture({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className
}: TouchGestureProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const threshold = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setTouchStart(null);
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// ==================== Device Detection Hook ====================
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
}