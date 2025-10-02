/**
 * PDFå¯¼å‡ºæœåŠ¡
 * 
 * å°†HTMLæŠ¥å‘Šè½¬æ¢ä¸ºPDFæ ¼å¼
 */

type JsPDFConstructor = typeof import('jspdf')['jsPDF'];
type Html2CanvasFn = typeof import('html2canvas')['default'];

let jsPDFConstructor: JsPDFConstructor | null = null;
const loadJsPDF = async (): Promise<JsPDFConstructor> => {
  if (!jsPDFConstructor) {
    const jsPDFModule = await import('jspdf');
    jsPDFConstructor = (jsPDFModule as any).jsPDF ?? (jsPDFModule as any).default;
  }
  return jsPDFConstructor!;
};

let html2canvasFn: Html2CanvasFn | null = null;
const loadHtml2Canvas = async (): Promise<Html2CanvasFn> => {
  if (!html2canvasFn) {
    const html2canvasModule = await import('html2canvas');
    html2canvasFn = (html2canvasModule as any).default ?? (html2canvasModule as any);
  }
  return html2canvasFn!;
};

// åŠ¨æ€å¯¼å…¥ canvg ä»¥é¿å…æž„å»ºæ—¶çš„æ¨¡å—è§£æžé—®é¢˜
let canvg: any = null;
const loadCanvg = async () => {
  if (!canvg) {
    try {
      const canvgModule = await import('canvg');
      canvg = (canvgModule as any).default || canvgModule;
    } catch (error) {
      console.warn('canvg æ¨¡å—åŠ è½½å¤±è´¥ï¼Œå°†ä½¿ç”¨åŸºç¡€ PDF åŠŸèƒ½:', error);
      canvg = null;
    }
  }
  return canvg;
};

export interface PdfExportOptions {
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: number;
  quality?: number;
  filename?: string;
}

export class PdfExportService {
  
  /**
   * å°†HTMLå†…å®¹è½¬æ¢ä¸ºPDF
   */
  static async exportHtmlToPdf(
    htmlContent: string, 
    options: PdfExportOptions = {}
  ): Promise<Blob> {
    const {
      format = 'a4',
      orientation = 'portrait',
      margin = 20,
      quality = 1.0,
      filename = 'bazi-report.pdf'
    } = options;

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('PDF export requires a browser environment.');
    }

    const [html2canvas, JsPDF] = await Promise.all([
      loadHtml2Canvas(),
      loadJsPDF(),
    ]);

    // åˆ›å»ºä¸´æ—¶å®¹å™¨
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.width = '1200px';
    container.style.fontFamily = 'Microsoft YaHei, SimHei, sans-serif';
    document.body.appendChild(container);

    try {
      // ä½¿ç”¨html2canvasæˆªå›¾
      const canvas = await html2canvas(container, {
        scale: quality,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // åˆ›å»ºPDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new JsPDF({
        orientation,
        unit: 'mm',
        format
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // æ·»åŠ ç¬¬ä¸€é¡µ
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      // å¦‚æžœå†…å®¹è¶…è¿‡ä¸€é¡µï¼Œç»§ç»­æ·»åŠ é¡µé¢
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      // æ·»åŠ é¡µè„š
      const totalPages = (pdf.internal as any).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(128);
        pdf.text(
          `ç¬¬ ${i} é¡µï¼Œå…± ${totalPages} é¡µ | ç”± QiFlow AI ç”Ÿæˆ`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      return pdf.output('blob');
    } finally {
      // æ¸…ç†ä¸´æ—¶å®¹å™¨
      document.body.removeChild(container);
    }
  }

  /**
   * ç›´æŽ¥ä¸‹è½½PDFæ–‡ä»¶
   */
  static async downloadPdf(
    htmlContent: string,
    options: PdfExportOptions = {}
  ): Promise<void> {
    const pdfBlob = await this.exportHtmlToPdf(htmlContent, options);
    const filename = options.filename || 'bazi-report.pdf';

    // åˆ›å»ºä¸‹è½½é“¾æŽ¥
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // æ¸…ç†URLå¯¹è±¡
    URL.revokeObjectURL(url);
  }

  /**
   * é¢„è§ˆPDFï¼ˆåœ¨æ–°çª—å£ä¸­æ‰“å¼€ï¼‰
   */
  static async previewPdf(
    htmlContent: string,
    options: PdfExportOptions = {}
  ): Promise<void> {
    const pdfBlob = await this.exportHtmlToPdf(htmlContent, options);
    const url = URL.createObjectURL(pdfBlob);
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.location.href = url;
    } else {
      // å¦‚æžœå¼¹çª—è¢«é˜»æ­¢ï¼Œåˆ™ç›´æŽ¥ä¸‹è½½
      await this.downloadPdf(htmlContent, options);
    }
  }

  /**
   * èŽ·å–PDFçš„Base64ç¼–ç 
   */
  static async getPdfBase64(
    htmlContent: string,
    options: PdfExportOptions = {}
  ): Promise<string> {
    const pdfBlob = await this.exportHtmlToPdf(htmlContent, options);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // ç§»é™¤data:application/pdf;base64,å‰ç¼€
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
  }
}

/**
 * ä¼˜åŒ–çš„HTMLæ¨¡æ¿ï¼Œä¸“é—¨ç”¨äºŽPDFå¯¼å‡º
 */
export function createPdfOptimizedHtml(originalHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; }
        body { 
          font-family: 'Microsoft YaHei', SimHei, sans-serif; 
          line-height: 1.6; 
          margin: 0; 
          padding: 20px;
          background: white;
          color: #333;
        }
        .report-container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white;
        }
        .report-header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
          margin-bottom: 30px;
          border-radius: 8px;
        }
        .report-header h1 { 
          margin: 0; 
          font-size: 2.2em; 
          font-weight: 300; 
        }
        .report-section { 
          margin-bottom: 30px; 
          padding: 25px;
          border: 1px solid #eee;
          border-radius: 8px;
          page-break-inside: avoid;
        }
        .report-section h2 { 
          color: #333; 
          border-bottom: 2px solid #667eea; 
          padding-bottom: 10px; 
          margin-bottom: 20px;
          font-size: 1.5em;
        }
        .pillars-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 15px; 
          margin: 20px 0; 
        }
        .pillar-item {
          text-align: center;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        .aspect-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 15px; 
          margin: 20px 0; 
        }
        .aspect { 
          background: #f9f9f9; 
          padding: 15px; 
          border-radius: 6px;
          border: 1px solid #eee;
        }
        .timeline { 
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px; 
          margin: 20px 0; 
        }
        .timeline-item { 
          background: #f9f9f9; 
          padding: 12px; 
          border-radius: 6px; 
          text-align: center;
          border: 1px solid #ddd;
          font-size: 0.9em;
        }
        .timeline-item.current { 
          background: #667eea; 
          color: white; 
        }
        .recommendations { 
          background: #f0f8ff; 
          padding: 15px; 
          border-radius: 6px; 
          margin-top: 15px;
          border: 1px solid #b8d4f0;
        }
        .task-item { 
          margin: 8px 0; 
          padding: 8px; 
          background: white; 
          border-radius: 4px;
          border: 1px solid #eee;
        }
        .legend-item {
          display: flex;
          align-items: center;
          margin: 5px 0;
        }
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin-right: 8px;
        }
        @media print {
          body { padding: 0; }
          .report-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      ${originalHtml}
    </body>
    </html>
  `;
}



