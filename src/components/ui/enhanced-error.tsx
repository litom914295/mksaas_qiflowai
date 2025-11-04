'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, RefreshCw, XCircle } from 'lucide-react';
import { Button } from './button';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface EnhancedErrorProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  suggestions?: string[];
  details?: string;
  className?: string;
}

const severityConfig = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-900',
    iconColor: 'text-yellow-600',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
  },
  critical: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    textColor: 'text-red-900',
    iconColor: 'text-red-700',
  },
};

export function EnhancedError({
  title,
  message,
  severity = 'error',
  onRetry,
  onDismiss,
  suggestions = [],
  details,
  className,
}: EnhancedErrorProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border-2 p-6',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('w-6 h-6 mt-1 flex-shrink-0', config.iconColor)} />
        
        <div className="flex-1 space-y-3">
          {title && (
            <h3 className={cn('text-lg font-semibold', config.textColor)}>
              {title}
            </h3>
          )}
          
          <p className={cn('text-sm', config.textColor, 'opacity-90')}>
            {message}
          </p>

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className={cn('text-sm font-medium', config.textColor)}>
                建议解决方案：
              </p>
              <ul className="list-disc list-inside space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={cn('text-sm', config.textColor, 'opacity-80')}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {details && (
            <details className="cursor-pointer">
              <summary className={cn('text-sm font-medium', config.textColor)}>
                查看详细信息
              </summary>
              <pre className="mt-2 p-3 bg-white bg-opacity-50 rounded text-xs overflow-auto">
                {details}
              </pre>
            </details>
          )}

          <div className="flex gap-2 pt-2">
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重试
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                size="sm"
                variant="ghost"
              >
                关闭
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 简化版错误边界组件
export function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <EnhancedError
        title="页面出现错误"
        message={error.message || '发生了意外错误'}
        severity="critical"
        onRetry={resetErrorBoundary}
        suggestions={[
          '刷新页面重试',
          '检查网络连接',
          '清除浏览器缓存',
          '联系技术支持',
        ]}
        details={error.stack}
      />
    </div>
  );
}