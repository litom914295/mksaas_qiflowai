/**
 * 敏感操作二次确认对话框
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  requirePassword?: boolean;
  requireTyping?: string; // 需要用户输入特定文本确认
  variant?: 'default' | 'destructive';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  requirePassword = false,
  requireTyping,
  variant = 'default',
}: ConfirmDialogProps) {
  const [password, setPassword] = useState('');
  const [typedText, setTypedText] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = () => {
    if (requirePassword && !password) return false;
    if (requireTyping && typedText !== requireTyping) return false;
    return true;
  };

  const handleConfirm = async () => {
    if (!canConfirm()) return;

    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
      // 重置状态
      setPassword('');
      setTypedText('');
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {variant === 'destructive' && (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {requirePassword && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认密码</Label>
              <Input
                id="confirm-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入您的密码以确认"
                disabled={loading}
              />
            </div>
          )}

          {requireTyping && (
            <div className="space-y-2">
              <Label htmlFor="confirm-text">
                输入{' '}
                <span className="font-mono font-bold">{requireTyping}</span>{' '}
                以确认
              </Label>
              <Input
                id="confirm-text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder={`输入 "${requireTyping}"`}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm() || loading}
            className={
              variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''
            }
          >
            {loading ? '处理中...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook 用法示例
 */
export function useConfirmDialog() {
  type InternalDialogState = Omit<ConfirmDialogProps, 'onOpenChange'>;
  const [dialogState, setDialogState] = useState<InternalDialogState>({
    open: false,
    title: '',
    description: '',
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: async () => {},
    variant: 'default',
    requirePassword: false,
    requireTyping: undefined,
  });

  const confirm = (
    options: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>
  ) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        onConfirm: async () => {
          await options.onConfirm();
          resolve(true);
        },
        variant: options.variant || 'default',
        requirePassword: options.requirePassword || false,
        requireTyping: options.requireTyping,
      });
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  return {
    dialogState,
    confirm,
    closeDialog,
    ConfirmDialog: () => (
      <ConfirmDialog {...dialogState} onOpenChange={closeDialog} />
    ),
  };
}
