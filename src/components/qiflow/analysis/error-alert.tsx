'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { memo } from 'react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * 错误提示组件
 */
export const ErrorAlert = memo(function ErrorAlert({
  title = '出错了',
  message,
  onRetry,
  retryLabel = '重试'
}: ErrorAlertProps) {
  return (
    <Card className='p-8 shadow-xl bg-red-50/90 backdrop-blur-sm border-2 border-red-200'>
      <div className='flex flex-col items-center text-center space-y-4'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
          <AlertCircle className='w-8 h-8 text-red-600' aria-hidden='true' />
        </div>
        
        <div className='space-y-2'>
          <h3 className='text-xl font-bold text-red-900'>{title}</h3>
          <p className='text-red-700 max-w-md'>{message}</p>
        </div>

        {onRetry && (
          <Button
            onClick={onRetry}
            variant='outline'
            className='flex items-center gap-2 border-red-300 hover:bg-red-100'
            aria-label={retryLabel}
          >
            <RefreshCw className='w-4 h-4' aria-hidden='true' />
            {retryLabel}
          </Button>
        )}
      </div>
    </Card>
  );
});
