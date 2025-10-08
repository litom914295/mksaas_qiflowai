/**
 * Enhanced Interactive Feedback System
 * Provides elegant loading, error and success state feedback
 */

import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle,
    Info,
    Loader2,
    RefreshCw,
    Sparkles,
    Star,
    TrendingUp,
    Zap
} from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from './button';
import { Card } from './enhanced-card';

// ==================== Enhanced Loading Component ====================
interface EnhancedLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'cultural';
  message?: string;
  submessage?: string;
  progress?: number;
  className?: string;
}

export function EnhancedLoading({
  size = 'md',
  variant = 'cultural',
  message = 'Loading',
  submessage,
  progress,
  className
}: EnhancedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const containerSizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2 className={cn(
            sizeClasses[size],
            'animate-spin text-blue-600'
          )} />
        );

      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-blue-600 animate-pulse',
                  size === 'sm' ? 'w-2 h-2' : 
                  size === 'md' ? 'w-3 h-3' :
                  size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={cn(
            'rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse',
            sizeClasses[size]
          )} />
        );

      case 'cultural':
        return (
          <div className="relative">
            <div className={cn(
              'absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse',
              sizeClasses[size]
            )} />
            <div className="flex items-center justify-center space-x-1">
              <Star className={cn(
                sizeClasses[size], 
                'text-blue-600 animate-pulse'
              )} style={{ animationDelay: '0s' }} />
              <Sparkles className={cn(
                sizeClasses[size],
                'text-purple-600 animate-pulse'
              )} style={{ animationDelay: '0.3s' }} />
              <Zap className={cn(
                sizeClasses[size],
                'text-pink-600 animate-pulse'
              )} style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      containerSizes[size],
      className
    )}>
      <div className="mb-4">
        {renderSpinner()}
      </div>
      
      {message && (
        <h3 className={cn(
          'font-semibold text-gray-900 mb-2',
          textSizes[size]
        )}>
          {message}
        </h3>
      )}
      
      {submessage && (
        <p className="text-sm text-gray-600 max-w-md">
          {submessage}
        </p>
      )}

      {progress !== undefined && (
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {variant === 'cultural' && (
        <div className="mt-4 flex justify-center space-x-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce opacity-60"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Smart Error Component ====================
interface SmartErrorProps {
  error: string | Error;
  title?: string;
  type?: 'network' | 'validation' | 'server' | 'unknown';
  onRetry?: () => void;
  onReport?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SmartError({
  error,
  title,
  type = 'unknown',
  onRetry,
  onReport,
  className,
  size = 'md'
}: SmartErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: RefreshCw,
          color: 'orange',
          title: title || 'Network Connection Failed',
          suggestion: 'Please check your network connection and try again',
          actionLabel: 'Reconnect'
        };
      case 'validation':
        return {
          icon: AlertCircle,
          color: 'red',
          title: title || 'Invalid Input',
          suggestion: 'Please check your input information',
          actionLabel: 'Re-enter'
        };
      case 'server':
        return {
          icon: AlertCircle,
          color: 'red',
          title: title || 'Server Error',
          suggestion: 'Server is temporarily unavailable, please try again later',
          actionLabel: 'Retry'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'gray',
          title: title || 'An Error Occurred',
          suggestion: 'Please try refreshing the page or try again later',
          actionLabel: 'Retry'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <Card 
      variant="outlined"
      className={cn(
        'border-red-200 bg-red-50 text-center',
        sizeClasses[size],
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className={cn(
          'p-3 rounded-full bg-red-100',
          config.color === 'orange' && 'bg-orange-100',
          config.color === 'gray' && 'bg-gray-100'
        )}>
          <Icon className={cn(
            iconSizes[size],
            'text-red-600',
            config.color === 'orange' && 'text-orange-600',
            config.color === 'gray' && 'text-gray-600'
          )} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {config.title}
          </h3>
          <p className="text-sm text-gray-600">
            {config.suggestion}
          </p>
          {errorMessage && size !== 'sm' && (
            <details className="text-left">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Error Details
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 font-mono">
                {errorMessage}
              </div>
            </details>
          )}
        </div>

        <div className="flex gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className={cn(
                'border-red-300 text-red-700 hover:bg-red-50',
                config.color === 'orange' && 'border-orange-300 text-orange-700 hover:bg-orange-50'
              )}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {config.actionLabel}
            </Button>
          )}
          
          {onReport && (
            <Button
              onClick={onReport}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              报告问题
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ==================== 成功反馈组件 ====================
interface SuccessFeedbackProps {
  title?: string;
  message: string;
  onContinue?: () => void;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
  className?: string;
}

export function SuccessFeedback({
  title = '操作成功',
  message,
  onContinue,
  onClose,
  autoHide = false,
  duration = 3000,
  className
}: SuccessFeedbackProps) {
  return (
    <Card 
      variant="outlined"
      className={cn(
        'border-green-200 bg-green-50 p-6 text-center animate-scale-in',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 rounded-full bg-green-100">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-900">
            {title}
          </h3>
          <p className="text-sm text-green-800">
            {message}
          </p>
        </div>

        {(onContinue || onClose) && (
          <div className="flex gap-3">
            {onContinue && (
              <Button
                onClick={onContinue}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                继续
              </Button>
            )}
            
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-green-700 hover:text-green-800"
              >
                关闭
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ==================== 空状态组件 ====================
interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title = '暂无数据',
  description = '还没有相关内容',
  action,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'p-8',
    md: 'p-12',
    lg: 'p-16'
  };

  const iconSizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const defaultIcon = <TrendingUp className={cn(iconSizes[size], 'text-gray-400')} />;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      <div className="mb-6 opacity-60">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm">
        {description}
      </p>

      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ==================== 状态消息组件 ====================
interface StatusMessageProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  compact?: boolean;
}

export function StatusMessage({
  type,
  title,
  message,
  onClose,
  className,
  compact = false
}: StatusMessageProps) {
  const config = {
    info: {
      icon: Info,
      colors: 'border-blue-200 bg-blue-50 text-blue-900',
      iconColor: 'text-blue-600'
    },
    success: {
      icon: CheckCircle,
      colors: 'border-green-200 bg-green-50 text-green-900',
      iconColor: 'text-green-600'
    },
    warning: {
      icon: AlertCircle,
      colors: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      iconColor: 'text-yellow-600'
    },
    error: {
      icon: AlertCircle,
      colors: 'border-red-200 bg-red-50 text-red-900',
      iconColor: 'text-red-600'
    }
  };

  const { icon: Icon, colors, iconColor } = config[type];

  return (
    <div className={cn(
      'border rounded-lg',
      colors,
      compact ? 'p-3' : 'p-4',
      className
    )}>
      <div className={cn(
        'flex items-start gap-3',
        compact && 'items-center'
      )}>
        <Icon className={cn('w-5 h-5 flex-shrink-0', iconColor)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn(
              'font-medium',
              compact ? 'text-sm' : 'text-base'
            )}>
              {title}
            </h4>
          )}
          <p className={cn(
            compact ? 'text-xs' : 'text-sm',
            title && !compact && 'mt-1'
          )}>
            {message}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== 进度指示器 ====================
interface ProgressIndicatorProps {
  steps: Array<{
    label: string;
    completed: boolean;
    current?: boolean;
  }>;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ProgressIndicator({
  steps,
  className,
  orientation = 'horizontal'
}: ProgressIndicatorProps) {
  return (
    <div className={cn(
      'flex items-center',
      orientation === 'vertical' ? 'flex-col space-y-4' : 'space-x-4',
      className
    )}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center',
            orientation === 'vertical' ? 'flex-col text-center' : 'space-x-2'
          )}
        >
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all',
            step.completed 
              ? 'bg-green-600 text-white border-green-600' 
              : step.current
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-400 border-gray-300'
          )}>
            {step.completed ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          
          <span className={cn(
            'text-sm font-medium',
            step.completed 
              ? 'text-green-600' 
              : step.current
                ? 'text-blue-600'
                : 'text-gray-500',
            orientation === 'vertical' && 'mt-2'
          )}>
            {step.label}
          </span>

          {index < steps.length - 1 && orientation === 'horizontal' && (
            <div className={cn(
              'w-12 h-0.5',
              step.completed ? 'bg-green-600' : 'bg-gray-300'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}