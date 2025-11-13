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
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

/**
 * 敏感操作二次确认对话框
 * 支持多种确认方式:简单确认、输入确认文本、密码验证
 */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  /**
   * 确认类型
   * - simple: 简单确认(点击按钮)
   * - text: 需要输入特定文本确认
   * - password: 需要输入密码确认(未实现,预留)
   */
  confirmType?: 'simple' | 'text' | 'password';
  /**
   * text类型时需要输入的确认文本
   */
  confirmText?: string;
  /**
   * 确认按钮文本
   */
  confirmButtonText?: string;
  /**
   * 取消按钮文本
   */
  cancelButtonText?: string;
  /**
   * 危险程度
   * - warning: 警告(橙色)
   * - danger: 危险(红色)
   */
  variant?: 'warning' | 'danger';
  /**
   * 是否显示详细信息
   */
  details?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmType = 'simple',
  confirmText = 'DELETE',
  confirmButtonText = '确认',
  cancelButtonText = '取消',
  variant = 'warning',
  details,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setInputValue('');
      onOpenChange(false);
    } catch (error) {
      console.error('确认操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInputValue('');
    onOpenChange(false);
  };

  // text类型时检查输入是否匹配
  const isConfirmDisabled =
    confirmType === 'text' ? inputValue !== confirmText : false;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {variant === 'danger' ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            )}
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-gray-600 pt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {details && (
          <div className="my-4 rounded-md bg-gray-50 p-3">
            <p className="text-xs text-gray-700">{details}</p>
          </div>
        )}

        {confirmType === 'text' && (
          <div className="my-4 space-y-2">
            <Label htmlFor="confirm-input" className="text-sm font-medium">
              请输入{' '}
              <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono">
                {confirmText}
              </code>{' '}
              来确认此操作
            </Label>
            <Input
              id="confirm-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`输入 ${confirmText}`}
              className="font-mono"
              autoComplete="off"
              disabled={loading}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isConfirmDisabled || loading}
            className={
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-600'
            }
          >
            {loading ? '处理中...' : confirmButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * 便捷Hook: 使用确认对话框
 */
export function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<
    Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'onConfirm'>
  >({
    title: '确认操作',
    description: '你确定要执行此操作吗?',
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    () => void | Promise<void>
  >(() => () => {});

  const showConfirm = (
    confirmConfig: Omit<ConfirmDialogProps, 'open' | 'onOpenChange'>
  ) => {
    setConfig(confirmConfig);
    setOnConfirmCallback(() => confirmConfig.onConfirm);
    setOpen(true);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      onConfirm={onConfirmCallback}
      {...config}
    />
  );

  return {
    showConfirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}

/**
 * 预设配置
 */
export const ConfirmPresets = {
  deleteUser: {
    title: '删除用户',
    description: '此操作不可撤销,用户的所有数据将被永久删除。',
    confirmType: 'text' as const,
    confirmText: 'DELETE',
    confirmButtonText: '确认删除',
    variant: 'danger' as const,
  },
  adjustCredits: {
    title: '调整用户积分',
    description: '此操作将修改用户的积分余额,请确认调整金额正确。',
    confirmType: 'simple' as const,
    confirmButtonText: '确认调整',
    variant: 'warning' as const,
  },
  deleteRole: {
    title: '删除角色',
    description: '此操作将删除该角色,已分配该角色的用户将失去相应权限。',
    confirmType: 'text' as const,
    confirmText: 'DELETE',
    confirmButtonText: '确认删除',
    variant: 'danger' as const,
  },
  banUser: {
    title: '封禁用户',
    description: '封禁后该用户将无法登录系统,已有会话将被终止。',
    confirmType: 'simple' as const,
    confirmButtonText: '确认封禁',
    variant: 'warning' as const,
  },
  bulkDelete: {
    title: '批量删除',
    description: '此操作将删除所选的所有项目,此操作不可撤销。',
    confirmType: 'text' as const,
    confirmText: 'DELETE ALL',
    confirmButtonText: '确认批量删除',
    variant: 'danger' as const,
  },
};
