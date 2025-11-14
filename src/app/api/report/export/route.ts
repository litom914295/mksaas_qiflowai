import {
  type ReportData,
  type ReportOptions,
  exportAsJSON,
  generateHTMLReport,
  generateReportSummary,
  preparePDFData,
} from '@/lib/qiflow/report/generator';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 请求验证Schema
const ExportRequestSchema = z.object({
  type: z.enum(['bazi', 'fengshui', 'combined']).optional(),
  format: z.enum(['html', 'pdf', 'json', 'preview']),
  data: z.object({
    bazi: z.any().optional(),
    fengshui: z.any().optional(),
  }).optional(),
  inputs: z.any().optional(),
  options: z
    .object({
      template: z.enum(['default', 'professional', 'simple', 'professional-v2.2']).optional(),
      includeCharts: z.boolean().optional(),
      includeRecommendations: z.boolean().optional(),
      watermark: z.string().optional(),
      language: z.enum(['zh-CN', 'zh-TW', 'en']).optional(),
    })
    .optional(),
});

/**
 * 处理报告导出请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = ExportRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '请求参数无效',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { type, format, data, inputs, options = {} } = validationResult.data as any;

    // v2.2 专业模板：直接走 v2.2 生成 + 渲染
    if (options?.template === 'professional-v2.2' && format === 'html') {
      const { generateFullReport_v2_2 } = await import('@/lib/report/report-generator-v2.2');
      const { renderReportHTML_v2_2 } = await import('@/lib/report/v2_2/html');

      const baziInput = inputs?.baziInput || {
        name: inputs?.name || '用户',
        gender: inputs?.gender || 'male',
        date: inputs?.birthDate || '2000-01-01',
        time: inputs?.birthTime || '00:00',
        city: inputs?.birthCity || '未知',
      };
      const fengshuiInput = inputs?.fengshuiInput || {};
      const userContext = inputs?.userContext || {};

      const report = await generateFullReport_v2_2(baziInput, fengshuiInput, userContext);
      const html = renderReportHTML_v2_2(report);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="v2.2_${Date.now()}.html"`,
        },
      });
    }

    const exportType = type || (data?.bazi && data?.fengshui ? 'combined' : data?.bazi ? 'bazi' : 'fengshui');

    // 准备报告数据
    const reportData: ReportData = {
      type,
      bazi: data.bazi,
      fengshui: data.fengshui,
      metadata: {
        generatedAt: new Date().toISOString(),
        reportId: generateReportId(),
        version: 'v1.0.0',
      },
    };

    // 报告选项
    const reportOptions: ReportOptions = {
      format: format as any,
      template: options.template || 'default',
      includeCharts: options.includeCharts !== false,
      includeRecommendations: options.includeRecommendations !== false,
      watermark: options.watermark,
      language: options.language || 'zh-CN',
    };

    // 根据格式生成报告
    switch (format) {
      case 'html': {
        const htmlContent = generateHTMLReport(reportData, reportOptions);
        return new NextResponse(htmlContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Disposition': `attachment; filename="report_${reportData.metadata?.reportId}.html"`,
          },
        });
      }

      case 'json': {
        const jsonContent = exportAsJSON(reportData);
        return new NextResponse(jsonContent, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="report_${reportData.metadata?.reportId}.json"`,
          },
        });
      }

      case 'preview': {
        const htmlContent = generateHTMLReport(reportData, reportOptions);
        const summary = generateReportSummary(reportData);
        return NextResponse.json({
          success: true,
          data: {
            html: htmlContent,
            summary,
            reportId: reportData.metadata?.reportId,
            generatedAt: reportData.metadata?.generatedAt,
          },
        });
      }

      case 'pdf': {
        // PDF生成需要额外的库支持（如 puppeteer）
        // 这里返回PDF配置，实际生成可以在客户端或专门的服务中处理
        const htmlContent = generateHTMLReport(reportData, reportOptions);
        const pdfData = preparePDFData(htmlContent);

        return NextResponse.json({
          success: true,
          data: {
            ...pdfData,
            reportId: reportData.metadata?.reportId,
            message: 'PDF生成配置已准备，请使用客户端库生成PDF',
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: '不支持的导出格式' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '导出失败',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取报告模板列表
 */
export async function GET(request: NextRequest) {
  const templates = [
    {
      id: 'default',
      name: '默认模板',
      description: '标准格式报告，包含完整分析内容',
      preview: '/templates/default.png',
    },
    {
      id: 'professional',
      name: '专业模板',
      description: '专业详细报告，包含技术细节和深度分析',
      preview: '/templates/professional.png',
    },
    {
      id: 'simple',
      name: '简洁模板',
      description: '简洁明了的报告，突出重点结论',
      preview: '/templates/simple.png',
    },
  ];

  const formats = [
    {
      id: 'html',
      name: 'HTML网页',
      description: '可在浏览器中直接查看的网页格式',
      mimeType: 'text/html',
    },
    {
      id: 'pdf',
      name: 'PDF文档',
      description: '适合打印和分享的PDF格式',
      mimeType: 'application/pdf',
    },
    {
      id: 'json',
      name: 'JSON数据',
      description: '原始数据格式，便于二次开发',
      mimeType: 'application/json',
    },
  ];

  return NextResponse.json({
    success: true,
    data: {
      templates,
      formats,
      supportedLanguages: ['zh-CN', 'zh-TW', 'en'],
    },
  });
}

/**
 * 生成报告ID
 */
function generateReportId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${timestamp}${random}`.toUpperCase();
}
