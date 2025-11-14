/**
 * v2.2 专业版报告 HTML 渲染器
 * @deprecated 请使用 '@/lib/report/v2-2/html' 中的 renderReportHtmlV22
 * 此文件保留用于向后兼容，将在未来版本中移除
 */
import type { ReportOutput_v2_2 } from '@/types/report-v2.2';
import { renderReportHtmlV22 } from '@/lib/report/v2-2/html';

/**
 * @deprecated 请使用 renderReportHtmlV22 from '@/lib/report/v2-2/html'
 */
export function renderReportHTML_v2_2(report: ReportOutput_v2_2): string {
  // 向后兼容：调用新函数
  return renderReportHtmlV22(report as any);
}

// 向后兼容：重新导出新函数
export { renderReportHtmlV22 } from '@/lib/report/v2-2/html';
