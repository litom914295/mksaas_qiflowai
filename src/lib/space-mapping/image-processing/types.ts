/**
 * 图像处理类型定义
 */

export interface ImageProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
}

export interface ProcessedImage {
  url: string;
  metadata: ImageMetadata;
}

export interface Point {
  x: number;
  y: number;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  boundaries: Point[];
  coordinates?: Point[];
  center?: Point;
  area?: number;
  confidence?: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  length: number;
  type?: 'exterior' | 'interior' | 'load-bearing';
}
