'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type RequestType = 'access' | 'export' | 'delete' | 'rectify';

export function DSARForm() {
  const t = useTranslations('compliance.dsar' as any) as any;
  const [requestType, setRequestType] = useState<RequestType>('access');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: 实际实现需要调用后端 API
    // const response = await fetch('/api/dsar', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ requestType, reason }),
    // });

    setIsSubmitting(false);
    setIsSuccess(true);

    // 5 秒后重置表单
    setTimeout(() => {
      setIsSuccess(false);
      setReason('');
    }, 5000);
  };

  if (isSuccess) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertDescription className="text-green-800 ml-2">
          {t('successMessage')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Type */}
      <div className="space-y-2">
        <Label
          htmlFor="request-type"
          className="text-sm font-medium text-gray-700"
        >
          {t('requestType')} <span className="text-red-500">*</span>
        </Label>
        <Select
          value={requestType}
          onValueChange={(value) => setRequestType(value as RequestType)}
        >
          <SelectTrigger id="request-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="access">{t('types.access')}</SelectItem>
            <SelectItem value="export">{t('types.export')}</SelectItem>
            <SelectItem value="rectify">{t('types.rectify')}</SelectItem>
            <SelectItem value="delete">{t('types.delete')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
          {t('reasonLabel')}
        </Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('reasonPlaceholder')}
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Warning for Delete */}
      {requestType === 'delete' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            ⚠️ <strong>警告</strong>
            ：删除操作不可撤销，您的所有数据将被永久删除。
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            提交中...
          </>
        ) : (
          t('submitButton')
        )}
      </Button>

      {/* Legal Notice */}
      <p className="text-xs text-gray-500 text-center">
        提交请求即表示您确认身份信息真实有效。我们将通过注册邮箱与您联系以验证身份。
      </p>
    </form>
  );
}
