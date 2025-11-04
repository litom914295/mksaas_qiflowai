/**
 * 风水罗盘类型定义
 *
 * 基于FengShuiCompass项目移植，适配React + TypeScript + Konva.js
 * 提供完整的风水罗盘类型系统
 */

// 基础类型定义
export interface Point {
  x: number;
  y: number;
}

export interface CompassConfig {
  radius: number;
  centralPoint: Point;
  defaultFontSize: number;
  layerPadding: number;
  borderWidth: number;
  borderColor: string;
  tianChiRadius: number;
  scaleHeight: number;
}

// 刻度样式配置
export interface ScaleStyle {
  minLineHeight: number;
  midLineHeight: number;
  maxLineHeight: number;
  numberFontSize: number;
}

// 层数据样式类型
export type TogetherStyle = 'empty' | 'equally' | 'son';

// 单层数据结构
export interface LayerData {
  name: string | string[];
  startAngle: number;
  fontSize?: number;
  textColor: string | string[];
  vertical?: boolean;
  togetherStyle?: TogetherStyle;
  data: string[] | string[][];
}

// 罗盘主题配置
export interface CompassTheme {
  name: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  scaleColor: string;
  tianxinCrossColor: string;
  layerColors: readonly string[];
}

// 天心十字配置
export interface TianxinCrossConfig {
  show: boolean;
  color: string;
  lineWidth: number;
}

// 传感器数据
export interface SensorData {
  direction: number;
  accuracy: number;
  timestamp: number;
  source: 'device' | 'manual' | 'gps';
}

// 设备方向事件扩展
export interface ExtendedDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassAccuracy?: number;
  webkitCompassHeading?: number;
}

// 权限状态
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

// AI分析结果 - 兼容现有组件的完整接口
export interface AIAnalysisResult {
  // 原有属性
  direction: number;
  mountain: string;
  bagua: string;
  confidence: number;
  analysis: string;
  suggestions: string[];
  timestamp: number;
  // 新增属性，兼容现有组件
  score: number;
  recommendations: string[];
  summary?: string;
  areas?: any[];
}

// 罗盘事件类型
export type CompassEventType =
  | 'direction_change'
  | 'calibration_start'
  | 'calibration_complete'
  | 'sensor_error'
  | 'ai_analysis_complete'
  | 'layer_click'
  | 'scale_click';

export interface CompassEvent {
  type: CompassEventType;
  timestamp: number;
  data?: any;
}

// 罗盘组件属性
export interface FengShuiCompassProps {
  width: number;
  height: number;
  theme?: keyof typeof COMPASS_THEMES;
  showTianxinCross?: boolean;
  showScale?: boolean;
  enableSensor?: boolean;
  enableAI?: boolean;
  customData?: LayerData[];
  onEvent?: (event: CompassEvent) => void;
  onDirectionChange?: (direction: number, accuracy: number) => void;
  onAnalysisResult?: (result: AIAnalysisResult) => void;
}

// 罗盘渲染器配置
export interface RendererConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pixelRatio: number;
}

// 填充配置
export interface LayerFill {
  layerIndex: number;
  color: string;
}

export interface LatticeFill {
  latticeIndex: number;
  layerIndex: number;
  color: string;
}

// 预定义主题
export const COMPASS_THEMES = {
  classic: {
    name: '经典',
    backgroundColor: '#1a1a1a',
    borderColor: '#00ffff',
    textColor: '#ffffff',
    scaleColor: '#ff0000',
    tianxinCrossColor: '#ff0000',
    layerColors: ['#2a2a2a', '#3a3a3a', '#4a4a4a'],
  },
  modern: {
    name: '现代',
    backgroundColor: '#0f172a',
    borderColor: '#3b82f6',
    textColor: '#f1f5f9',
    scaleColor: '#ef4444',
    tianxinCrossColor: '#ef4444',
    layerColors: ['#1e293b', '#334155', '#475569'],
  },
  traditional: {
    name: '传统',
    backgroundColor: '#7c2d12',
    borderColor: '#fbbf24',
    textColor: '#fef3c7',
    scaleColor: '#dc2626',
    tianxinCrossColor: '#dc2626',
    layerColors: ['#92400e', '#a16207', '#ca8a04'],
  },
  elegant: {
    name: '优雅紫韵',
    backgroundColor: '#1e1b4b',
    borderColor: '#8b5cf6',
    textColor: '#e0e7ff',
    scaleColor: '#f59e0b',
    tianxinCrossColor: '#f59e0b',
    layerColors: ['#312e81', '#3730a3', '#4338ca'],
  },
  nature: {
    name: '自然翠绿',
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
    textColor: '#ecfdf5',
    scaleColor: '#f59e0b',
    tianxinCrossColor: '#f59e0b',
    layerColors: ['#065f46', '#047857', '#059669'],
  },
  golden: {
    name: '金辉典雅',
    backgroundColor: '#7c2d12',
    borderColor: '#fbbf24',
    textColor: '#fef3c7',
    scaleColor: '#dc2626',
    tianxinCrossColor: '#dc2626',
    layerColors: ['#92400e', '#a16207', '#ca8a04'],
  },
  ocean: {
    name: '深海蓝韵',
    backgroundColor: '#0c4a6e',
    borderColor: '#0ea5e9',
    textColor: '#e0f2fe',
    scaleColor: '#f97316',
    tianxinCrossColor: '#f97316',
    layerColors: ['#075985', '#0369a1', '#0284c7'],
  },
} as const;

// 导出常量
export const CORRECTION_ANGLE = -90;
export const TOGETHER_STYLE_EMPTY = 'empty';
export const TOGETHER_STYLE_EQUALLY = 'equally';
export const TOGETHER_STYLE_SON = 'son';
