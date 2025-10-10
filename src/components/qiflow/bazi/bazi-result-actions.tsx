'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, Check, Copy, Download, Printer, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BaziResultActionsProps {
  resultData: any;
  userName?: string;
}

export function BaziResultActions({
  resultData,
  userName,
}: BaziResultActionsProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // 复制链接到剪贴板
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('链接已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 保存到本地收藏
  const handleSave = () => {
    try {
      const saved = localStorage.getItem('bazi_saved_results') || '[]';
      const savedResults = JSON.parse(saved);

      savedResults.push({
        id: Date.now(),
        userName,
        resultData,
        savedAt: new Date().toISOString(),
      });

      localStorage.setItem('bazi_saved_results', JSON.stringify(savedResults));
      setSaved(true);
      toast.success('已保存到收藏');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error('保存失败');
    }
  };

  // 打印结果
  const handlePrint = () => {
    window.print();
    toast.success('准备打印...');
  };

  // 下载为JSON
  const handleDownloadJSON = () => {
    try {
      const dataStr = JSON.stringify(resultData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bazi-result-${userName || 'user'}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('下载成功');
    } catch (error) {
      toast.error('下载失败');
    }
  };

  // 分享（未来可以集成微信、微博等）
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName || '我'}的八字命理分析`,
          text: '查看我的专业八字分析结果',
          url: window.location.href,
        });
        toast.success('分享成功');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('分享失败');
        }
      }
    } else {
      // 降级到复制链接
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {/* 主要操作按钮 */}
      <Button
        onClick={handleShare}
        variant="default"
        size="lg"
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        分享结果
      </Button>

      <Button
        onClick={handleSave}
        variant={saved ? 'default' : 'outline'}
        size="lg"
        className="gap-2"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" />
            已收藏
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4" />
            收藏
          </>
        )}
      </Button>

      {/* 更多操作下拉菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="lg">
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleDownloadJSON}>
            <Download className="w-4 h-4 mr-2" />
            下载 JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            打印结果
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                已复制链接
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                复制链接
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
