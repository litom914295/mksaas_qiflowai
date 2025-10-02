import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle,
    Copy,
    ExternalLink,
    Info,
    RotateCcw,
    WifiOff,
    X,
    XCircle
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// Toast 通知类型
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastComponentProps extends Toast {
  onDismiss: (id: string) => void;
}

// Toast 组件
function ToastComponent({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  action,
  onDismiss,
  onClose
}: ToastComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    const enterTimer = setTimeout(() => setIsVisible(true), 100);
    
    // 自动消失
    let dismissTimer: NodeJS.Timeout | undefined;
    if (duration > 0 && type !== 'loading') {
      dismissTimer = setTimeout(() => {
        handleDismiss();
      }, duration);
    }

    return () => {
      clearTimeout(enterTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration, type]);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(id);
      onClose?.();
    }, 300);
  }, [id, onDismiss, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'loading':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return null;
    }
  };

  const getStyles = () => {
    const baseStyles = "border-l-4";
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50`;
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50`;
      case 'info':
        return `${baseStyles} border-blue-500 bg-blue-50`;
      case 'loading':
        return `${baseStyles} border-blue-500 bg-blue-50`;
      default:
        return `${baseStyles} border-gray-500 bg-gray-50`;
    }
  };

  return (
    <Card
      className={cn(
        "max-w-md w-full shadow-lg transition-all duration-300 ease-out",
        getStyles(),
        isVisible && !isLeaving
          ? "transform translate-x-0 opacity-100"
          : isLeaving
          ? "transform translate-x-full opacity-0"
          : "transform translate-x-full opacity-0"
      )}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </h4>
            {message && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {message}
              </p>
            )}
            
            {action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>

          {type !== 'loading' && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Toast 容器
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function ToastContainer({ 
  toasts, 
  onDismiss, 
  position = 'top-right' 
}: ToastContainerProps) {
  const getContainerStyles = () => {
    const baseStyles = "fixed z-[9999] flex flex-col space-y-4 pointer-events-none";
    
    switch (position) {
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  return (
    <div className={getContainerStyles()}>
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastComponent
            {...toast}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}

// Toast Hook
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 便捷方法
  const toast = {
    success: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'error', title, message, duration: 8000, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'warning', title, message, duration: 6000, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Toast>) => 
      addToast({ type: 'info', title, message, ...options }),
    
    loading: (title: string, message?: string) => 
      addToast({ type: 'loading', title, message, duration: 0 }),

    // 更新 loading toast
    updateLoading: (id: string, type: ToastType, title: string, message?: string) => {
      setToasts(prev => prev.map(toast => 
        toast.id === id 
          ? { ...toast, type, title, message, duration: type === 'loading' ? 0 : 5000 }
          : toast
      ));
    }
  };

  return {
    toasts,
    toast,
    dismissToast,
    clearAllToasts
  };
}

// 错误处理组件
interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
  componentStack?: string;
}

export function ErrorBoundaryFallback({ 
  error, 
  resetError,
  componentStack 
}: ErrorBoundaryFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  const copyErrorToClipboard = () => {
    const errorText = `错误信息: ${error.message}\n\n堆栈: ${error.stack}${componentStack ? `\n\n组件堆栈: ${componentStack}` : ''}`;
    navigator.clipboard.writeText(errorText);
  };

  // const reportError = () => {
  //   // 这里可以集成错误报告服务
  //   console.log('报告错误:', error);
  // };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-4">
          页面遇到了问题
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          抱歉，当前页面出现了意外错误。我们已经记录了这个问题，正在努力解决。
          您可以尝试刷新页面或返回首页。
        </p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={resetError}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重新加载</span>
            </Button>

            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>返回首页</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1"
            >
              {showDetails ? '隐藏' : '显示'}错误详情
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={copyErrorToClipboard}
              className="flex-1 flex items-center justify-center space-x-1"
            >
              <Copy className="w-3 h-3" />
              <span>复制错误</span>
            </Button>
          </div>
        </div>

        {showDetails && (
          <Card className="mt-6 p-4 bg-gray-50 text-left">
            <div className="text-sm">
              <div className="font-medium text-gray-700 mb-2">错误详情:</div>
              <div className="text-red-600 mb-3 font-mono text-xs">
                {error.message}
              </div>
              
              {error.stack && (
                <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>如果问题持续出现，请联系我们的客服团队</p>
          <a 
            href="mailto:support@qiflow.ai"
            className="text-blue-600 hover:text-blue-800 underline mt-1 inline-block"
          >
            support@qiflow.ai
          </a>
        </div>
      </Card>
    </div>
  );
}

// 网络状态提示组件
export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初始化网络状态
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineToast || isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800">
                网络连接已断开
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                请检查网络连接，部分功能可能无法正常使用
              </p>
            </div>
            <button
              onClick={() => setShowOfflineToast(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// 统一的错误处理和反馈系统
export function UserFeedbackProvider({ children }: { children: React.ReactNode }) {
  const { toasts, dismissToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer 
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-right"
      />
      <NetworkStatusIndicator />
    </>
  );
}