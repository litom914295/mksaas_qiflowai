'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate error ID for tracking - use fixed value to avoid hydration mismatch
    const errorId = `error_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error information
    console.error('[GlobalErrorBoundary] Error caught:', error);
    console.error('[GlobalErrorBoundary] Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // In production, error reports can be sent to monitoring services
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  // Report error to monitoring service
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getCurrentUserId(),
      };

      // Send to error monitoring service
      // Here you can integrate Sentry, LogRocket, or other error monitoring services
      console.log('[Error Report]', errorReport);

      // For example, send to Sentry:
      // Sentry.captureException(error, {
      //   contexts: {
      //     error_boundary: {
      //       componentStack: errorInfo.componentStack,
      //       errorId: this.state.errorId,
      //     },
      //   },
      // });
    } catch (reportError) {
      console.error('[Error Reporting Failed]', reportError);
    }
  };

  // Get current user ID (if logged in)
  private getCurrentUserId = (): string | null => {
    try {
      // Here you can get user ID from authentication context
      // Temporarily return null, actual project needs to connect to authentication system
      return null;
    } catch {
      return null;
    }
  };

  // Retry rendering
  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  // Return to home page
  private handleGoHome = () => {
    window.location.href = '/';
  };

  // Refresh page
  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // If custom fallback component is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误界面
      return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6'>
            <div className='text-center'>
              {/* 错误图标 */}
              <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <AlertTriangle className='w-8 h-8 text-red-600' />
              </div>

              {/* 错误标题 */}
              <h1 className='text-xl font-semibold text-gray-900 mb-2'>
                出现了一个错误
              </h1>

              {/* 错误描述 */}
              <p className='text-gray-600 mb-6'>
                抱歉，应用程序遇到了一个意外错误。我们已经记录了这个错误，并正在努力解决。
              </p>

              {/* 错误详情（仅开发环境显示） */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className='bg-gray-100 rounded-lg p-4 mb-6 text-left'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Bug className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700'>
                      错误详情
                    </span>
                  </div>
                  <div className='text-xs text-gray-600 font-mono'>
                    <div className='mb-2'>
                      <strong>错误:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div className='max-h-32 overflow-y-auto'>
                        <strong>堆栈:</strong>
                        <pre className='whitespace-pre-wrap mt-1'>
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className='space-y-3'>
                <Button
                  onClick={this.handleRetry}
                  className='w-full'
                  variant='default'
                >
                  <RefreshCw className='w-4 h-4 mr-2' />
                  重试
                </Button>

                <Button
                  onClick={this.handleRefresh}
                  className='w-full'
                  variant='outline'
                >
                  <RefreshCw className='w-4 h-4 mr-2' />
                  刷新页面
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  className='w-full'
                  variant='ghost'
                >
                  <Home className='w-4 h-4 mr-2' />
                  返回首页
                </Button>
              </div>

              {/* 错误ID */}
              {this.state.errorId && (
                <div className='mt-4 text-xs text-gray-500'>
                  错误ID: {this.state.errorId}
                </div>
              )}

              {/* 联系支持 */}
              <div className='mt-6 pt-4 border-t border-gray-200'>
                <p className='text-sm text-gray-600 mb-2'>
                  如果问题持续出现，请联系我们的支持团队
                </p>
                <a
                  href='mailto:support@qiflow.ai'
                  className='text-sm text-blue-600 hover:text-blue-800 underline'
                >
                  support@qiflow.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 便捷的 Hook 用于在组件内部报告错误
export const useErrorReporting = () => {
  const reportError = (error: Error, context?: Record<string, unknown>) => {
    console.error('[Error Report]', { error, context });

    // 在生产环境中发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以发送到错误监控服务
    }
  };

  return { reportError };
};
