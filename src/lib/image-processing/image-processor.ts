/**
 * 图像处理主控制器
 * 
 * 整合图像上传、预处理、OCR识别、房间检测等功能
 * 提供统一的图像处理接口
 */

import { 
  ImageUploadData, 
  ImageAnalysisResult, 
  ProcessingProgress, 
  ProcessingStage,
  ImageProcessingConfig,
  RoomDetectionResult,
  OCRResult
} from './types';
import { RoomDetector } from './room-detector';
import { OCRProcessor } from './ocr-processor';

export class ImageProcessor {
  private roomDetector: RoomDetector;
  private ocrProcessor: OCRProcessor;
  private config: ImageProcessingConfig;
  private progressCallback?: (progress: ProcessingProgress) => void;

  constructor(config?: Partial<ImageProcessingConfig>) {
    this.roomDetector = new RoomDetector();
    this.ocrProcessor = new OCRProcessor();
    this.config = {
      enableOCR: true,
      enableRoomDetection: true,
      enableWallDetection: true,
      confidenceThreshold: 0.5,
      maxProcessingTime: 30000, // 30秒
      ...config
    };
  }

  /**
   * 设置进度回调
   */
  setProgressCallback(callback: (progress: ProcessingProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * 处理图像文件
   */
  async processImage(file: File): Promise<ImageAnalysisResult> {
    const startTime = performance.now();
    
    try {
      // 1. 上传和预处理
      this.updateProgress('uploading', 0, '正在上传图像...');
      const imageData = await this.uploadAndPreprocessImage(file);
      
      // 2. OCR处理
      let ocrResults: OCRResult[] = [];
      if (this.config.enableOCR) {
        this.updateProgress('ocr_processing', 20, '正在识别文字...');
        ocrResults = await this.ocrProcessor.recognizeText(imageData);
      }
      
      // 3. 房间检测
      let roomDetection: RoomDetectionResult | null = null;
      if (this.config.enableRoomDetection) {
        this.updateProgress('room_detection', 60, '正在检测房间布局...');
        const imageDataForDetection = await this.convertToImageData(imageData);
        roomDetection = await this.roomDetector.detectRooms(imageDataForDetection);
      }
      
      // 4. 后处理
      this.updateProgress('postprocessing', 90, '正在生成分析结果...');
      const processingTime = performance.now() - startTime;
      
      const result: ImageAnalysisResult = {
        imageData,
        ocrResults,
        roomDetection: roomDetection || {
          rooms: [],
          walls: [],
          doors: [],
          windows: [],
          confidence: 0,
          processingTime: 0
        },
        processingTime,
        success: true
      };
      
      this.updateProgress('completed', 100, '分析完成');
      
      return result;
      
    } catch (error) {
      console.error('图像处理失败:', error);
      this.updateProgress('error', 0, `处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
      
      return {
        imageData: await this.createEmptyImageData(file),
        ocrResults: [],
        roomDetection: {
          rooms: [],
          walls: [],
          doors: [],
          windows: [],
          confidence: 0,
          processingTime: 0
        },
        processingTime: performance.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 上传和预处理图像
   */
  private async uploadAndPreprocessImage(file: File): Promise<ImageUploadData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        
        img.onload = () => {
          const imageData: ImageUploadData = {
            file,
            url,
            width: img.width,
            height: img.height,
            format: file.type
          };
          
          resolve(imageData);
        };
        
        img.onerror = () => {
          reject(new Error('图像加载失败'));
        };
        
        img.src = url;
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * 转换为ImageData格式
   */
  private async convertToImageData(imageData: ImageUploadData): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建画布上下文'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageDataResult = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        resolve(imageDataResult);
      };
      
      img.onerror = () => {
        reject(new Error('图像加载失败'));
      };
      
      img.src = imageData.url;
    });
  }

  /**
   * 创建空的图像数据
   */
  private async createEmptyImageData(file: File): Promise<ImageUploadData> {
    return {
      file,
      url: '',
      width: 0,
      height: 0,
      format: file.type
    };
  }

  /**
   * 更新处理进度
   */
  private updateProgress(stage: ProcessingStage, progress: number, message: string): void {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        message,
        estimatedTimeRemaining: this.calculateEstimatedTime(progress)
      });
    }
  }

  /**
   * 计算预计剩余时间
   */
  private calculateEstimatedTime(progress: number): number | undefined {
    if (progress <= 0) return undefined;
    
    const elapsed = performance.now();
    const totalEstimated = (elapsed / progress) * 100;
    const remaining = totalEstimated - elapsed;
    
    return remaining > 0 ? Math.round(remaining) : undefined;
  }

  /**
   * 验证图像文件
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '不支持的文件格式。请上传 JPEG、PNG 或 WebP 格式的图像。'
      };
    }
    
    // 检查文件大小 (最大10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: '文件过大。请上传小于 10MB 的图像。'
      };
    }
    
    return { valid: true };
  }

  /**
   * 获取支持的文件格式
   */
  getSupportedFormats(): string[] {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  }

  /**
   * 获取最大文件大小
   */
  getMaxFileSize(): number {
    return 10 * 1024 * 1024; // 10MB
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await this.ocrProcessor.cleanup();
    this.roomDetector.cleanup();
  }
}

