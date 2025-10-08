/**
 * Report export and share component
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BaziReportGenerator } from '@/lib/reports/bazi-report-generator';
import { PdfExportService } from '@/lib/reports/pdf-export-service';
import { useReportSharing } from '@/lib/reports/sharing-service';
import type { BaziReportData, ExportOptions, ShareOptions } from '@/lib/reports/types';
import {
    AlertCircle,
    Clock,
    Copy,
    Download,
    ExternalLink,
    Mail,
    MessageCircle,
    QrCode,
    Share2
} from 'lucide-react';
import { useState } from 'react';

interface ReportExportShareProps {
  reportData: BaziReportData;
  className?: string;
}

export function ReportExportShare({ reportData, className }: ReportExportShareProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [exportFormat] = useState<'html' | 'pdf'>('html');
  const [shareOptions] = useState({
    password: '',
    expiresIn: 24, // 24 hours
    allowDownload: true
  });

  const { shareReport, copyToClipboard, generateShareText, createSocialShareUrls } = useReportSharing();

  // Generate report content
  const generateReportContent = async (format: 'html' | 'pdf' = 'html') => {
    const generator = new BaziReportGenerator(reportData);
    const options: ExportOptions = {
      format,
      includeCharts: true,
      includeFengshui: true,
      template: 'professional'
    };
    
    return await generator.generateReport(options);
  };

  // Export HTML report
  const handleExportHtml = async () => {
    try {
      setIsExporting(true);
      const htmlContent = await generateReportContent('html');
      
      // Create download link
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportData.personalInfo.name}-Bazi-Analysis-Report.html`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('HTML export failed:', error);
      alert('Export failed, please try again later');
    } finally {
      setIsExporting(false);
    }
  };

  // Export PDF report
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const htmlContent = await generateReportContent('html');
      
      await PdfExportService.downloadPdf(htmlContent, {
        filename: `${reportData.personalInfo.name}-八字分析报告.pdf`,
        format: 'a4',
        orientation: 'portrait'
      });
    } catch (error) {
      console.error('导出PDF失败:', error);
      alert('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 分享报告
  const handleShareReport = async () => {
    try {
      setIsSharing(true);
      const htmlContent = await generateReportContent('html');
      
      const shareOptions: ShareOptions = {
        // content: htmlContent,
        expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
        password: undefined,
        allowDownload: true,
        // creatorInfo: {
        //   name: reportData.personalInfo.name
        // }
      };

      const link = await shareReport(shareOptions as any);
      setShareLink(link.shortUrl);
      setShowShareDialog(true);
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请稍后重试');
    } finally {
      setIsSharing(false);
    }
  };

  // 复制分享链接
  const handleCopyLink = async () => {
    if (shareLink) {
      const success = await copyToClipboard(shareLink);
      if (success) {
        alert('链接已复制到剪贴板');
      } else {
        alert('复制失败，请手动复制链接');
      }
    }
  };

  return (
    <div className={className}>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-blue-100">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">导出与分享</h3>
            <p className="text-sm text-gray-600">保存或分享您的专属命理分析报告</p>
          </div>
        </div>

        {/* 导出选项 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">📥 导出报告</h4>
            <div className="space-y-2">
              <Button
                onClick={handleExportHtml}
                disabled={isExporting}
                className="w-full flex items-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4" />
                {isExporting && exportFormat === 'html' ? '导出中...' : '导出HTML版本'}
              </Button>
              
              <Button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="w-full flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting && exportFormat === 'pdf' ? '生成中...' : '导出PDF版本'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">🔗 在线分享</h4>
            <Button
              onClick={handleShareReport}
              disabled={isSharing}
              className="w-full flex items-center gap-2"
              variant="outline"
            >
              <Share2 className="w-4 h-4" />
              {isSharing ? '生成分享链接中...' : '创建分享链接'}
            </Button>
          </div>
        </div>

        {/* 格式说明 */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>HTML版本：</strong>可在浏览器中打开，保留完整的交互功能和样式<br/>
            <strong>PDF版本：</strong>适合打印和离线保存，格式固定便于分享<br/>
            <strong>在线分享：</strong>生成临时链接，可设置访问密码和过期时间
          </AlertDescription>
        </Alert>

        {/* 分享对话框 */}
        {showShareDialog && shareLink && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">分享链接已生成</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareDialog(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {/* 链接显示 */}
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">分享链接</span>
                  </div>
                  <div className="text-sm text-gray-600 break-all">{shareLink}</div>
                </div>

                {/* 操作按钮 */}
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleCopyLink} className="flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    复制链接
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareLink)}`, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    二维码
                  </Button>
                </div>

                {/* 社交分享 */}
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-3">快速分享到</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const shareUrls = createSocialShareUrls(
                          { id: '', url: shareLink, shortUrl: shareLink },
                          `${reportData.personalInfo.name} - 八字分析报告`
                        );
                        // 微信分享需要特殊处理
                        copyToClipboard(generateShareText(
                          { id: '', url: shareLink, shortUrl: shareLink },
                          `${reportData.personalInfo.name} - 八字分析报告`
                        ).wechat);
                        alert('分享文案已复制，请手动粘贴到微信');
                      }}
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      微信
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const shareUrls = createSocialShareUrls(
                          { id: '', url: shareLink, shortUrl: shareLink },
                          `${reportData.personalInfo.name} - 八字分析报告`
                        );
                        window.open(shareUrls.qq, '_blank');
                      }}
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      QQ
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const mailBody = generateShareText(
                          { id: '', url: shareLink, shortUrl: shareLink },
                          `${reportData.personalInfo.name} - 八字分析报告`
                        ).email;
                        window.location.href = `mailto:?subject=八字分析报告分享&body=${encodeURIComponent(mailBody)}`;
                      }}
                      className="flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      邮件
                    </Button>
                  </div>
                </div>

                {/* 分享设置提醒 */}
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    分享链接将在 {shareOptions.expiresIn} 小时后过期
                    {shareOptions.password && ' • 已设置访问密码'}
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}