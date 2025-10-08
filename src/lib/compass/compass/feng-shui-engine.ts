/**
 * 风水罗盘核心引擎
 * 
 * 基于原FengShuiCompass JavaScript代码转换为TypeScript
 * 提供罗盘计算、数据处理和渲染逻辑
 */

import { DEFAULT_CONFIG } from './feng-shui-data';
import {
    CompassConfig,
    CORRECTION_ANGLE,
    LatticeFill,
    LayerData,
    LayerFill,
    Point
} from './feng-shui-types';

export class FengShuiCompassEngine {
  private config: CompassConfig;
  private layerHeights: number[] = [];
  private latticeFills: LatticeFill[] = [];
  private layerFills: LayerFill[] = [];
  private compassData: LayerData[] = [];

  constructor(centerPoint?: Point, radius?: number) {
    this.config = {
      ...DEFAULT_CONFIG,
      centralPoint: centerPoint || DEFAULT_CONFIG.centralPoint,
      radius: radius || DEFAULT_CONFIG.radius,
    };
  }

  // 配置方法
  setCenterPoint(x: number, y: number): this {
    this.config.centralPoint = { x, y };
    return this;
  }

  setRadius(radius: number): this {
    this.config.radius = radius;
    return this;
  }

  setBorder(width: number, color: string): this {
    this.config.borderWidth = width;
    this.config.borderColor = color;
    return this;
  }

  setTianChiRadius(radius: number): this {
    this.config.tianChiRadius = radius;
    return this;
  }

  setLayerPadding(padding: number): this {
    this.config.layerPadding = padding;
    return this;
  }

  // 数据设置方法
  setCompassData(data: LayerData[]): this {
    this.compassData = this.validateCompassData(data);
    this.initLayerHeights();
    return this;
  }

  setLatticeFill(fills: LatticeFill[]): this {
    this.latticeFills = fills;
    return this;
  }

  setLayerFill(fills: LayerFill[]): this {
    this.layerFills = fills;
    return this;
  }

  // 获取方法
  getConfig(): CompassConfig {
    return this.config;
  }

  getCompassData(): LayerData[] {
    return this.compassData;
  }

  getLayerData(index: number): LayerData {
    return this.compassData[index];
  }

  getLayerHeights(): number[] {
    return this.layerHeights;
  }

  getLayersLength(): number {
    return this.compassData.length;
  }

  getLayerDataLength(index: number): number {
    const layerData = this.getLayerData(index);
    if (Array.isArray(layerData.data[0])) {
      return (layerData.data[0] as string[]).length;
    }
    return layerData.data.length;
  }

  // 计算指定层的半径
  getLayerRadius(index: number): number {
    let radius = this.config.tianChiRadius + this.config.borderWidth;
    for (let i = 0; i < index; i++) {
      radius += this.layerHeights[i];
    }
    return radius;
  }

  // 角度转弧度
  rads(degrees: number): number {
    return Math.PI * (degrees + CORRECTION_ANGLE) / 180;
  }

  // 根据角度获取对应的数据
  getDataByAngle(layerIndex: number, angle: number): string {
    if (layerIndex < 0 || layerIndex >= this.compassData.length) {
      throw new Error(`Invalid layer index: ${layerIndex}`);
    }
    
    const layerData = this.getLayerData(layerIndex);
    const dataLength = this.getLayerDataLength(layerIndex);
    
    if (dataLength === 0) {
      throw new Error(`Layer ${layerIndex} has no data`);
    }
    
    const singleAngle = 360 / dataLength;
    const normalizedAngle = ((angle % 360) + 360) % 360;
    const dataIndex = Math.floor((layerData.startAngle + normalizedAngle) / singleAngle) % dataLength;
    
    if (Array.isArray(layerData.data[dataIndex])) {
      const arrayData = layerData.data[dataIndex] as string[];
      return arrayData.length > 0 ? arrayData[0] : '';
    }
    return layerData.data[dataIndex] as string || '';
  }

  // 初始化层高度
  private initLayerHeights(): void {
    this.layerHeights = [];
    for (let i = 0; i < this.getLayersLength(); i++) {
      const layerData = this.getLayerData(i);
      const height = this.calculateLayerHeight(i, layerData.fontSize || this.config.defaultFontSize, layerData.vertical || false);
      this.layerHeights.push(height);
    }
  }

  // 计算层高度
  private calculateLayerHeight(layerIndex: number, fontSize: number, vertical: boolean): number {
    const availableHeight = (this.config.radius - this.config.tianChiRadius - this.config.scaleHeight) / this.getLayersLength();
    return availableHeight;
  }

  // 验证罗盘数据
  private validateCompassData(data: LayerData[]): LayerData[] {
    return data.map((layer, index) => {
      const validatedLayer = { ...layer };
      
      // 验证名称
      if (!validatedLayer.name) {
        console.warn(`Layer ${index}: name should be a non-empty string`);
        validatedLayer.name = `Layer ${index}`;
      }
      
      // 验证起始角度
      if (validatedLayer.startAngle == null || validatedLayer.startAngle > 360 || validatedLayer.startAngle < 0) {
        validatedLayer.startAngle = 0;
        console.warn(`Layer ${index}: startAngle should be between 0 and 360, set to 0`);
      }
      
      // 验证垂直属性
      if (typeof validatedLayer.vertical !== 'boolean') {
        validatedLayer.vertical = false;
      }
      
      // 验证字体大小
      if (typeof validatedLayer.fontSize !== 'number') {
        validatedLayer.fontSize = this.config.defaultFontSize;
      }
      
      // 验证组合样式
      if (!['empty', 'equally', 'son'].includes(validatedLayer.togetherStyle || '')) {
        validatedLayer.togetherStyle = 'empty';
      }
      
      return validatedLayer;
    });
  }
}

// 罗盘工具类
export class CompassUtil {
  private engine: FengShuiCompassEngine;

  constructor(engine: FengShuiCompassEngine) {
    this.engine = engine;
  }

  // 根据角度获取指定层的数据
  getAngleData(layerIndex: number, angle: number): string {
    return this.engine.getDataByAngle(layerIndex, angle);
  }

  // 获取二十四山信息
  getTwentyFourMountain(angle: number): { name: string; bagua: string; element: string } {
    const mountainIndex = Math.floor((angle + 7.5) / 15) % 24;
    const mountains = [
      { name: "子", bagua: "坎", element: "水" },
      { name: "癸", bagua: "坎", element: "水" },
      { name: "丑", bagua: "艮", element: "土" },
      { name: "艮", bagua: "艮", element: "土" },
      { name: "寅", bagua: "艮", element: "土" },
      { name: "甲", bagua: "震", element: "木" },
      { name: "卯", bagua: "震", element: "木" },
      { name: "乙", bagua: "震", element: "木" },
      { name: "辰", bagua: "巽", element: "木" },
      { name: "巽", bagua: "巽", element: "木" },
      { name: "巳", bagua: "巽", element: "木" },
      { name: "丙", bagua: "离", element: "火" },
      { name: "午", bagua: "离", element: "火" },
      { name: "丁", bagua: "离", element: "火" },
      { name: "未", bagua: "坤", element: "土" },
      { name: "坤", bagua: "坤", element: "土" },
      { name: "申", bagua: "坤", element: "土" },
      { name: "庚", bagua: "兑", element: "金" },
      { name: "酉", bagua: "兑", element: "金" },
      { name: "辛", bagua: "兑", element: "金" },
      { name: "戌", bagua: "乾", element: "金" },
      { name: "乾", bagua: "乾", element: "金" },
      { name: "亥", bagua: "乾", element: "金" },
      { name: "壬", bagua: "坎", element: "水" },
    ];
    
    return mountains[mountainIndex];
  }

  // 获取八卦信息
  getBaguaInfo(angle: number): { name: string; element: string; meaning: string } {
    const baguaIndex = Math.floor((angle + 22.5) / 45) % 8;
    const baguas = [
      { name: "坎", element: "水", meaning: "水" },
      { name: "艮", element: "土", meaning: "山" },
      { name: "震", element: "木", meaning: "雷" },
      { name: "巽", element: "木", meaning: "风" },
      { name: "离", element: "火", meaning: "火" },
      { name: "坤", element: "土", meaning: "地" },
      { name: "兑", element: "金", meaning: "泽" },
      { name: "乾", element: "金", meaning: "天" },
    ];
    
    return baguas[baguaIndex];
  }
}