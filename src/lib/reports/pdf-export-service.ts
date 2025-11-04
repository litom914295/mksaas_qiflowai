/**
 * PDF Export Service
 * PDF 导出服务
 */

import type { ReportData } from './types';

export class PdfExportService {
  static async generatePDF(report: ReportData): Promise<Blob> {
    // TODO: 实现 PDF 生成（使用 jsPDF 或其他库）
    throw new Error('PDF generation not implemented');
  }

  static async downloadPDF(
    report: ReportData,
    filename?: string
  ): Promise<void> {
    const blob = await PdfExportService.generatePDF(report);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `report-${report.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
