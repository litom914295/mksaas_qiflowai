'use client';

/**
 * 增强版错误边界组件
 * 提供友好的错误处理和恢复机制
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Home, Mail, RefreshCw } from 'lucide-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * 生成错误ID用于追踪
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 判断是否为网络错误
 */
function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('NetworkError')
  );
}

/**
 * 判断是否为权限错误
 */
function isPermissionError(error: Error): boolean {
  return (
    error.message.includes('permission') ||
    error.message.includes('unauthorized') ||
    error.message.includes('forbidden') ||
    error.message.includes('401') ||
    error.message.includes('403')
  );
}

export class ErrorBoundaryEnhanced extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 更新错误详情
    this.setState({
      errorInfo,
    });

    // 调用外部错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在生产环境发送错误报告
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorReport(error, errorInfo);
    }
  }

  /**
   * 发送错误报告到服务器
   */
  async sendErrorReport(error: Error, errorInfo: ErrorInfo) {
    try {
      await fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
    }
  }

  /**
   * 重置错误状态
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  /**
   * 返回首页
   */
  handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * 刷新页面
   */
  handleRefresh = () => {
    window.location.reload();
  };

  /**
   * 联系支持
   */
  handleContact = () => {
    const subject = encodeURIComponent(`错误报告 - ${this.state.errorId}`);
    const body = encodeURIComponent(
      `错误ID: ${this.state.errorId}\n\n请描述您遇到的问题：\n\n`
    );
    window.location.href = `mailto:support@qiflow.ai?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      const isDev = process.env.NODE_ENV === 'development';

      // 使用自定义fallback如果提供
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // 根据错误类型显示不同的UI
      let errorType = '未知错误';
      let errorDescription = '应用程序遇到了意外错误';
      let suggestions: string[] = [];

      if (error) {
        if (isNetworkError(error)) {
          errorType = '网络错误';
          errorDescription = '无法连接到服务器';
          suggestions = [
            '检查您的网络连接',
            '稍后重试',
            '如果问题持续，请联系支持团队',
          ];
        } else if (isPermissionError(error)) {
          errorType = '权限错误';
          errorDescription = '您没有访问此资源的权限';
          suggestions = [
            '确认您已登录',
            '检查您的账户权限',
            '联系管理员获取访问权限',
          ];
        } else {
          suggestions = [
            '刷新页面重试',
            '清除浏览器缓存',
            '尝试使用其他浏览器',
            '联系技术支持',
          ];
        }
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>糟糕！出现了一些问题</CardTitle>
              </div>
              <CardDescription>
                错误ID: <code className="text-xs">{errorId}</code>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{errorType}</AlertTitle>
                <AlertDescription>{errorDescription}</AlertDescription>
              </Alert>

              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">建议操作：</h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 开发环境显示错误详情 */}
              {isDev && error && (
                <details className="rounded-lg border p-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    技术详情（仅开发环境可见）
                  </summary>
                  <div className="mt-4 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        错误消息：
                      </p>
                      <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs">
                        {error.message}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          堆栈跟踪：
                        </p>
                        <pre className="mt-1 max-h-48 overflow-auto rounded bg-muted p-2 text-xs">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
              <Button onClick={this.handleRefresh} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                刷新页面
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="mr-2 h-4 w-4" />
                返回首页
              </Button>
              <Button onClick={this.handleReset} variant="outline">
                重试
              </Button>
              <Button onClick={this.handleContact} variant="ghost">
                <Mail className="mr-2 h-4 w-4" />
                联系支持
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook版本的错误处理
 * 用于函数组件
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);

    // 可以在这里添加自定义错误处理逻辑
    // 例如：显示toast通知、发送错误报告等

    throw error; // 重新抛出错误让ErrorBoundary捕获
  };
}
