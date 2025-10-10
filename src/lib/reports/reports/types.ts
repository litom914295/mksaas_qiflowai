/**
 * 八字报告生成器类型定义
 */

import type { EnhancedBaziResult } from '../bazi/enhanced-calculator';
import type { LuckPillarAnalysis } from '../bazi/luck-pillars';

export interface BaziReportData {
  personalInfo: PersonalInfo;
  baziAnalysis: EnhancedBaziResult;
  luckPillarsAnalysis: LuckPillarAnalysis[];
  fengshuiAnalysis?: any;
  generatedAt: Date;
}

export interface PersonalInfo {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  charts?: ChartData[];
  recommendations?: string[];
}

export interface ChartData {
  type: 'pie' | 'bar' | 'line' | 'radar';
  title: string;
  data: Record<string, number>;
  colors?: string[];
}

export interface ExportOptions {
  format: 'html' | 'pdf' | 'json';
  includeCharts: boolean;
  includeFengshui: boolean;
  template?: 'professional' | 'simple' | 'detailed';
}

export interface ShareOptions {
  expiresIn?: number; // 分享链接过期时间（小时）
  password?: string; // 访问密码
  allowDownload?: boolean; // 是否允许下载
}

// 从现有类型导入
export type { EnhancedBaziResult } from '../bazi';
export type { LuckPillarAnalysis } from '../bazi/luck-pillars';
