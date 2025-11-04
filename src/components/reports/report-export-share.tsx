'use client';

import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

export interface ReportExportShareProps {
  reportData?: any;
  onExport?: () => void;
  onShare?: () => void;
}

export function ReportExportShare({ reportData, onExport, onShare }: ReportExportShareProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onExport}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        导出报告
      </Button>
      <Button
        onClick={onShare}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        分享
      </Button>
    </div>
  );
}
