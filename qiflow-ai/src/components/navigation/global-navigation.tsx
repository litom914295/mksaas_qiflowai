import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
// import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import {
    Compass,
    FileText,
    HelpCircle,
    // ChevronLeft,
    // ChevronRight,
    Home,
    Menu,
    Settings,
    Star,
    User,
    X
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  auth?: 'guest' | 'user' | 'premium';
  description?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    title: '首页',
    href: '/',
    icon: <Home className="w-5 h-5" />,
    description: '平台概览和快速开始'
  },
  {
    id: 'analysis',
    title: '八字分析',
    href: '/bazi-analysis',
    icon: <Star className="w-5 h-5" />,
    description: '专业八字命理分析'
  },
  {
    id: 'compass',
    title: '数字罗盘',
    href: '/compass',
    icon: <Compass className="w-5 h-5" />,
    description: '高精度方位测量'
  },
  {
    id: 'reports',
    title: '分析报告',
    href: '/reports',
    icon: <FileText className="w-5 h-5" />,
    auth: 'user',
    description: '查看历史分析报告'
  },
  {
    id: 'profile',
    title: '个人资料',
    href: '/profile',
    icon: <User className="w-5 h-5" />,
    auth: 'user',
    description: '管理个人信息和偏好'
  },
  {
    id: 'settings',
    title: '设置',
    href: '/settings',
    icon: <Settings className="w-5 h-5" />,
    auth: 'user',
    description: '应用设置和偏好'
  }
];

interface GlobalNavigationProps {
  className?: string;
}

export function GlobalNavigation({ className }: GlobalNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { status, user, isGuest } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredItems = NAVIGATION_ITEMS.filter(item => {
    if (!item.auth) return true;
    if (item.auth === 'guest') return true;
    if (item.auth === 'user') return status === 'authenticated';
    if (item.auth === 'premium') return (user as any)?.subscription?.plan === 'premium';
    return false;
  });

  const handleItemClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <>
        {/* 移动端头部导航 */}
        <header className={cn(
          "bg-white border-b border-gray-200 sticky top-0 z-50",
          className
        )}>
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="font-bold text-lg">QiFlow AI</h1>
            </div>
            
            {/* 用户状态指示 */}
            <div className="flex items-center space-x-2">
              {isGuest() && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  游客模式
                </span>
              )}
              {status === 'authenticated' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 移动端侧边抽屉 */}
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-80 max-w-[90vw] bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold text-lg">导航菜单</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <nav className="p-4">
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.href)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors",
                        pathname === item.href
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      {item.icon}
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {item.description}
                          </div>
                        )}
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* 底部操作区 */}
                <div className="mt-8 pt-4 border-t">
                  <button className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50">
                    <HelpCircle className="w-5 h-5" />
                    <span>帮助中心</span>
                  </button>
                  
                  {status === 'unauthenticated' && (
                    <div className="mt-4 space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={() => router.push('/auth/login')}
                      >
                        登录
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/auth/register')}
                      >
                        注册
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* 移动端底部导航 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="grid grid-cols-4 h-16">
            {filteredItems.slice(0, 4).map(item => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.href)}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-colors",
                  pathname === item.href
                    ? "text-blue-600"
                    : "text-gray-600"
                )}
              >
                {item.icon}
                <span className="text-xs">{item.title}</span>
                {item.badge && (
                  <div className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  // 桌面端导航
  return (
    <header className={cn(
      "bg-white border-b border-gray-200 sticky top-0 z-50",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 和主导航 */}
          <div className="flex items-center space-x-8">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Q</span>
              </div>
              <span className="font-bold text-xl">QiFlow AI</span>
            </div>

            <nav className="flex space-x-4">
              {filteredItems.slice(0, 4).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.href)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* 右侧操作区 */}
          <div className="flex items-center space-x-4">
            {isGuest() && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  游客模式
                </span>
                <Button 
                  size="sm" 
                  onClick={() => router.push('/auth/register')}
                >
                  立即注册
                </Button>
              </div>
            )}

            {status === 'authenticated' && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  欢迎，{user?.displayName}
                </span>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer">
                  <span className="text-white font-medium">
                    {user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            )}

            {status === 'unauthenticated' && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/auth/login')}
                >
                  登录
                </Button>
                <Button 
                  size="sm"
                  onClick={() => router.push('/auth/register')}
                >
                  注册
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/help')}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

// 页面包装器组件，包含导航
interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showNavigation?: boolean;
}

export function PageLayout({ 
  children, 
  title, 
  description,
  showNavigation = true 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && <GlobalNavigation />}
      
      {(title || description) && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-600">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      
      <main className="pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}