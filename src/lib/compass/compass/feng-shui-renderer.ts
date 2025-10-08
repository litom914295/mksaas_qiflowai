/**
 * 风水罗盘Konva.js渲染器
 * 
 * 基于Konva.js实现的高性能罗盘渲染引擎
 * 支持Canvas渲染、交互事件和动画效果
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

export class FengShuiCompassRenderer {
  private engine: FengShuiCompassEngine;
  private util: CompassUtil;
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private theme: CompassTheme;
  private scaleStyle: ScaleStyle;
  private tianxinCrossConfig: TianxinCrossConfig;

  constructor(
    container: HTMLDivElement,
    width: number,
    height: number,
    theme: keyof typeof COMPASS_THEMES = 'classic'
  ) {
    this.engine = new FengShuiCompassEngine({ x: width / 2, y: height / 2 }, Math.min(width, height) / 2 - 50);
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
    
    // 默认配置
    this.scaleStyle = {
      minLineHeight: 10,
      midLineHeight: 15,
      maxLineHeight: 20,
      numberFontSize: 30,
    };
    
    this.tianxinCrossConfig = {
      show: true,
      color: this.theme.tianxinCrossColor,
      lineWidth: 3,
    };
  }

  // 设置主题
  setTheme(theme: keyof typeof COMPASS_THEMES): this {
    this.theme = COMPASS_THEMES[theme];
    this.tianxinCrossConfig.color = this.theme.tianxinCrossColor;
    return this;
  }

  // 设置刻度样式
  setScaleStyle(style: Partial<ScaleStyle>): this {
    this.scaleStyle = { ...this.scaleStyle, ...style };
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
    // 使用批量更新优化性能
    this.layer.listening(false);
    this.layer.destroyChildren();
    
    try {
      // 绘制背景
      this.drawBackground();
      
      // 绘制天池
      this.drawTianChi();
      
      // 绘制各层
      this.drawLayers();
      
      // 绘制刻度
      this.drawScale();
      
      // 绘制天心十字
      if (this.tianxinCrossConfig.show) {
        this.drawTianxinCross();
      }
      
      // 批量渲染
      this.layer.batchDraw();
    } catch (error) {
      console.error('渲染失败:', error);
      throw new Error(`Compass rendering failed: ${error}`);
    } finally {
      this.layer.listening(true);
    }
  }

  // 绘制背景
  private drawBackground(): void {
    const config = this.engine.getConfig();
    const background = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: config.radius,
      fill: this.theme.backgroundColor,
      stroke: this.theme.borderColor,
      strokeWidth: config.borderWidth,
    });
    
    this.layer.add(background);
  }

  // 绘制天池
  private drawTianChi(): void {
    const config = this.engine.getConfig();
    const tianChi = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: config.tianChiRadius,
      fill: this.theme.backgroundColor,
      stroke: this.theme.borderColor,
      strokeWidth: config.borderWidth,
    });
    
    this.layer.add(tianChi);
  }

  // 绘制所有层
  private drawLayers(): void {
    const compassData = this.engine.getCompassData();
    
    for (let i = 0; i < compassData.length; i++) {
      this.drawLayer(i);
      this.drawLayerBorder(i);
    }
  }

  // 绘制单层
  private drawLayer(layerIndex: number): void {
    const layerData = this.engine.getLayerData(layerIndex);
    const config = this.engine.getConfig();
    const layerRadius = this.engine.getLayerRadius(layerIndex);
    const layerHeight = this.engine.getLayerHeights()[layerIndex];
    
    for (let i = 0; i < layerData.data.length; i++) {
      const angle = layerData.startAngle + (360 / layerData.data.length) * i;
      
      if (Array.isArray(layerData.data[i])) {
        // 处理多重数据
        const multiData = layerData.data[i] as string[];
        const colors = Array.isArray(layerData.textColor) ? layerData.textColor : [layerData.textColor];
        
        for (let j = 0; j < multiData.length; j++) {
          const subAngle = this.calculateSubAngle(layerData, i, j);
          const color = colors[j] || colors[0] || this.theme.textColor;
          this.drawText(
            multiData[j],
            config.centralPoint,
            layerRadius + layerHeight / 2,
            angle + subAngle,
            layerData.fontSize || config.defaultFontSize,
            color,
            layerData.vertical || false
          );
        }
      } else {
        // 处理单一数据
        const color = Array.isArray(layerData.textColor) ? layerData.textColor[0] : layerData.textColor;
        this.drawText(
          layerData.data[i] as string,
          config.centralPoint,
          layerRadius + layerHeight / 2,
          angle,
          layerData.fontSize || config.defaultFontSize,
          color || this.theme.textColor,
          layerData.vertical || false
        );
      }
    }
  }

  // 计算子角度（用于多重数据）
  private calculateSubAngle(layerData: LayerData, dataIndex: number, subIndex: number): number {
    if (layerData.togetherStyle === 'equally') {
      const totalData = layerData.data as string[][];
      const singleAngle = 360 / totalData[dataIndex].length;
      
      if (totalData.length === 2) {
        return subIndex === 0 ? -singleAngle / 4 : singleAngle / 4;
      } else if (totalData.length === 3) {
        return (-singleAngle / 3) + (singleAngle * subIndex / 3);
      }
    }
    return 0;
  }

  // 绘制文字
  private drawText(
    text: string,
    center: { x: number; y: number },
    radius: number,
    angle: number,
    fontSize: number,
    color: string,
    vertical: boolean
  ): void {
    const radian = this.engine.rads(angle);
    const x = center.x + Math.cos(radian) * radius;
    const y = center.y + Math.sin(radian) * radius;
    
    if (vertical && text.length > 1) {
      // 垂直文字，逐字绘制
      for (let i = 0; i < text.length; i++) {
        const charY = y + (i - (text.length - 1) / 2) * fontSize * 0.8;
        const char = new Konva.Text({
          x: x,
          y: charY,
          text: text[i],
          fontSize,
          fontFamily: '楷书, serif',
          fill: color,
          align: 'center',
          verticalAlign: 'middle',
          offsetX: fontSize / 2,
          offsetY: fontSize / 2,
          rotation: (angle + 90) % 360,
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
        fontFamily: '楷书, serif',
        fill: color,
        align: 'center',
        verticalAlign: 'middle',
        offsetX: text.length * fontSize / 4,
        offsetY: fontSize / 2,
        rotation: (angle + 90) % 360,
      });
      this.layer.add(textNode);
    }
  }

  // 绘制层边框
  private drawLayerBorder(layerIndex: number): void {
    const config = this.engine.getConfig();
    const layerRadius = this.engine.getLayerRadius(layerIndex);
    const layerHeight = this.engine.getLayerHeights()[layerIndex];
    const dataLength = this.engine.getLayerDataLength(layerIndex);
    
    // 绘制圆形边框
    const circle = new Konva.Circle({
      x: config.centralPoint.x,
      y: config.centralPoint.y,
      radius: layerRadius + layerHeight,
      stroke: this.theme.borderColor,
      strokeWidth: config.borderWidth,
    });
    this.layer.add(circle);
    
    // 绘制分隔线
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
        strokeWidth: config.borderWidth,
      });
      this.layer.add(line);
    }
  }

  // 绘制刻度
  private drawScale(): void {
    const config = this.engine.getConfig();
    const scaleRadius = this.engine.getLayerRadius(this.engine.getLayersLength()) + config.scaleHeight / 2;
    
    for (let i = 0; i < 360; i++) {
      const radian = this.engine.rads(i);
      const startX = config.centralPoint.x + Math.cos(radian) * (scaleRadius - 10);
      const startY = config.centralPoint.y + Math.sin(radian) * (scaleRadius - 10);
      
      let endX: number, endY: number, strokeWidth: number;
      
      if (i % 10 === 0) {
        // 主刻度
        endX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.scaleStyle.maxLineHeight);
        endY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.scaleStyle.maxLineHeight);
        strokeWidth = 2;
        
        // 添加数字
        const textX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.scaleStyle.maxLineHeight + 15);
        const textY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.scaleStyle.maxLineHeight + 15);
        
        const text = new Konva.Text({
          x: textX,
          y: textY,
          text: i.toString(),
          fontSize: this.scaleStyle.numberFontSize,
          fontFamily: 'Arial',
          fill: this.theme.scaleColor,
          align: 'center',
          verticalAlign: 'middle',
          offsetX: this.scaleStyle.numberFontSize / 2,
          offsetY: this.scaleStyle.numberFontSize / 2,
        });
        this.layer.add(text);
      } else if (i % 5 === 0) {
        // 中刻度
        endX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.scaleStyle.midLineHeight);
        endY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.scaleStyle.midLineHeight);
        strokeWidth = 1.5;
      } else {
        // 小刻度
        endX = config.centralPoint.x + Math.cos(radian) * (scaleRadius + this.scaleStyle.minLineHeight);
        endY = config.centralPoint.y + Math.sin(radian) * (scaleRadius + this.scaleStyle.minLineHeight);
        strokeWidth = 1;
      }
      
      const line = new Konva.Line({
        points: [startX, startY, endX, endY],
        stroke: this.theme.scaleColor,
        strokeWidth,
      });
      this.layer.add(line);
    }
  }

  // 绘制天心十字
  private drawTianxinCross(): void {
    const config = this.engine.getConfig();
    const stageWidth = this.stage.width();
    const stageHeight = this.stage.height();
    
    // 水平线
    const horizontalLine = new Konva.Line({
      points: [0, config.centralPoint.y, stageWidth, config.centralPoint.y],
      stroke: this.tianxinCrossConfig.color,
      strokeWidth: this.tianxinCrossConfig.lineWidth,
    });
    
    // 垂直线
    const verticalLine = new Konva.Line({
      points: [config.centralPoint.x, 0, config.centralPoint.x, stageHeight],
      stroke: this.tianxinCrossConfig.color,
      strokeWidth: this.tianxinCrossConfig.lineWidth,
    });
    
    this.layer.add(horizontalLine);
    this.layer.add(verticalLine);
  }

  // 获取引擎实例（用于外部访问）
  getEngine(): FengShuiCompassEngine {
    return this.engine;
  }

  // 获取工具实例
  getUtil(): CompassUtil {
    return this.util;
  }

  // 获取Konva舞台（用于事件处理）
  getStage(): Konva.Stage {
    return this.stage;
  }

  // 销毁渲染器
  destroy(): void {
    this.stage.destroy();
  }
}