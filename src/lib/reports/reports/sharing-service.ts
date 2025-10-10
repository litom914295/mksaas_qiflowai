/**
 * 报告分享服务
 *
 * 提供报告分享、链接生成和访问控制功能
 */

import { nanoid } from 'nanoid';

export interface SharedReport {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  expiresAt?: Date;
  password?: string;
  accessCount: number;
  maxAccess?: number;
  allowDownload: boolean;
  creatorInfo?: {
    name: string;
    email?: string;
  };
}

export interface ShareReportOptions {
  title: string;
  content: string;
  expiresIn?: number; // 小时数
  password?: string;
  maxAccess?: number; // 最大访问次数
  allowDownload?: boolean;
  creatorInfo?: {
    name: string;
    email?: string;
  };
}

export interface ShareLink {
  id: string;
  url: string;
  shortUrl: string;
  qrCodeUrl?: string;
}

export class ReportSharingService {
  private static readonly BASE_URL =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://qiflow.ai';

  private static readonly STORAGE_KEY = 'qiflow_shared_reports';

  /**
   * 创建分享链接
   */
  static async createShareLink(
    options: ShareReportOptions
  ): Promise<ShareLink> {
    const reportId = nanoid(10); // 生成短ID

    const sharedReport: SharedReport = {
      id: reportId,
      title: options.title,
      content: options.content,
      createdAt: new Date(),
      expiresAt: options.expiresIn
        ? new Date(Date.now() + options.expiresIn * 60 * 60 * 1000)
        : undefined,
      password: options.password,
      accessCount: 0,
      maxAccess: options.maxAccess,
      allowDownload: options.allowDownload ?? true,
      creatorInfo: options.creatorInfo,
    };

    // 在实际项目中，这里应该保存到数据库
    // 现在使用 localStorage 作为演示
    await ReportSharingService.saveSharedReport(sharedReport);

    const url = `${ReportSharingService.BASE_URL}/shared-report/${reportId}`;
    const shortUrl = `${ReportSharingService.BASE_URL}/s/${reportId}`;

    return {
      id: reportId,
      url,
      shortUrl,
      qrCodeUrl: await ReportSharingService.generateQRCode(shortUrl),
    };
  }

  /**
   * 获取分享的报告
   */
  static async getSharedReport(
    reportId: string,
    password?: string
  ): Promise<SharedReport | null> {
    const report = await ReportSharingService.loadSharedReport(reportId);

    if (!report) {
      return null;
    }

    // 检查是否过期
    if (report.expiresAt && new Date() > report.expiresAt) {
      await ReportSharingService.deleteSharedReport(reportId);
      return null;
    }

    // 检查访问次数限制
    if (report.maxAccess && report.accessCount >= report.maxAccess) {
      return null;
    }

    // 检查密码
    if (report.password && report.password !== password) {
      throw new Error('密码错误');
    }

    // 增加访问次数
    report.accessCount++;
    await ReportSharingService.saveSharedReport(report);

    return report;
  }

  /**
   * 生成分享文本
   */
  static generateShareText(
    shareLink: ShareLink,
    title: string
  ): {
    wechat: string;
    qq: string;
    weibo: string;
    email: string;
    generic: string;
  } {
    const baseText = `我刚刚生成了一份详细的八字命理分析报告："${title}"，想和你分享。`;
    const linkText = `\n\n🔗 点击查看：${shareLink.shortUrl}`;
    const footer = '\n\n📱 QiFlow AI - 智能风水八字分析平台';

    return {
      wechat: `${baseText}${linkText}${footer}`,
      qq: `${baseText}${linkText}${footer}`,
      weibo: `${baseText} #八字命理 #QiFlowAI ${linkText}`,
      email: `${baseText}\n\n这份报告包含了详细的八字分析、性格特质、事业指导和人生大运预测。${linkText}${footer}`,
      generic: `${baseText}${linkText}`,
    };
  }

  /**
   * 创建社交媒体分享链接
   */
  static createSocialShareUrls(
    shareLink: ShareLink,
    title: string
  ): {
    wechat: string;
    qq: string;
    weibo: string;
    twitter: string;
    facebook: string;
    linkedin: string;
  } {
    const text = encodeURIComponent(
      ReportSharingService.generateShareText(shareLink, title).generic
    );
    const url = encodeURIComponent(shareLink.shortUrl);

    return {
      wechat: 'weixin://', // 微信需要特殊处理
      qq: `http://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${text}`,
      weibo: `http://service.weibo.com/share/share.php?url=${url}&title=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
  }

  /**
   * 获取分享统计信息
   */
  static async getShareStats(reportId: string): Promise<{
    accessCount: number;
    remainingAccess?: number;
    expiresAt?: Date;
    isExpired: boolean;
  } | null> {
    const report = await ReportSharingService.loadSharedReport(reportId);

    if (!report) {
      return null;
    }

    const isExpired = report.expiresAt ? new Date() > report.expiresAt : false;
    const remainingAccess = report.maxAccess
      ? Math.max(0, report.maxAccess - report.accessCount)
      : undefined;

    return {
      accessCount: report.accessCount,
      remainingAccess,
      expiresAt: report.expiresAt,
      isExpired,
    };
  }

  /**
   * 删除分享的报告
   */
  static async deleteSharedReport(reportId: string): Promise<boolean> {
    try {
      const reports = await ReportSharingService.getAllSharedReports();
      const filteredReports = reports.filter((r) => r.id !== reportId);

      if (typeof window !== 'undefined') {
        localStorage.setItem(
          ReportSharingService.STORAGE_KEY,
          JSON.stringify(filteredReports)
        );
      }

      return true;
    } catch (error) {
      console.error('删除分享报告失败:', error);
      return false;
    }
  }

  /**
   * 清理过期的分享报告
   */
  static async cleanupExpiredReports(): Promise<number> {
    const reports = await ReportSharingService.getAllSharedReports();
    const now = new Date();
    const validReports = reports.filter(
      (report) => !report.expiresAt || report.expiresAt > now
    );

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        ReportSharingService.STORAGE_KEY,
        JSON.stringify(validReports)
      );
    }

    return reports.length - validReports.length; // 返回清理的数量
  }

  // 私有方法

  private static async saveSharedReport(report: SharedReport): Promise<void> {
    if (typeof window !== 'undefined') {
      const reports = await ReportSharingService.getAllSharedReports();
      const existingIndex = reports.findIndex((r) => r.id === report.id);

      if (existingIndex >= 0) {
        reports[existingIndex] = report;
      } else {
        reports.push(report);
      }

      localStorage.setItem(
        ReportSharingService.STORAGE_KEY,
        JSON.stringify(reports)
      );
    }
  }

  private static async loadSharedReport(
    reportId: string
  ): Promise<SharedReport | null> {
    if (typeof window !== 'undefined') {
      const reports = await ReportSharingService.getAllSharedReports();
      return reports.find((r) => r.id === reportId) || null;
    }
    return null;
  }

  private static async getAllSharedReports(): Promise<SharedReport[]> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(ReportSharingService.STORAGE_KEY);
        if (stored) {
          const reports = JSON.parse(stored);
          // 转换日期字符串为Date对象
          return reports.map((report: any) => ({
            ...report,
            createdAt: new Date(report.createdAt),
            expiresAt: report.expiresAt
              ? new Date(report.expiresAt)
              : undefined,
          }));
        }
      } catch (error) {
        console.error('读取分享报告失败:', error);
      }
    }
    return [];
  }

  private static async generateQRCode(url: string): Promise<string> {
    // 这里可以集成QR码生成服务，比如 qrcode.js
    // 现在返回一个占位符URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  }
}

/**
 * React Hook for sharing reports
 */
export function useReportSharing() {
  const shareReport = async (options: ShareReportOptions) => {
    try {
      const shareLink = await ReportSharingService.createShareLink(options);
      return shareLink;
    } catch (error) {
      console.error('分享报告失败:', error);
      throw error;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      return false;
    }
  };

  return {
    shareReport,
    copyToClipboard,
    generateShareText: ReportSharingService.generateShareText,
    createSocialShareUrls: ReportSharingService.createSocialShareUrls,
    getShareStats: ReportSharingService.getShareStats,
  };
}
