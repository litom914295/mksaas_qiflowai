'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { useState } from 'react';

export function SocialShareButton({
  title,
  description,
  url,
  imageUrl,
}: {
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
}) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '');

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare(platform: 'wechat' | 'weibo' | 'qq' | 'link') {
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedDesc = encodeURIComponent(description);

    let shareLink = '';
    switch (platform) {
      case 'weibo':
        shareLink = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'qq':
        shareLink = `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedTitle}&desc=${encodedDesc}`;
        break;
      case 'link':
        await handleCopyLink();
        return;
      default:
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          分享
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>分享分析结果</DialogTitle>
          <DialogDescription>选择您想要分享的平台</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {imageUrl && (
            <div className="rounded-lg border bg-muted p-4 text-center">
              <img
                src={imageUrl}
                alt="分享卡片"
                className="mx-auto max-h-48 rounded"
              />
              <Button variant="outline" size="sm" className="mt-2">
                <Download className="mr-2 h-4 w-4" />
                下载图片
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => handleShare('weibo')} variant="outline">
              微博
            </Button>
            <Button onClick={() => handleShare('qq')} variant="outline">
              QQ空间
            </Button>
            <Button
              onClick={() => handleShare('link')}
              variant="outline"
              className="col-span-2"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  已复制链接
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  复制链接
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
