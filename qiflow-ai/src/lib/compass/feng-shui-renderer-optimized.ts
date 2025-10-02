/**
 * 优化版风水罗盘Konva.js渲染器
 * 
 * 全面视觉优化版本：
 * 1. 解决外圈刻度数字重叠问题
 * 2. 重新设计八卦文字显示
 * 3. 重构九宫布局算法
 * 4. 现代化配色方案和设计风格
 */

import Konva from 'konva';
import {
  CompassUtil,
  FengShuiCompassEngine
} from './feng-shui-engine';
import {
  COMPASS_THEMES,
  CompassTheme,
  LayerData,
  ScaleStyle,
  TianxinCrossConfig
} from './feng-shui-types';

// 优化后的刻度样式配置
interface OptimizedScaleStyle extends ScaleStyle {
  numberOffset: number;
  numberSpacing: number;
  adaptiveFontSize: boolean;
  showAllNumbers: boolean;
}

// 优化后的文字渲染配置
interface TextRenderConfig {
  fontFamily: string;
  fontWeight: string;
  letterSpacing: number;
  lineHeight: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffset: { x: number; y: number };
}

// 优化后的层配置
interface OptimizedLayerConfig {
  spacing: number;
  padding: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderOpacity: number;
  backgroundOpacity: number;
  gradientEnabled: boolean;
}

export class FengShuiCompassRendererOptimized {
  private engine: FengShuiCompassEngine;
  private util: CompassUtil;
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private theme: CompassTheme;
  private optimizedScaleStyle: OptimizedScaleStyle;
  private textRenderConfig: TextRenderConfig;
  private layerConfig: OptimizedLayerConfig;
  private tianxinCrossConfig: TianxinCrossConfig;

  constructor(
    container: HTMLDivElement,
    width: number,
    height: number,
    theme: keyof typeof COMPASS_THEMES = 'classic'
  ) {
    // 确保半径为正数，最小半径为50
    const minSize = Math.min(width, height);
    const radius = Math.max(50, minSize / 2 - 60);
    this.engine = new FengShuiCompassEngine({ x: width / 2, y: height / 2 }, radius);
    this.util = new CompassUtil(this.engine);
    this.theme = COMPASS_THEMES[theme];
    
    // 初始化Konva舞台
    this.stage = new Konva.Stage({
      container,
      width,
      height,
    });
    
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    
    // 优化后的刻度样式配置
    this.optimizedScaleStyle = {
      minLineHeight: 8,
      midLineHeight: 12,
      maxLineHeight: 18,
      numberFontSize: this.calculateAdaptiveFontSize(width, height),
      numberOffset: 25,
      numberSpacing: 30, // 每30度显示一个数字
      adaptiveFontSize: true,
      showAllNumbers: false,
    };
    
    // 优化后的文字渲染配置
    this.textRenderConfig = {
      fontFamily: 'PingFang SC, Microsoft YaHei, SimHei, serif',
      fontWeight: '500',
      letterSpacing: 1,
      lineHeight: 1.2,
      shadowEnabled: true,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 3,
      shadowOffset: { x: 1, y: 1 },
    };
    
    // 优化后的层配置
    this.layerConfig = {
      spacing: 8,
      padding: 6,
      borderStyle: 'solid',
      borderOpacity: 0.8,
      backgroundOpacity: 0.1,
      gradientEnabled: true,
    };
    
    // 天心十字配置
    this.tianxinCrossConfig = {
      show: true,
      color: this.theme.tianxinCrossColor,
      lineWidth: 2,
    };
  }

  // 计算自适应字体大小
  private calculateAdaptiveFontSize(width: number, height: number): number {
    const baseSize = Math.min(width, height);
    if (baseSize < 400) return 10;
    if (baseSize < 600) return 12;
    if (baseSize < 800) return 14;
    return 16;
  }

  // 设置主题
  setTheme(theme: keyof typeof COMPASS_THEMES): this {
    this.theme = COMPASS_THEMES[theme];
    this.tianxinCrossConfig.color = this.theme.tianxinCrossColor;
    return this;
  }

  // 设置优化后的刻度样式
  setOptimizedScaleStyle(style: Partial<OptimizedScaleStyle>): this {
    this.optimizedScaleStyle = { ...this.optimizedScaleStyle, ...style };
    return this;
  }

  // 设置文字渲染配置
  setTextRenderConfig(config: Partial<TextRenderConfig>): this {
    this.textRenderConfig = { ...this.textRenderConfig, ...config };
    return this;
  }

  // 设置天心十字配置
  setTianxinCross(config: Partial<TianxinCrossConfig>): this {
    this.tianxinCrossConfig = { ...this.tianxinCrossConfig, ...config };
    return this;
  }

  // 设置罗盘数据并渲染
  setCompassData(data: LayerData[]): this {
    this.engine.setCompassData(data);
    return this;
  }

  // 主渲染方法
  draw(): void {
    this.layer.listening(false);
    this.layer.destroyChildren();
    
    try {
      // 绘制背景渐变
      this.drawOptimizedBackground();
      
      // 绘制天池
      this.drawOptimizedTianChi();
      
      // 绘制各层（优化版）
      this.drawOptimizedLayers();
      
      // 绘制优化后的刻度
      this.drawOptimizedScale();
      
      // 绘制天心十字
      if (this.tianxinCrossConfig.show) {
        this.drawOptimizedTianxinCross();
      }
      
      // 添加装饰元素
      this.drawDecorations();
      
      // 批量渲染
      this.layer.batchDraw();
    } catch (error) {
      console.error('优化渲染失败:', error);
      throw new Error(`Optimized compass rendering failed: ${error}`);
    } finally {
      this.layer.listening(true);
    }
  }

  // 绘制优化后的背景（渐变效果）
  private drawOptimizedBackground(): void {
    const config = this.engine.getConfig();
    
    // 创建径向渐变
    const gradient = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: config.radius,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: config.radius,
      fillRadialGradientColorStops: [
        0, this.lightenColor(this.theme.backgroundColor, 0.2),
        0.7, this.theme.backgroundColor,
        1, this.darkenColor(this.theme.backgroundColor, 0.3)
      ],
      stroke: this.theme.borderColor,
      strokeWidth: config.borderWidth,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      shadowBlur: 10,
      shadowOffset: { x: 2, y: 2 },
    });
    
    this.layer.add(gradient);
  }

  // 绘制优化后的天池
  private drawOptimizedTianChi(): void {
    const config = this.engine.getConfig();
    
    // 外圈装饰
    const outerRing = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: config.tianChiRadius + 8,
      stroke: this.theme.borderColor,
      strokeWidth: 2,
      opacity: 0.6,
    });
    
    // 主体天池
    const tianChi = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: config.tianChiRadius,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: config.tianChiRadius,
      fillRadialGradientColorStops: [
        0, this.lightenColor(this.theme.backgroundColor, 0.4),
        1, this.theme.backgroundColor
      ],
      stroke: this.theme.borderColor,
      strokeWidth: config.borderWidth,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 8,
      shadowOffset: { x: 0, y: 0 },
    });
    
    // 中心指针
    const pointer = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: 6,
      fill: this.theme.tianxinCrossColor,
      stroke: this.lightenColor(this.theme.tianxinCrossColor, 0.3),
      strokeWidth: 2,
    });
    
    this.layer.add(outerRing);
    this.layer.add(tianChi);
    this.layer.add(pointer);
  }

  // 绘制优化后的所有层
  private drawOptimizedLayers(): void {
    const compassData = this.engine.getCompassData();
    
    for (let i = 0; i < compassData.length; i++) {
      this.drawOptimizedLayer(i);
      this.drawOptimizedLayerBorder(i);
    }
  }

  // 绘制优化后的单层
  private drawOptimizedLayer(layerIndex: number): void {
    const layerData = this.engine.getLayerData(layerIndex);
    const config = this.engine.getConfig();
    const layerRadius = this.engine.getLayerRadius(layerIndex);
    const layerHeight = this.engine.getLayerHeights()[layerIndex];
    
    // 计算优化后的字体大小
    const optimizedFontSize = this.calculateLayerFontSize(layerIndex, layerData);
    
    for (let i = 0; i < layerData.data.length; i++) {
      const angle = layerData.startAngle + (360 / layerData.data.length) * i;
      
      if (Array.isArray(layerData.data[i])) {
        // 处理多重数据（八卦等）
        const multiData = layerData.data[i] as string[];
        const colors = Array.isArray(layerData.textColor) ? layerData.textColor : [layerData.textColor];
        
        for (let j = 0; j < multiData.length; j++) {
          const subAngle = this.calculateOptimizedSubAngle(layerData, i, j);
          const color = colors[j] || colors[0] || this.theme.textColor;
          const subRadius = layerRadius + (layerHeight / multiData.length) * (j + 0.5);
          
          this.drawOptimizedText(
            multiData[j],
            config.centralPoint,
            subRadius,
            angle + subAngle,
            optimizedFontSize * (j === 1 ? 1.2 : 0.9), // 中间的文字稍大
            color,
            layerData.vertical || false,
            layerIndex
          );
        }
      } else {
        // 处理单一数据
        const color = Array.isArray(layerData.textColor) ? layerData.textColor[0] : layerData.textColor;
        this.drawOptimizedText(
          layerData.data[i] as string,
          config.centralPoint,
          layerRadius + layerHeight / 2,
          angle,
          optimizedFontSize,
          color || this.theme.textColor,
          layerData.vertical || false,
          layerIndex
        );
      }
    }
  }

  // 计算层的优化字体大小
  private calculateLayerFontSize(layerIndex: number, layerData: LayerData): number {
    const baseSize = layerData.fontSize || this.engine.getConfig().defaultFontSize;
    const layerHeight = this.engine.getLayerHeights()[layerIndex];
    const dataLength = layerData.data.length;
    
    // 根据层高度和数据密度调整字体大小
    let scaleFactor = 1;
    
    if (layerIndex === 0) {
      // 最内层（八数）- 较大字体
      scaleFactor = Math.min(1.2, layerHeight / 60);
    } else if (layerIndex === 1) {
      // 八卦层 - 中等字体
      scaleFactor = Math.min(0.8, layerHeight / 80);
    } else {
      // 外层 - 根据数据密度调整
      scaleFactor = Math.min(0.9, layerHeight / (dataLength * 3));
    }
    
    return Math.max(12, Math.min(baseSize * scaleFactor, layerHeight * 0.6));
  }

  // 计算优化后的子角度
  private calculateOptimizedSubAngle(layerData: LayerData, dataIndex: number, subIndex: number): number {
    if (layerData.togetherStyle === 'equally') {
      const totalData = layerData.data as string[][];
      const subDataLength = totalData[dataIndex].length;
      const singleAngle = 360 / layerData.data.length;
      
      if (subDataLength === 2) {
        return subIndex === 0 ? -singleAngle / 6 : singleAngle / 6;
      } else if (subDataLength === 3) {
        return (-singleAngle / 4) + (singleAngle * subIndex / 2);
      }
    }
    return 0;
  }

  // 绘制优化后的文字
  private drawOptimizedText(
    text: string,
    center: { x: number; y: number },
    radius: number,
    angle: number,
    fontSize: number,
    color: string,
    vertical: boolean,
    layerIndex: number
  ): void {
    const radian = this.engine.rads(angle);
    const x = center.x + Math.cos(radian) * radius;
    const y = center.y + Math.sin(radian) * radius;
    
    // 根据层级选择不同的渲染样式
    const isSpecialLayer = layerIndex === 1; // 八卦层特殊处理
    
    if (vertical && text.length > 1) {
      // 垂直文字，逐字绘制
      for (let i = 0; i < text.length; i++) {
        const charY = y + (i - (text.length - 1) / 2) * fontSize * this.textRenderConfig.lineHeight;
        const char = new Konva.Text({
          x: x,
          y: charY,
          text: text[i],
          fontSize,
          fontFamily: this.textRenderConfig.fontFamily,
          fontStyle: isSpecialLayer ? 'bold' : 'normal',
          fill: color,
          align: 'center',
          verticalAlign: 'middle',
          offsetX: fontSize / 2,
          offsetY: fontSize / 2,
          rotation: (angle + 90) % 360,
          shadowColor: this.textRenderConfig.shadowColor,
          shadowBlur: this.textRenderConfig.shadowBlur,
          shadowOffset: this.textRenderConfig.shadowOffset,
          shadowEnabled: this.textRenderConfig.shadowEnabled,
        });
        this.layer.add(char);
      }
    } else {
      // 水平文字
      const textNode = new Konva.Text({
        x: x,
        y: y,
        text,
        fontSize,
        fontFamily: this.textRenderConfig.fontFamily,
        fontStyle: isSpecialLayer ? 'bold' : 'normal',
        fill: color,
        align: 'center',
        verticalAlign: 'middle',
        offsetX: text.length * fontSize / 4,
        offsetY: fontSize / 2,
        rotation: (angle + 90) % 360,
        shadowColor: this.textRenderConfig.shadowColor,
        shadowBlur: this.textRenderConfig.shadowBlur,
        shadowOffset: this.textRenderConfig.shadowOffset,
        shadowEnabled: this.textRenderConfig.shadowEnabled,
        letterSpacing: this.textRenderConfig.letterSpacing,
      });
      this.layer.add(textNode);
    }
  }

  // 绘制优化后的层边框
  private drawOptimizedLayerBorder(layerIndex: number): void {
    const config = this.engine.getConfig();
    const layerRadius = this.engine.getLayerRadius(layerIndex);
    const layerHeight = this.engine.getLayerHeights()[layerIndex];
    const dataLength = this.engine.getLayerDataLength(layerIndex);
    
    // 绘制圆形边框（带渐变效果）
    const circle = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: layerRadius + layerHeight,
      stroke: this.theme.borderColor,
      strokeWidth: config.borderWidth * 0.8,
      opacity: this.layerConfig.borderOpacity,
      dash: this.layerConfig.borderStyle === 'dashed' ? [5, 5] : undefined,
    });
    this.layer.add(circle);
    
    // 绘制分隔线（优化间距）
    for (let i = 0; i < dataLength; i++) {
      const angle = (360 / dataLength) * i + (360 / dataLength) / 2;
      const radian = this.engine.rads(angle);
      
      const startX = config.centralPoint.x + Math.cos(radian) * layerRadius;
      const startY = config.centralPoint.y + Math.sin(radian) * layerRadius;
      const endX = config.centralPoint.x + Math.cos(radian) * (layerRadius + layerHeight);
      const endY = config.centralPoint.y + Math.sin(radian) * (layerRadius + layerHeight);
      
      const line = new Konva.Line({
        points: [startX, startY, endX, endY],
        stroke: this.theme.borderColor,
        strokeWidth: config.borderWidth * 0.6,
        opacity: 0.6,
      });
      this.layer.add(line);
    }
  }

  // 绘制优化后的刻度（解决重叠问题）
  private drawOptimizedScale(): void {
    const config = this.engine.getConfig();
    const scaleRadius = this.engine.getLayerRadius(this.engine.getLayersLength()) + config.scaleHeight / 2;
    
    for (let i = 0; i < 360; i++) {
      const radian = this.engine.rads(i);
      const startX = config.centralPoint.x + Math.cos(radian) * (scaleRadius - 8);
      const startY = config.centralPoint.y + Math.sin(radian) * (scaleRadius - 8);
      
      let endX: number, endY: number, strokeWidth: number;
      let showNumber = false;
      
      if (i % this.optimizedScaleStyle.numberSpacing === 0) {
        // 主刻度 - 每30度一个
        endX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.optimizedScaleStyle.maxLineHeight);
        endY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.optimizedScaleStyle.maxLineHeight);
        strokeWidth = 2.5;
        showNumber = true;
      } else if (i % 10 === 0) {
        // 中刻度 - 每10度一个
        endX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.optimizedScaleStyle.midLineHeight);
        endY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.optimizedScaleStyle.midLineHeight);
        strokeWidth = 1.8;
      } else if (i % 5 === 0) {
        // 小刻度 - 每5度一个
        endX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.optimizedScaleStyle.minLineHeight);
        endY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.optimizedScaleStyle.minLineHeight);
        strokeWidth = 1.2;
      } else {
        // 最小刻度
        endX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.optimizedScaleStyle.minLineHeight * 0.6);
        endY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.optimizedScaleStyle.minLineHeight * 0.6);
        strokeWidth = 0.8;
      }
      
      // 绘制刻度线
      const line = new Konva.Line({
        points: [startX, startY, endX, endY],
        stroke: this.theme.scaleColor,
        strokeWidth,
        opacity: showNumber ? 1 : 0.7,
      });
      this.layer.add(line);
      
      // 绘制数字（优化间距，避免重叠）
      if (showNumber) {
        const textX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.optimizedScaleStyle.maxLineHeight + this.optimizedScaleStyle.numberOffset);
        const textY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.optimizedScaleStyle.maxLineHeight + this.optimizedScaleStyle.numberOffset);
        
        const text = new Konva.Text({
          x: textX,
          y: textY,
          text: i.toString(),
          fontSize: this.optimizedScaleStyle.numberFontSize,
          fontFamily: 'Arial, sans-serif',
          fontStyle: 'bold',
          fill: this.theme.scaleColor,
          align: 'center',
          verticalAlign: 'middle',
          offsetX: this.optimizedScaleStyle.numberFontSize / 2,
          offsetY: this.optimizedScaleStyle.numberFontSize / 2,
          shadowColor: 'rgba(0, 0, 0, 0.8)',
          shadowBlur: 2,
          shadowOffset: { x: 1, y: 1 },
          shadowEnabled: true,
        });
        this.layer.add(text);
      }
    }
  }

  // 绘制优化后的天心十字
  private drawOptimizedTianxinCross(): void {
    const config = this.engine.getConfig();
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();
    
    // 水平线（带渐变效果）
    const horizontalLine = new Konva.Line({
      points: [0, config.centralPoint.y, stageWidth, config.centralPoint.y],
      stroke: this.tianxinCrossConfig.color,
      strokeWidth: this.tianxinCrossConfig.lineWidth,
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowBlur: 4,
      shadowOffset: { x: 0, y: 2 },
      opacity: 0.9,
    });
    
    // 垂直线（带渐变效果）
    const verticalLine = new Konva.Line({
      points: [config.centralPoint.x, 0, config.centralPoint.x, stageHeight],
      stroke: this.tianxinCrossConfig.color,
      strokeWidth: this.tianxinCrossConfig.lineWidth,
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowBlur: 4,
      shadowOffset: { x: 2, y: 0 },
      opacity: 0.9,
    });
    
    this.layer.add(horizontalLine);
    this.layer.add(verticalLine);
  }

  // 绘制装饰元素
  private drawDecorations(): void {
    const config = this.engine.getConfig();
    
    // 添加四个方位标记
    const directions = [
      { angle: 0, text: '北', color: this.theme.scaleColor },
      { angle: 90, text: '东', color: this.theme.scaleColor },
      { angle: 180, text: '南', color: this.theme.scaleColor },
      { angle: 270, text: '西', color: this.theme.scaleColor },
    ];
    
    directions.forEach(dir => {
      const radian = this.engine.rads(dir.angle);
      const radius = config.radius - 30;
      const x = config.centralPoint.x + Math.cos(radian) * radius;
      const y = config.centralPoint.y + Math.sin(radian) * radius;
      
      // 方位背景圆
      const bg = new Konva.Circle({
        x, y,
        radius: 18,
        fill: this.darkenColor(this.theme.backgroundColor, 0.3),
        stroke: dir.color,
        strokeWidth: 2,
        opacity: 0.8,
      });
      
      // 方位文字
      const text = new Konva.Text({
        x, y,
        text: dir.text,
        fontSize: 16,
        fontFamily: this.textRenderConfig.fontFamily,
        fontStyle: 'bold',
        fill: dir.color,
        align: 'center',
        verticalAlign: 'middle',
        offsetX: 8,
        offsetY: 8,
      });
      
      this.layer.add(bg);
      this.layer.add(text);
    });
  }

  // 颜色工具方法
  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // 获取引擎实例
  getEngine(): FengShuiCompassEngine {
    return this.engine;
  }

  // 获取工具实例
  getUtil(): CompassUtil {
    return this.util;
  }

  // 获取Konva舞台
  getStage(): Konva.Stage {
    return this.stage;
  }

  // 销毁渲染器
  destroy(): void {
    this.stage.destroy();
  }
}