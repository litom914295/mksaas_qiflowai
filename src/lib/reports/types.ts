/**
 * Report Types
 * 报告系统类型定义
 */

export interface ReportData {
  id: string;
  title: string;
  content: string;
  type: 'bazi' | 'fengshui' | 'comprehensive';
  createdAt: Date | string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface BaziReportData {
  personalInfo: {
    name: string;
    gender: 'male' | 'female';
    birthDate: string;
    birthTime: string;
    birthLocation: string;
  };
  baziAnalysis: any;
  luckPillarsAnalysis?: any[];
  fengshuiAnalysis?: any;
  generatedAt: Date;
}

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html';
  includeCharts?: boolean;
  includeImages?: boolean;
  locale?: string;
}

export interface ShareOptions {
  expiresIn?: number; // 过期时间（秒）
  password?: string;
  allowDownload?: boolean;
}

export interface ShareLink {
  id: string;
  url: string;
  expiresAt?: Date;
  password?: string;
}
