'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

type ShareButtonProps = {
  shareType: string; // e.g. baziAnalysis | fengshuiAnalysis | dailyFortune
  className?: string;
  label?: string;
};

export function ShareButton({ shareType, className, label }: ShareButtonProps) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType, locale }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error || '创建分享失败');
        return;
      }
      const url = data?.data?.url as string;
      if (url) {
        await navigator.clipboard.writeText(url);
        toast.success('分享链接已复制，可直接粘贴到社交平台');
      } else {
        toast.error('未生成分享链接');
      }
    } catch (e) {
      toast.error('创建分享失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className={className}
      disabled={loading}
    >
      <Share2 className="w-4 h-4 mr-2" />
      {label || (loading ? '生成中...' : '分享')}
    </Button>
  );
}
