/**
 * 图像处理相关类型定义
 */

export interface ImageUploadData {
  file: File;
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface RoomDetectionResult {
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  confidence: number;
  processingTime: number;
  quality?: number;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  coordinates: Point[];
  center: Point;
  area: number;
  confidence: number;
  annotations?: string[];
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number;
  type: 'exterior' | 'interior';
}

export interface Door {
  id: string;
  position: Point;
  width: number;
  type: 'single' | 'double' | 'sliding';
  direction: number; // 角度
}

export interface Window {
  id: string;
  position: Point;
  width: number;
  height: number;
  type: 'standard' | 'bay' | 'corner';
  direction: number; // 角度
}

export interface Point {
  x: number;
  y: number;
}

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'dining_room'
  | 'study'
  | 'storage'
  | 'balcony'
  | 'corridor'
  | 'unknown';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ImageProcessingConfig {
  enableOCR: boolean;
  enableRoomDetection: boolean;
  enableWallDetection: boolean;
  confidenceThreshold: number;
  maxProcessingTime: number; // ms
}

export interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // ms
}

export type ProcessingStage =
  | 'uploading'
  | 'preprocessing'
  | 'ocr_processing'
  | 'room_detection'
  | 'wall_detection'
  | 'postprocessing'
  | 'completed'
  | 'error';

export interface ImageAnalysisResult {
  imageData: ImageUploadData;
  ocrResults: OCRResult[];
  roomDetection: RoomDetectionResult;
  processingTime: number;
  success: boolean;
  error?: string;
}
