/**
 * 飞星盘渲染器
 * 
 * 负责在Konva画布上渲染九宫飞星盘
 * 包括山星、向星、运星的显示和交互
 */

import Konva from 'konva';
import { FlyingStarPlate, FlyingStarData, KonvaEngineConfig } from './types';

export class FlyingStarRenderer {
  private config: KonvaEngineConfig;
  private plates: Map<string, FlyingStarPlate> = new Map();

  constructor(config: KonvaEngineConfig) {
    this.config = config;
  }

  /**
   * 创建九宫飞星盘
   */
  createFlyingStarPlates(
    stageWidth: number, 
    stageHeight: number, 
    roomOverlays: Map<string, any>
  ): Map<string, FlyingStarPlate> {
    this.plates.clear();

    // 计算九宫格布局
    const gridSize = Math.min(stageWidth, stageHeight) / 3;
    const startX = (stageWidth - gridSize * 3) / 2;
    const startY = (stageHeight - gridSize * 3) / 2;

    // 创建九个宫位
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const palaceIndex = row * 3 + col + 1; // 1-9
        const x = startX + col * gridSize;
        const y = startY + row * gridSize;

        const plate = this.createFlyingStarPlate(
          `palace_${palaceIndex}`,
          { x, y },
          { width: gridSize, height: gridSize },
          palaceIndex
        );

        this.plates.set(plate.id, plate);
      }
    }

    return this.plates;
  }

  /**
   * 创建单个飞星盘
   */
  private createFlyingStarPlate(
    id: string,
    position: { x: number; y: number },
    size: { width: number; height: number },
    palaceIndex: number
  ): FlyingStarPlate {
    // 生成示例飞星数据
    const stars = this.generateFlyingStars(position, size, palaceIndex);

    return {
      id,
      position,
      size,
      stars,
      palaceIndex,
      color: this.getPalaceColor(palaceIndex),
      opacity: 0.8
    };
  }

  /**
   * 生成飞星数据
   */
  private generateFlyingStars(
    position: { x: number; y: number },
    size: { width: number; height: number },
    palaceIndex: number
  ): FlyingStarData[] {
    const stars: FlyingStarData[] = [];
    const centerX = position.x + size.width / 2;
    const centerY = position.y + size.height / 2;
    const starSize = Math.min(size.width, size.height) * 0.1;

    // 山星（左上）
    stars.push({
      id: `mountain_${palaceIndex}`,
      number: this.getMountainStarNumber(palaceIndex),
      position: {
        x: centerX - size.width * 0.25,
        y: centerY - size.height * 0.25
      },
      type: 'mountain',
      color: this.config.flyingStarColors.favorable,
      size: starSize
    });

    // 向星（右上）
    stars.push({
      id: `facing_${palaceIndex}`,
      number: this.getFacingStarNumber(palaceIndex),
      position: {
        x: centerX + size.width * 0.25,
        y: centerY - size.height * 0.25
      },
      type: 'facing',
      color: this.config.flyingStarColors.favorable,
      size: starSize
    });

    // 运星（下方）
    stars.push({
      id: `period_${palaceIndex}`,
      number: this.getPeriodStarNumber(palaceIndex),
      position: {
        x: centerX,
        y: centerY + size.height * 0.25
      },
      type: 'period',
      color: this.config.flyingStarColors.neutral,
      size: starSize
    });

    return stars;
  }

  /**
   * 获取山星数字
   */
  private getMountainStarNumber(palaceIndex: number): number {
    // 简化的山星计算，实际应该基于玄空飞星算法
    const mountainStars = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return mountainStars[(palaceIndex - 1) % 9];
  }

  /**
   * 获取向星数字
   */
  private getFacingStarNumber(palaceIndex: number): number {
    // 简化的向星计算，实际应该基于玄空飞星算法
    const facingStars = [9, 8, 7, 6, 5, 4, 3, 2, 1];
    return facingStars[(palaceIndex - 1) % 9];
  }

  /**
   * 获取运星数字
   */
  private getPeriodStarNumber(palaceIndex: number): number {
    // 简化的运星计算，实际应该基于当前运期
    return palaceIndex;
  }

  /**
   * 获取宫位颜色
   */
  private getPalaceColor(palaceIndex: number): string {
    const colors = [
      '#FFE5E5', // 1宫 - 浅红
      '#E5F3FF', // 2宫 - 浅蓝
      '#E5FFE5', // 3宫 - 浅绿
      '#FFF5E5', // 4宫 - 浅橙
      '#F0E5FF', // 5宫 - 浅紫
      '#E5FFFF', // 6宫 - 浅青
      '#FFE5F0', // 7宫 - 浅粉
      '#F5F5E5', // 8宫 - 浅黄
      '#E5E5E5'  // 9宫 - 浅灰
    ];
    
    return colors[(palaceIndex - 1) % 9];
  }

  /**
   * 渲染飞星盘到Konva层
   */
  renderToLayer(layer: Konva.Layer): void {
    // 清除现有内容
    layer.destroyChildren();

    for (const plate of this.plates.values()) {
      this.renderPlate(layer, plate);
    }

    layer.batchDraw();
  }

  /**
   * 渲染单个飞星盘
   */
  private renderPlate(layer: Konva.Layer, plate: FlyingStarPlate): void {
    // 创建宫位背景
    const background = new Konva.Rect({
      x: plate.position.x,
      y: plate.position.y,
      width: plate.size.width,
      height: plate.size.height,
      fill: plate.color,
      stroke: '#333333',
      strokeWidth: 2,
      opacity: plate.opacity,
      cornerRadius: 8
    });

    // 添加宫位数字
    const palaceText = new Konva.Text({
      x: plate.position.x + plate.size.width / 2 - 10,
      y: plate.position.y + 10,
      text: plate.palaceIndex.toString(),
      fontSize: 16,
      fontFamily: 'Arial',
      fill: '#333333',
      align: 'center'
    });

    layer.add(background);
    layer.add(palaceText);

    // 渲染飞星
    for (const star of plate.stars) {
      this.renderStar(layer, star);
    }
  }

  /**
   * 渲染单个飞星
   */
  private renderStar(layer: Konva.Layer, star: FlyingStarData): void {
    // 创建飞星圆形
    const starCircle = new Konva.Circle({
      x: star.position.x,
      y: star.position.y,
      radius: star.size,
      fill: star.color,
      stroke: '#000000',
      strokeWidth: 1,
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowBlur: 4,
      shadowOffset: { x: 2, y: 2 }
    });

    // 添加飞星数字
    const starText = new Konva.Text({
      x: star.position.x - 8,
      y: star.position.y - 8,
      text: star.number.toString(),
      fontSize: 12,
      fontFamily: 'Arial',
      fill: '#000000',
      align: 'center',
      verticalAlign: 'middle'
    });

    // 添加类型标签
    const typeText = new Konva.Text({
      x: star.position.x - 15,
      y: star.position.y + 15,
      text: this.getStarTypeLabel(star.type),
      fontSize: 8,
      fontFamily: 'Arial',
      fill: '#666666',
      align: 'center'
    });

    layer.add(starCircle);
    layer.add(starText);
    layer.add(typeText);
  }

  /**
   * 获取飞星类型标签
   */
  private getStarTypeLabel(type: 'mountain' | 'facing' | 'period'): string {
    const labels = {
      mountain: '山',
      facing: '向',
      period: '运'
    };
    return labels[type];
  }

  /**
   * 更新飞星数据
   */
  updateFlyingStars(plateId: string, newStars: FlyingStarData[]): void {
    const plate = this.plates.get(plateId);
    if (plate) {
      plate.stars = newStars;
    }
  }

  /**
   * 设置飞星盘透明度
   */
  setPlateOpacity(plateId: string, opacity: number): void {
    const plate = this.plates.get(plateId);
    if (plate) {
      plate.opacity = Math.max(0, Math.min(1, opacity));
    }
  }

  /**
   * 获取所有飞星盘
   */
  getPlates(): Map<string, FlyingStarPlate> {
    return this.plates;
  }

  /**
   * 获取指定飞星盘
   */
  getPlate(plateId: string): FlyingStarPlate | undefined {
    return this.plates.get(plateId);
  }

  /**
   * 清除所有飞星盘
   */
  clear(): void {
    this.plates.clear();
  }
}

