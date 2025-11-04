/**
 * OCR文字识别处理器
 *
 * 基于Tesseract.js实现户型图中的文字识别
 * 用于自动解析房间标注、尺寸信息等
 */

// @ts-ignore - tesseract.js library
import Tesseract from 'tesseract.js';
import type { ImageUploadData, OCRResult } from './types';

export class OCRProcessor {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  /**
   * 初始化OCR处理器
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.worker = await Tesseract.createWorker();

      await this.worker.load();
      await (this.worker as any).loadLanguage('chi_sim+eng'); // 支持中英文
      await (this.worker as any).initialize('chi_sim+eng');

      // 设置识别参数
      await this.worker.setParameters({
        tessedit_char_whitelist:
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz一二三四五六七八九十客厅卧室厨房卫生间餐厅书房储藏室阳台走廊客厅卧室厨房卫生间餐厅书房储藏室阳台走廊',
        tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      });

      this.isInitialized = true;
      console.log('OCR处理器初始化完成');
    } catch (error) {
      console.error('OCR初始化失败:', error);
      throw new Error(
        `OCR初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 识别图像中的文字
   */
  async recognizeText(imageData: ImageUploadData): Promise<OCRResult[]> {
    if (!this.isInitialized || !this.worker) {
      await this.initialize();
    }

    try {
      console.log('开始OCR文字识别...');

      const { data } = await this.worker!.recognize(imageData.url);

      console.log('OCR识别完成:', data.text);

      // 解析识别结果
      const results = this.parseOCRResults(data);

      return results;
    } catch (error) {
      console.error('OCR识别失败:', error);
      throw new Error(
        `OCR识别失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 解析OCR识别结果
   */
  private parseOCRResults(data: any): OCRResult[] {
    const results: OCRResult[] = [];

    if (!data.words || !Array.isArray(data.words)) {
      return results;
    }

    // 过滤和清理识别结果
    const validWords = data.words.filter((word: any) => {
      const text = word.text?.trim();
      return (
        text &&
        text.length > 0 &&
        text.length < 50 && // 过滤过长的文本
        this.isValidText(text)
      );
    });

    // 转换为标准格式
    for (const word of validWords) {
      const result: OCRResult = {
        text: word.text.trim(),
        confidence: word.confidence / 100, // 转换为0-1范围
        boundingBox: {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        },
      };

      // 只保留置信度较高的结果
      if (result.confidence > 0.3) {
        results.push(result);
      }
    }

    // 按置信度排序
    results.sort((a, b) => b.confidence - a.confidence);

    return results;
  }

  /**
   * 验证文本是否有效
   */
  private isValidText(text: string): boolean {
    // 过滤纯数字（可能是尺寸）
    if (/^\d+$/.test(text)) {
      return true;
    }

    // 过滤包含房间名称的文本
    const roomKeywords = [
      '客厅',
      '卧室',
      '厨房',
      '卫生间',
      '餐厅',
      '书房',
      '储藏室',
      '阳台',
      '走廊',
      'living',
      'bedroom',
      'kitchen',
      'bathroom',
      'dining',
      'study',
      'storage',
      'balcony',
      'corridor',
      '房间',
      '室',
      '厅',
      '房',
    ];

    return roomKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 识别房间标注
   */
  async recognizeRoomLabels(imageData: ImageUploadData): Promise<
    Array<{
      text: string;
      position: { x: number; y: number };
      confidence: number;
    }>
  > {
    const ocrResults = await this.recognizeText(imageData);

    return ocrResults
      .filter((result) => this.isRoomLabel(result.text))
      .map((result) => ({
        text: result.text,
        position: {
          x: result.boundingBox.x + result.boundingBox.width / 2,
          y: result.boundingBox.y + result.boundingBox.height / 2,
        },
        confidence: result.confidence,
      }));
  }

  /**
   * 识别尺寸标注
   */
  async recognizeDimensions(imageData: ImageUploadData): Promise<
    Array<{
      text: string;
      position: { x: number; y: number };
      value: number;
      unit: string;
    }>
  > {
    const ocrResults = await this.recognizeText(imageData);

    return ocrResults
      .filter((result) => this.isDimensionText(result.text))
      .map((result) => {
        const dimension = this.parseDimension(result.text);
        return {
          text: result.text,
          position: {
            x: result.boundingBox.x + result.boundingBox.width / 2,
            y: result.boundingBox.y + result.boundingBox.height / 2,
          },
          value: dimension.value,
          unit: dimension.unit,
        };
      });
  }

  /**
   * 判断是否为房间标注
   */
  private isRoomLabel(text: string): boolean {
    const roomKeywords = [
      '客厅',
      '卧室',
      '厨房',
      '卫生间',
      '餐厅',
      '书房',
      '储藏室',
      '阳台',
      '走廊',
      'living',
      'bedroom',
      'kitchen',
      'bathroom',
      'dining',
      'study',
      'storage',
      'balcony',
      'corridor',
      '房间',
      '室',
      '厅',
      '房',
    ];

    return roomKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 判断是否为尺寸文本
   */
  private isDimensionText(text: string): boolean {
    // 匹配数字+单位的模式
    const dimensionPattern = /^\d+(\.\d+)?[mcm²³]?$/;
    return dimensionPattern.test(text.trim());
  }

  /**
   * 解析尺寸文本
   */
  private parseDimension(text: string): { value: number; unit: string } {
    const match = text.match(/^(\d+(?:\.\d+)?)([mcm²³]?)$/);

    if (match) {
      const value = Number.parseFloat(match[1]);
      const unit = match[2] || 'm';

      // 转换单位到米
      let valueInMeters = value;
      switch (unit) {
        case 'cm':
          valueInMeters = value / 100;
          break;
        default:
          valueInMeters = value;
          break;
      }

      return {
        value: valueInMeters,
        unit: 'm',
      };
    }

    return { value: 0, unit: 'm' };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}
