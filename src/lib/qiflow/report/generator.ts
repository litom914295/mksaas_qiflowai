/**
 * 报告生成服务
 * 支持多种格式导出：HTML、PDF、Word、JSON
 */

import type { BaziOutput } from '@/app/api/bazi/schema';
import type { FengshuiOutput } from '@/app/api/fengshui/schema';

export interface ReportData {
  type: 'bazi' | 'fengshui' | 'combined';
  bazi?: BaziOutput;
  fengshui?: FengshuiOutput;
  metadata?: {
    generatedAt: string;
    reportId: string;
    version: string;
  };
}

export interface ReportOptions {
  format: 'html' | 'pdf' | 'docx' | 'json' | 'image';
  template?: 'default' | 'professional' | 'simple';
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  watermark?: string;
  language?: 'zh-CN' | 'zh-TW' | 'en';
}

/**
 * 生成HTML报告
 */
export function generateHTMLReport(
  data: ReportData,
  options: ReportOptions
): string {
  const { bazi, fengshui, metadata } = data;
  const template = options.template || 'default';

  let html = `
<!DOCTYPE html>
<html lang="${options.language || 'zh-CN'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.type === 'bazi' ? '八字命理分析报告' : '风水分析报告'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 3px solid #9333ea;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    .header .subtitle {
      font-size: 1.2em;
      opacity: 0.9;
    }
    .section {
      margin-bottom: 40px;
      padding: 20px;
      background: #fafafa;
      border-radius: 10px;
    }
    .section-title {
      font-size: 1.8em;
      color: #9333ea;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .card {
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .card-title {
      font-weight: bold;
      color: #6b7280;
      margin-bottom: 10px;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .card-content {
      font-size: 1.2em;
      color: #111827;
    }
    .pillars {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
      flex-wrap: wrap;
      gap: 20px;
    }
    .pillar {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
      min-width: 100px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
    .pillar-label {
      font-size: 0.9em;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .pillar-value {
      font-size: 2em;
      font-weight: bold;
    }
    .elements {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .element {
      text-align: center;
    }
    .element-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2em;
      color: white;
      font-weight: bold;
      margin: 0 auto 10px;
    }
    .element-wood { background: #22c55e; }
    .element-fire { background: #ef4444; }
    .element-earth { background: #eab308; }
    .element-metal { background: #f59e0b; }
    .element-water { background: #3b82f6; }
    .element-label {
      font-size: 0.9em;
      color: #6b7280;
    }
    .recommendations {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 20px;
      margin-top: 20px;
    }
    .recommendations ul {
      list-style: none;
      padding-left: 0;
    }
    .recommendations li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
    }
    .recommendations li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #22c55e;
      font-weight: bold;
    }
    .flying-stars {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2px;
      max-width: 400px;
      margin: 30px auto;
      background: #e5e7eb;
      padding: 2px;
    }
    .star-cell {
      background: white;
      padding: 20px;
      text-align: center;
      position: relative;
      min-height: 100px;
    }
    .star-mountain {
      position: absolute;
      top: 5px;
      left: 5px;
      color: #ef4444;
      font-weight: bold;
      font-size: 1.2em;
    }
    .star-period {
      color: #6b7280;
      font-size: 1em;
    }
    .star-facing {
      position: absolute;
      bottom: 5px;
      right: 5px;
      color: #3b82f6;
      font-weight: bold;
      font-size: 1.2em;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f9fafb;
      margin-top: 50px;
      border-top: 1px solid #e5e7eb;
    }
    .watermark {
      position: fixed;
      bottom: 20px;
      right: 20px;
      opacity: 0.1;
      font-size: 3em;
      transform: rotate(-30deg);
      pointer-events: none;
    }
    @media print {
      .container { padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${options.watermark ? `<div class="watermark">${options.watermark}</div>` : ''}
  <div class="container">
`;

  // 生成八字报告内容
  if (bazi && data.type !== 'fengshui') {
    html += generateBaziHTML(bazi, options);
  }

  // 生成风水报告内容
  if (fengshui && data.type !== 'bazi') {
    html += generateFengshuiHTML(fengshui, options);
  }

  // 页脚
  html += `
    <div class="footer">
      <p>报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
      <p>报告编号：${metadata?.reportId || generateReportId()}</p>
      <p style="margin-top: 10px; color: #6b7280; font-size: 0.9em;">
        本报告由 QiFlow AI 生成，仅供参考，不构成任何决策依据
      </p>
    </div>
  </div>
</body>
</html>
`;

  return html;
}

/**
 * 生成八字HTML内容
 */
function generateBaziHTML(bazi: any, options: ReportOptions): string {
  const data = bazi as any;
  return `
    <div class="header">
      <h1>八字命理分析报告</h1>
      <div class="subtitle">${data?.basicInfo?.name ?? ''} - ${data?.basicInfo?.gender ?? ''}</div>
    </div>
    
    <div class="section">
      <h2 class="section-title">基本信息</h2>
      <div class="grid">
        <div class="card">
          <div class="card-title">出生日期</div>
          <div class="card-content">${data?.basicInfo?.birthDate ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">出生时间</div>
          <div class="card-content">${data?.basicInfo?.birthTime ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">年龄</div>
          <div class="card-content">${data?.basicInfo?.age ?? ''}岁</div>
        </div>
        <div class="card">
          <div class="card-title">生肖</div>
          <div class="card-content">${data?.basicInfo?.zodiac ?? ''}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">四柱八字</h2>
      <div class="pillars">
        <div class="pillar">
          <div class="pillar-label">年柱</div>
          <div class="pillar-value">${data?.fourPillars?.year ?? ''}</div>
        </div>
        <div class="pillar">
          <div class="pillar-label">月柱</div>
          <div class="pillar-value">${data?.fourPillars?.month ?? ''}</div>
        </div>
        <div class="pillar">
          <div class="pillar-label">日柱</div>
          <div class="pillar-value">${data?.fourPillars?.day ?? ''}</div>
        </div>
        <div class="pillar">
          <div class="pillar-label">时柱</div>
          <div class="pillar-value">${data?.fourPillars?.hour ?? ''}</div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <span style="background: #fef3c7; padding: 10px 20px; border-radius: 20px;">
          日主：<strong style="color: #d97706; font-size: 1.2em;">${data?.fourPillars?.dayMaster ?? ''}</strong>
        </span>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">五行分析</h2>
      <div class="elements">
        ${Object.entries(data?.elements ?? {})
          .map(
            ([element, count]) => `
          <div class="element">
            <div class="element-circle element-${getElementClass(element)}">${count}</div>
            <div class="element-label">${element}</div>
          </div>
        `
          )
          .join('')}
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <p>用神：<strong style="color: #9333ea; font-size: 1.2em;">${data?.yongShen?.primary ?? ''}</strong></p>
        <p>喜神：${data?.yongShen?.secondary ?? ''}</p>
        <p>忌神：${(data?.yongShen?.avoid ?? []).join('、')}</p>
      </div>
    </div>
    
    ${
      options.includeRecommendations && data?.analysis
        ? `
    <div class="section">
      <h2 class="section-title">性格分析</h2>
      <div class="recommendations">
        <h3>性格特质</h3>
        <ul>
          ${(data?.analysis?.personality?.traits ?? []).map((trait: any) => `<li>${trait}</li>`).join('')}
        </ul>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">事业财运</h2>
      <div class="grid">
        <div class="card">
          <div class="card-title">适合行业</div>
          <div class="card-content">${(data?.analysis?.career?.suitable ?? []).join('、')}</div>
        </div>
        <div class="card">
          <div class="card-title">发展方向</div>
          <div class="card-content">${data?.analysis?.career?.direction ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">财运类型</div>
          <div class="card-content">${data?.analysis?.wealth?.type ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">财源建议</div>
          <div class="card-content">${data?.analysis?.wealth?.advice ?? ''}</div>
        </div>
      </div>
    </div>
    
    <div class="section">
      <h2 class="section-title">开运建议</h2>
      <div class="recommendations">
        <ul>
          <li>幸运颜色：${(data?.recommendations?.colors ?? []).join('、')}</li>
          <li>幸运数字：${(data?.recommendations?.numbers ?? []).join('、')}</li>
          <li>有利方位：${(data?.recommendations?.directions ?? []).join('、')}</li>
          <li>有利季节：${(data?.recommendations?.seasons ?? []).join('、')}</li>
        </ul>
      </div>
    </div>
    `
        : ''
    }
`;
}

/**
 * 生成风水HTML内容
 */
function generateFengshuiHTML(fengshui: any, options: ReportOptions): string {
  const data = fengshui as any;
  return `
    <div class="header">
      <h1>玄空风水分析报告</h1>
      <div class="subtitle">坐${data?.mountain ?? ''}向${data?.facing ?? ''} - ${data?.period ?? ''}运</div>
    </div>
    
    <div class="section">
      <h2 class="section-title">基本信息</h2>
      <div class="grid">
        <div class="card">
          <div class="card-title">房屋朝向</div>
          <div class="card-content">${data?.facing ?? ''}（${data?.basicInfo?.facing ?? ''}°）</div>
        </div>
        <div class="card">
          <div class="card-title">坐山</div>
          <div class="card-content">${data?.mountain ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">元运</div>
          <div class="card-content">第${data?.period ?? ''}运</div>
        </div>
        <div class="card">
          <div class="card-title">建造年份</div>
          <div class="card-content">${data?.basicInfo?.buildYear ?? ''}年</div>
        </div>
      </div>
    </div>
    
    ${
      options.includeCharts && data?.flyingStars
        ? `
    <div class="section">
      <h2 class="section-title">飞星分布</h2>
      <div class="flying-stars">
        ${generateFlyingStarsGrid(data.flyingStars)}
      </div>
    </div>
    `
        : ''
    }
    
    <div class="section">
      <h2 class="section-title">特殊方位</h2>
      <div class="grid">
        <div class="card">
          <div class="card-title">财位</div>
          <div class="card-content">${data?.specialPositions?.wealthPosition ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">文昌位</div>
          <div class="card-content">${data?.specialPositions?.academicPosition ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">桃花位</div>
          <div class="card-content">${data?.specialPositions?.relationshipPosition ?? ''}</div>
        </div>
        <div class="card">
          <div class="card-title">健康位</div>
          <div class="card-content">${data?.specialPositions?.healthPosition ?? ''}</div>
        </div>
      </div>
    </div>
    
    ${
      options.includeRecommendations && data?.recommendations
        ? `
    <div class="section">
      <h2 class="section-title">风水建议</h2>
      <div class="recommendations">
        <h3>布局建议</h3>
        <ul>
          ${(data?.recommendations?.layout ?? []).map((item: any) => `<li>${item}</li>`).join('')}
        </ul>
        <h3 style="margin-top: 20px;">增强措施</h3>
        <ul>
          ${(data?.recommendations?.enhancement ?? []).map((item: any) => `<li>${item}</li>`).join('')}
        </ul>
        <h3 style="margin-top: 20px;">化解方法</h3>
        <ul>
          ${(data?.recommendations?.avoidance ?? []).map((item: any) => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
    `
        : ''
    }
`;
}

/**
 * 生成飞星九宫格HTML
 */
function generateFlyingStarsGrid(flyingStars: any): string {
  if (!flyingStars || !flyingStars.combined) return '';

  const positions = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6],
  ];

  let html = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const palace = positions[row][col];
      const star = flyingStars.combined.find((s: any) => s.palace === palace);

      html += `
        <div class="star-cell">
          ${
            star
              ? `
            <div class="star-mountain">${star.mountain}</div>
            <div class="star-period">${star.period}</div>
            <div class="star-facing">${star.facing}</div>
          `
              : ''
          }
        </div>
      `;
    }
  }

  return html;
}

/**
 * 获取五行样式类名
 */
function getElementClass(element: string): string {
  const mapping: Record<string, string> = {
    木: 'wood',
    火: 'fire',
    土: 'earth',
    金: 'metal',
    水: 'water',
  };
  return mapping[element] || 'earth';
}

/**
 * 生成报告ID
 */
function generateReportId(): string {
  return `RPT${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/**
 * 导出为JSON格式
 */
export function exportAsJSON(data: ReportData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * 准备PDF导出数据
 */
export function preparePDFData(htmlContent: string): {
  html: string;
  options: any;
} {
  return {
    html: htmlContent,
    options: {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%;">
          QiFlow AI 专业分析报告
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%;">
          第 <span class="pageNumber"></span> 页 / 共 <span class="totalPages"></span> 页
        </div>
      `,
    },
  };
}

/**
 * 生成分享链接
 */
export function generateShareLink(
  reportId: string,
  type: 'bazi' | 'fengshui'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qiflow.ai';
  return `${baseUrl}/report/${type}/${reportId}`;
}

/**
 * 生成报告摘要
 */
export function generateReportSummary(data: any): string {
  let summary = '';

  if (data?.bazi) {
    const bazi = data.bazi as any;
    summary += '【八字分析】\n';
    summary += `姓名：${bazi?.basicInfo?.name ?? ''}\n`;
    summary += `八字：${bazi?.fourPillars?.year ?? ''} ${bazi?.fourPillars?.month ?? ''} ${bazi?.fourPillars?.day ?? ''} ${bazi?.fourPillars?.hour ?? ''}\n`;
    summary += `日主：${bazi?.fourPillars?.dayMaster ?? ''}\n`;
    summary += `用神：${bazi?.yongShen?.primary ?? ''}\n\n`;
  }

  if (data?.fengshui) {
    const fengshui = data.fengshui as any;
    summary += '【风水分析】\n';
    summary += `坐向：坐${fengshui?.mountain ?? ''}向${fengshui?.facing ?? ''}\n`;
    summary += `元运：第${fengshui?.period ?? ''}运\n`;
    summary += `财位：${fengshui?.specialPositions?.wealthPosition ?? ''}\n`;
    summary += `文昌位：${fengshui?.specialPositions?.academicPosition ?? ''}\n`;
  }

  return summary;
}
