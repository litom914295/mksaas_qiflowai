/**
 * 增强版风水罗盘渲染器
 *
 * 严格按照UI规范实现的现代化罗盘渲染引擎：
 * 1. 解决文字重叠问题
 * 2. 优化八卦文字显示
 * 3. 重构九宫布局
 * 4. 品牌色系合规
 * 5. 流畅动画效果
 */

import Konva from 'konva';
import {
  OPTIMIZED_COMPASS_THEMES,
  type OptimizedCompassTheme,
  ThemeUtils,
} from './feng-shui-themes-optimized';
import type { LayerData } from './feng-shui-types';

export interface EnhancedRenderConfig {
  width: number;
  height: number;
  theme: keyof typeof OPTIMIZED_COMPASS_THEMES;
  showAnimations: boolean;
  showShadows: boolean;
  highDPI: boolean;
}

export class FengShuiRendererEnhanced {
  private stage: Konva.Stage;
  private backgroundLayer: Konva.Layer;
  private compassLayer: Konva.Layer;
  private pointerLayer: Konva.Layer;
  private uiLayer: Konva.Layer;

  private theme: OptimizedCompassTheme;
  private config: EnhancedRenderConfig;
  private centerX: number;
  private centerY: number;
  private radius: number;

  // 动画相关
  private rotationTween?: Konva.Tween;
  private currentRotation = 0;

  // 性能监控
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private fps = 0;

  constructor(container: HTMLDivElement, config: EnhancedRenderConfig) {
    this.config = config;
    this.theme = OPTIMIZED_COMPASS_THEMES[config.theme];

    // 计算基础尺寸
    this.centerX = config.width / 2;
    this.centerY = config.height / 2;
    this.radius = Math.max(Math.min(config.width, config.height) / 2 - 80, 100);

    // 初始化Konva舞台
    this.stage = new Konva.Stage({
      container,
      width: config.width,
      height: config.height,
    });

    // 创建分层结构
    this.backgroundLayer = new Konva.Layer();
    this.compassLayer = new Konva.Layer();
    this.pointerLayer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();

    this.stage.add(this.backgroundLayer);
    this.stage.add(this.compassLayer);
    this.stage.add(this.pointerLayer);
    this.stage.add(this.uiLayer);

    // 启用高DPI支持
    if (config.highDPI) {
      const pixelRatio = window.devicePixelRatio || 1;
      this.stage.scale({ x: pixelRatio, y: pixelRatio });
    }

    this.initializeEventHandlers();
  }

  /**
   * 初始化事件处理器
   */
  private initializeEventHandlers(): void {
    // 鼠标交互
    this.stage.on('mouseenter', () => {
      document.body.style.cursor = 'pointer';
    });

    this.stage.on('mouseleave', () => {
      document.body.style.cursor = 'default';
    });

    // 触摸支持
    this.stage.on('touchstart mousedown', (e) => {
      const pos = this.stage.getPointerPosition();
      if (pos) {
        const angle = this.calculateAngleFromCenter(pos.x, pos.y);
        this.rotateToAngle(angle);
      }
    });
  }

  /**
   * 计算从中心点到指定坐标的角度
   */
  private calculateAngleFromCenter(x: number, y: number): number {
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    return ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
  }

  /**
   * 旋转到指定角度（带动画）
   */
  public rotateToAngle(angle: number): void {
    if (this.rotationTween) {
      this.rotationTween.destroy();
    }

    if (this.theme.animations.enabled) {
      this.rotationTween = new Konva.Tween({
        node: this.compassLayer,
        duration: this.theme.animations.duration / 1000,
        rotation: angle,
        easing: Konva.Easings.EaseInOut,
        onUpdate: () => {
          this.currentRotation = this.compassLayer.rotation();
          this.updatePointer();
        },
      });
      this.rotationTween.play();
    } else {
      this.compassLayer.rotation(angle);
      this.currentRotation = angle;
      this.updatePointer();
    }
  }

  /**
   * 更新指针位置
   */
  private updatePointer(): void {
    this.pointerLayer.destroyChildren();
    this.drawPointer();
    this.pointerLayer.batchDraw();
  }

  /**
   * 绘制背景
   */
  private drawBackground(): void {
    this.backgroundLayer.destroyChildren();

    // 主背景圆形
    const background = new Konva.Circle({
      x: this.centerX,
      y: this.centerY,
      radius: this.radius + 60,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: this.radius + 60,
      fillRadialGradientColorStops: [
        0,
        this.theme.gradients.background[0],
        0.7,
        this.theme.gradients.background[1],
        1,
        this.theme.gradients.background[2],
      ],
    });

    if (this.config.showShadows && this.theme.shadows.enabled) {
      background.shadowColor(this.theme.shadows.color);
      background.shadowBlur(this.theme.shadows.blur);
      background.shadowOffset(this.theme.shadows.offset);
    }

    this.backgroundLayer.add(background);

    // 外边框
    const border = new Konva.Circle({
      x: this.centerX,
      y: this.centerY,
      radius: this.radius + 50,
      stroke: this.theme.borderColor,
      strokeWidth: 3,
      shadowColor: ThemeUtils.hexToRgba(this.theme.borderColor, 0.5),
      shadowBlur: 8,
      shadowOffset: { x: 0, y: 0 },
    });

    this.backgroundLayer.add(border);
  }

  /**
   * 绘制天池（中心圆）
   */
  private drawTianchi(): void {
    const tianchiRadius = this.radius * 0.15;

    // 天池背景
    const tianchi = new Konva.Circle({
      x: this.centerX,
      y: this.centerY,
      radius: tianchiRadius,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: tianchiRadius,
      fillRadialGradientColorStops: [
        0,
        this.theme.gradients.tianchi[0],
        1,
        this.theme.gradients.tianchi[1],
      ],
      stroke: this.theme.borderColor,
      strokeWidth: 2,
    });

    this.compassLayer.add(tianchi);

    // 天心十字
    this.drawTianxinCross(tianchiRadius);
  }

  /**
   * 绘制天心十字
   */
  private drawTianxinCross(radius: number): void {
    const crossSize = radius * 0.8;

    // 水平线
    const horizontalLine = new Konva.Line({
      points: [
        this.centerX - crossSize,
        this.centerY,
        this.centerX + crossSize,
        this.centerY,
      ],
      stroke: this.theme.tianxinCrossColor,
      strokeWidth: 2,
      lineCap: 'round',
    });

    // 垂直线
    const verticalLine = new Konva.Line({
      points: [
        this.centerX,
        this.centerY - crossSize,
        this.centerX,
        this.centerY + crossSize,
      ],
      stroke: this.theme.tianxinCrossColor,
      strokeWidth: 2,
      lineCap: 'round',
    });

    this.compassLayer.add(horizontalLine);
    this.compassLayer.add(verticalLine);
  }

  /**
   * 绘制罗盘层级数据
   */
  private drawCompassLayers(layersData: LayerData[]): void {
    const layerCount = layersData.length;
    const layerWidth = (this.radius - this.radius * 0.2) / layerCount;

    layersData.forEach((layer, index) => {
      const innerRadius = this.radius * 0.2 + index * layerWidth;
      const outerRadius = innerRadius + layerWidth;

      this.drawLayer(layer, innerRadius, outerRadius, index);
    });
  }

  /**
   * 绘制单个层级
   */
  private drawLayer(
    layer: LayerData,
    innerRadius: number,
    outerRadius: number,
    layerIndex: number
  ): void {
    const data = Array.isArray(layer.data[0])
      ? (layer.data as string[][])
      : (layer.data as string[]);
    const itemCount = data.length;
    const angleStep = 360 / itemCount;

    // 绘制层级背景
    this.drawLayerBackground(innerRadius, outerRadius, layerIndex);

    // 绘制刻度和文字
    data.forEach((item, index) => {
      const angle = ((layer.startAngle + index * angleStep) * Math.PI) / 180;

      if (Array.isArray(item)) {
        // 多行文字处理
        this.drawMultiLineText(
          item,
          angle,
          innerRadius,
          outerRadius,
          layer,
          index
        );
      } else {
        // 单行文字处理
        this.drawSingleLineText(
          item,
          angle,
          innerRadius,
          outerRadius,
          layer,
          index
        );
      }

      // 绘制分隔线
      this.drawDividerLine(angle, innerRadius, outerRadius);
    });
  }

  /**
   * 绘制层级背景
   */
  private drawLayerBackground(
    innerRadius: number,
    outerRadius: number,
    layerIndex: number
  ): void {
    const gradientColors =
      this.theme.gradients.layers[
        layerIndex % this.theme.gradients.layers.length
      ];

    const ring = new Konva.Ring({
      x: this.centerX,
      y: this.centerY,
      innerRadius,
      outerRadius,
      fillRadialGradientStartPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: innerRadius,
      fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientEndRadius: outerRadius,
      fillRadialGradientColorStops: [
        0,
        gradientColors[0],
        1,
        gradientColors[1],
      ],
      stroke: ThemeUtils.hexToRgba(this.theme.borderColor, 0.3),
      strokeWidth: 1,
    });

    this.compassLayer.add(ring);
  }

  /**
   * 绘制单行文字（优化版，解决重叠问题）
   */
  private drawSingleLineText(
    text: string,
    angle: number,
    innerRadius: number,
    outerRadius: number,
    layer: LayerData,
    index: number
  ): void {
    const textRadius = (innerRadius + outerRadius) / 2;
    const x = this.centerX + Math.cos(angle) * textRadius;
    const y = this.centerY + Math.sin(angle) * textRadius;

    // 动态计算字体大小，避免重叠
    const optimalFontSize = this.calculateOptimalFontSize(
      text,
      outerRadius - innerRadius,
      layer.fontSize || 16
    );

    const textNode = new Konva.Text({
      x: x - 20,
      y: y - optimalFontSize / 2,
      text,
      fontSize: optimalFontSize,
      fontFamily: this.theme.typography.primaryFont,
      fontWeight: this.theme.typography.weights.normal,
      fill: Array.isArray(layer.textColor)
        ? layer.textColor[0]
        : layer.textColor,
      width: 40,
      height: optimalFontSize * 1.2,
      align: 'center',
      verticalAlign: 'middle',
      rotation: layer.vertical ? (angle * 180) / Math.PI + 90 : 0,
    });

    // 添加文字阴影效果
    if (this.config.showShadows) {
      textNode.shadowColor('rgba(0, 0, 0, 0.5)');
      textNode.shadowBlur(2);
      textNode.shadowOffset({ x: 1, y: 1 });
    }

    this.compassLayer.add(textNode);
  }

  /**
   * 绘制多行文字（八卦等复合文字）
   */
  private drawMultiLineText(
    texts: string[],
    angle: number,
    innerRadius: number,
    outerRadius: number,
    layer: LayerData,
    index: number
  ): void {
    const layerHeight = outerRadius - innerRadius;
    const lineHeight = layerHeight / texts.length;

    texts.forEach((text, lineIndex) => {
      const textRadius = innerRadius + (lineIndex + 0.5) * lineHeight;
      const x = this.centerX + Math.cos(angle) * textRadius;
      const y = this.centerY + Math.sin(angle) * textRadius;

      const fontSize = this.calculateOptimalFontSize(
        text,
        lineHeight * 0.8,
        layer.fontSize || 16
      );
      const textColor = Array.isArray(layer.textColor)
        ? layer.textColor[lineIndex % layer.textColor.length]
        : layer.textColor;

      const textNode = new Konva.Text({
        x: x - 15,
        y: y - fontSize / 2,
        text,
        fontSize,
        fontFamily:
          lineIndex === 1
            ? this.theme.typography.secondaryFont
            : this.theme.typography.primaryFont,
        fontWeight: this.theme.typography.weights.normal,
        fill: textColor,
        width: 30,
        height: fontSize * 1.2,
        align: 'center',
        verticalAlign: 'middle',
        rotation: layer.vertical ? (angle * 180) / Math.PI + 90 : 0,
      });

      if (this.config.showShadows) {
        textNode.shadowColor('rgba(0, 0, 0, 0.4)');
        textNode.shadowBlur(1);
        textNode.shadowOffset({ x: 1, y: 1 });
      }

      this.compassLayer.add(textNode);
    });
  }

  /**
   * 计算最优字体大小，避免文字重叠
   */
  private calculateOptimalFontSize(
    text: string,
    availableSpace: number,
    baseFontSize: number
  ): number {
    const textLength = text.length;
    const spacePerChar = availableSpace / textLength;

    // 根据可用空间动态调整字体大小
    let fontSize = Math.min(baseFontSize, spacePerChar * 1.2);

    // 设置最小和最大字体大小
    fontSize = Math.max(fontSize, 10);
    fontSize = Math.min(fontSize, 24);

    return fontSize;
  }

  /**
   * 绘制分隔线
   */
  private drawDividerLine(
    angle: number,
    innerRadius: number,
    outerRadius: number
  ): void {
    const startX = this.centerX + Math.cos(angle) * innerRadius;
    const startY = this.centerY + Math.sin(angle) * innerRadius;
    const endX = this.centerX + Math.cos(angle) * outerRadius;
    const endY = this.centerY + Math.sin(angle) * outerRadius;

    const line = new Konva.Line({
      points: [startX, startY, endX, endY],
      stroke: ThemeUtils.hexToRgba(this.theme.borderColor, 0.4),
      strokeWidth: 0.5,
      lineCap: 'round',
    });

    this.compassLayer.add(line);
  }

  /**
   * 绘制指针
   */
  private drawPointer(): void {
    const pointerLength = this.radius * 0.8;
    const pointerWidth = 8;

    // 指针主体
    const pointer = new Konva.Line({
      points: [
        this.centerX,
        this.centerY - 10,
        this.centerX - pointerWidth / 2,
        this.centerY - pointerLength,
        this.centerX,
        this.centerY - pointerLength - 15,
        this.centerX + pointerWidth / 2,
        this.centerY - pointerLength,
        this.centerX,
        this.centerY - 10,
      ],
      fill: this.theme.scaleColor,
      stroke: this.theme.borderColor,
      strokeWidth: 1,
      closed: true,
      shadowColor: 'rgba(0, 0, 0, 0.6)',
      shadowBlur: 4,
      shadowOffset: { x: 2, y: 2 },
    });

    // 指针中心圆
    const pointerCenter = new Konva.Circle({
      x: this.centerX,
      y: this.centerY,
      radius: 6,
      fill: this.theme.scaleColor,
      stroke: this.theme.borderColor,
      strokeWidth: 2,
    });

    this.pointerLayer.add(pointer);
    this.pointerLayer.add(pointerCenter);
  }

  /**
   * 绘制刻度（优化版，解决数字重叠）
   */
  private drawScale(): void {
    const scaleRadius = this.radius + 30;

    // 绘制360度刻度
    for (let i = 0; i < 360; i += 5) {
      const angle = ((i - 90) * Math.PI) / 180;
      const isMainScale = i % 30 === 0;
      const isMidScale = i % 10 === 0;

      const lineLength = isMainScale ? 20 : isMidScale ? 15 : 10;
      const strokeWidth = isMainScale ? 2 : 1;

      const startX =
        this.centerX + Math.cos(angle) * (scaleRadius - lineLength);
      const startY =
        this.centerY + Math.sin(angle) * (scaleRadius - lineLength);
      const endX = this.centerX + Math.cos(angle) * scaleRadius;
      const endY = this.centerY + Math.sin(angle) * scaleRadius;

      const line = new Konva.Line({
        points: [startX, startY, endX, endY],
        stroke: this.theme.scaleColor,
        strokeWidth,
        lineCap: 'round',
      });

      this.compassLayer.add(line);

      // 绘制数字（每30度一个，避免重叠）
      if (isMainScale) {
        const textRadius = scaleRadius + 15;
        const textX = this.centerX + Math.cos(angle) * textRadius;
        const textY = this.centerY + Math.sin(angle) * textRadius;

        const text = new Konva.Text({
          x: textX - 10,
          y: textY - 8,
          text: i.toString(),
          fontSize: 14,
          fontFamily: this.theme.typography.primaryFont,
          fontWeight: this.theme.typography.weights.bold,
          fill: this.theme.textColor,
          width: 20,
          height: 16,
          align: 'center',
          verticalAlign: 'middle',
        });

        this.compassLayer.add(text);
      }
    }
  }

  /**
   * 主渲染方法
   */
  public render(layersData: LayerData[]): void {
    // 清除所有层
    this.backgroundLayer.destroyChildren();
    this.compassLayer.destroyChildren();
    this.pointerLayer.destroyChildren();

    // 绘制各个部分
    this.drawBackground();
    this.drawScale();
    this.drawCompassLayers(layersData);
    this.drawTianchi();
    this.drawPointer();

    // 批量重绘
    this.backgroundLayer.batchDraw();
    this.compassLayer.batchDraw();
    this.pointerLayer.batchDraw();

    // 启动性能监控
    this.startPerformanceMonitoring();
  }

  /**
   * 更新主题
   */
  public updateTheme(themeName: keyof typeof OPTIMIZED_COMPASS_THEMES): void {
    this.theme = OPTIMIZED_COMPASS_THEMES[themeName];
    this.config.theme = themeName;
  }

  /**
   * 获取当前旋转角度
   */
  public getCurrentRotation(): number {
    return this.currentRotation;
  }

  /**
   * 启动性能监控
   */
  private startPerformanceMonitoring(): void {
    const animate = () => {
      this.frameCount++;
      const now = performance.now();

      if (now - this.lastFPSUpdate >= 1000) {
        this.fps = Math.round(
          (this.frameCount * 1000) / (now - this.lastFPSUpdate)
        );
        this.frameCount = 0;
        this.lastFPSUpdate = now;
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * 获取性能指标
   */
  public getPerformanceMetrics(): { fps: number; nodeCount: number } {
    const nodeCount = this.stage.find('*').length;
    return { fps: this.fps, nodeCount };
  }

  /**
   * 销毁渲染器
   */
  public destroy(): void {
    try {
      if (this.rotationTween) {
        this.rotationTween.destroy();
        this.rotationTween = undefined;
      }
      if (this.stage) {
        this.stage.destroy();
      }
    } catch (error) {
      console.warn('销毁渲染器时出现错误:', error);
    }
  }

  /**
   * 导出为图片
   */
  public exportAsImage(format: 'png' | 'jpeg' = 'png', quality = 1): string {
    return this.stage.toDataURL({
      mimeType: `image/${format}`,
      quality,
      pixelRatio: 2,
    });
  }

  /**
   * 调整大小
   */
  public resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.radius = Math.max(Math.min(width, height) / 2 - 80, 100);

    this.stage.width(width);
    this.stage.height(height);
  }
}
