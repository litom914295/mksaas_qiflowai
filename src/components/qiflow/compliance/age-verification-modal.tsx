'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const AGE_VERIFICATION_KEY = 'qiflow_age_verified';
const AGE_VERIFICATION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 天

/**
 * 18+ 年龄验证弹窗组件
 * 合规要求：仅限18岁及以上用户使用
 */
export function AgeVerificationModal() {
  const t = useTranslations('compliance' as any) as any;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 检查是否已验证
    const checkAgeVerification = () => {
      const stored = localStorage.getItem(AGE_VERIFICATION_KEY);
      if (!stored) {
        setOpen(true);
        return;
      }

      try {
        const data = JSON.parse(stored);
        const now = Date.now();
        // 检查是否过期
        if (now - data.timestamp > AGE_VERIFICATION_EXPIRY) {
          localStorage.removeItem(AGE_VERIFICATION_KEY);
          setOpen(true);
        }
      } catch {
        localStorage.removeItem(AGE_VERIFICATION_KEY);
        setOpen(true);
      }
    };

    checkAgeVerification();
  }, []);

  const handleConfirm = () => {
    // 记录验证时间戳
    localStorage.setItem(
      AGE_VERIFICATION_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        verified: true,
      })
    );
    setOpen(false);
  };

  const handleReject = () => {
    // 用户拒绝年龄验证，跳转到外部页面或显示提示
    alert(t('ageVerification.underageMessage'));
    window.location.href = 'https://www.google.com';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleReject()}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <DialogTitle className="text-xl">
              {t('ageVerification.title')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p className="font-medium text-gray-700">
              {t('ageVerification.description')}
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>{t('ageVerification.reason1')}</li>
              <li>{t('ageVerification.reason2')}</li>
              <li>{t('ageVerification.reason3')}</li>
            </ul>
            <p className="text-sm text-gray-500 italic">
              {t('ageVerification.confirmPrompt')}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            className="w-full sm:w-auto"
          >
            {t('ageVerification.rejectButton')}
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-purple-600 text-white"
          >
            {t('ageVerification.confirmButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
