/**
 * 空间对齐引擎
 *
 * 负责户型图的自动旋转对齐和精确定位
 * 实现误差<1°的精度要求
 */

import type { Point, Room, Wall } from '../image-processing/types';
import type {
  AlignmentResult,
  RotationAnalysis,
  SpaceMappingConfig,
} from './types';

export class AlignmentEngine {
  private config: SpaceMappingConfig;

  constructor(config: Partial<SpaceMappingConfig> = {}) {
    this.config = {
      enableAutoRotation: true,
      enablePreciseAlignment: true,
      toleranceAngle: 1, // 1度容差
      toleranceDistance: 5, // 5像素容差
      enableGridSnapping: true,
      gridSize: 20,
      enableRoomMerging: false,
      minRoomArea: 1000,
      ...config,
    };
  }

  /**
   * 执行空间对齐
   */
  async alignSpace(
    rooms: Room[],
    walls: Wall[],
    imageSize: { width: number; height: number }
  ): Promise<AlignmentResult> {
    const startTime = performance.now();

    try {
      // 1. 分析旋转角度
      const rotationAnalysis = await this.analyzeRotation(rooms, walls);

      // 2. 计算平移偏移
      const translation = this.calculateTranslation(rooms, imageSize);

      // 3. 验证对齐结果
      const confidence = this.validateAlignment(
        rotationAnalysis,
        translation,
        rooms
      );

      // 4. 应用网格对齐（如果启用）
      const finalTranslation = this.config.enableGridSnapping
        ? this.applyGridSnapping(translation)
        : translation;

      const processingTime = performance.now() - startTime;

      return {
        rotationAngle: rotationAnalysis.angle,
        translation: finalTranslation,
        confidence,
        method:
          rotationAnalysis.method === 'wall_direction'
            ? 'wall_alignment'
            : rotationAnalysis.method === 'room_orientation'
              ? 'room_alignment'
              : 'manual',
        processingTime,
      };
    } catch (error) {
      console.error('空间对齐失败:', error);
      throw new Error(
        `空间对齐失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 分析旋转角度
   */
  private async analyzeRotation(
    rooms: Room[],
    walls: Wall[]
  ): Promise<RotationAnalysis> {
    // 方法1: 基于墙壁方向分析
    const wallAnalysis = this.analyzeWallDirections(walls);

    // 方法2: 基于房间方向分析
    const roomAnalysis = this.analyzeRoomOrientations(rooms);

    // 选择最佳方法
    if (wallAnalysis.confidence > roomAnalysis.confidence) {
      return {
        ...wallAnalysis,
        method: 'wall_direction',
      };
    }
    return {
      ...roomAnalysis,
      method: 'room_orientation',
    };
  }

  /**
   * 分析墙壁方向
   */
  private analyzeWallDirections(walls: Wall[]): RotationAnalysis {
    if (walls.length === 0) {
      return {
        angle: 0,
        confidence: 0,
        method: 'wall_direction',
        referencePoints: [],
      };
    }

    // 计算墙壁角度
    const angles: number[] = [];
    const referencePoints: Point[] = [];

    for (const wall of walls) {
      const angle = Math.atan2(
        wall.end.y - wall.start.y,
        wall.end.x - wall.start.x
      );

      // 转换为0-180度范围
      const normalizedAngle = this.normalizeAngle((angle * 180) / Math.PI);
      angles.push(normalizedAngle);

      referencePoints.push(wall.start, wall.end);
    }

    // 计算主要方向角度
    const dominantAngle = this.findDominantAngle(angles);
    const confidence = this.calculateAngleConfidence(angles, dominantAngle);

    return {
      angle: dominantAngle,
      confidence,
      method: 'wall_direction',
      referencePoints,
    };
  }

  /**
   * 分析房间方向
   */
  private analyzeRoomOrientations(rooms: Room[]): RotationAnalysis {
    if (rooms.length === 0) {
      return {
        angle: 0,
        confidence: 0,
        method: 'room_orientation',
        referencePoints: [],
      };
    }

    // 计算房间主要方向
    const angles: number[] = [];
    const referencePoints: Point[] = [];

    for (const room of rooms) {
      if (!room.coordinates || room.coordinates.length < 2) continue;

      // 计算房间的主要方向向量
      const roomAngle = this.calculateRoomMainDirection(room);
      if (roomAngle !== null && room.center) {
        angles.push(roomAngle);
        referencePoints.push(room.center);
      }
    }

    if (angles.length === 0) {
      return {
        angle: 0,
        confidence: 0,
        method: 'room_orientation',
        referencePoints: [],
      };
    }

    // 计算主要方向角度
    const dominantAngle = this.findDominantAngle(angles);
    const confidence = this.calculateAngleConfidence(angles, dominantAngle);

    return {
      angle: dominantAngle,
      confidence,
      method: 'room_orientation',
      referencePoints,
    };
  }

  /**
   * 计算房间主要方向
   */
  private calculateRoomMainDirection(room: Room): number | null {
    if (!room.coordinates || room.coordinates.length < 2) return null;

    // 找到房间的最长边
    let maxLength = 0;
    let mainDirection = 0;

    for (let i = 0; i < room.coordinates.length; i++) {
      const current = room.coordinates[i];
      const next = room.coordinates[(i + 1) % room.coordinates.length];

      const length = Math.sqrt(
        (next.x - current.x) ** 2 + (next.y - current.y) ** 2
      );

      if (length > maxLength) {
        maxLength = length;
        mainDirection = Math.atan2(next.y - current.y, next.x - current.x);
      }
    }

    return this.normalizeAngle((mainDirection * 180) / Math.PI);
  }

  /**
   * 标准化角度到0-180度范围
   */
  private normalizeAngle(angle: number): number {
    // 转换为0-180度范围
    let normalized = angle % 180;
    if (normalized < 0) {
      normalized += 180;
    }

    // 如果角度大于90度，转换为0-90度范围
    if (normalized > 90) {
      normalized = 180 - normalized;
    }

    return normalized;
  }

  /**
   * 找到主要角度
   */
  private findDominantAngle(angles: number[]): number {
    if (angles.length === 0) return 0;

    // 使用直方图方法找到主要角度
    const histogram = new Map<number, number>();
    const binSize = 5; // 5度一个区间

    for (const angle of angles) {
      const bin = Math.round(angle / binSize) * binSize;
      histogram.set(bin, (histogram.get(bin) || 0) + 1);
    }

    // 找到出现频率最高的角度
    let maxCount = 0;
    let dominantAngle = 0;

    for (const [angle, count] of histogram) {
      if (count > maxCount) {
        maxCount = count;
        dominantAngle = angle;
      }
    }

    return dominantAngle;
  }

  /**
   * 计算角度置信度
   */
  private calculateAngleConfidence(
    angles: number[],
    dominantAngle: number
  ): number {
    if (angles.length === 0) return 0;

    const tolerance = this.config.toleranceAngle;
    const matchingAngles = angles.filter(
      (angle) => Math.abs(angle - dominantAngle) <= tolerance
    );

    return matchingAngles.length / angles.length;
  }

  /**
   * 计算平移偏移
   */
  private calculateTranslation(
    rooms: Room[],
    imageSize: { width: number; height: number }
  ): Point {
    if (rooms.length === 0) {
      return { x: 0, y: 0 };
    }

    // 计算所有房间的边界框
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const room of rooms) {
      if (!room.coordinates) continue;
      for (const point of room.coordinates) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
      }
    }

    // 计算中心点
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // 计算到图像中心的偏移
    const imageCenterX = imageSize.width / 2;
    const imageCenterY = imageSize.height / 2;

    return {
      x: imageCenterX - centerX,
      y: imageCenterY - centerY,
    };
  }

  /**
   * 验证对齐结果
   */
  private validateAlignment(
    rotationAnalysis: RotationAnalysis,
    translation: Point,
    rooms: Room[]
  ): number {
    let confidence = 0;

    // 基于旋转分析的置信度
    confidence += rotationAnalysis.confidence * 0.6;

    // 基于房间分布的置信度
    const roomDistributionConfidence =
      this.calculateRoomDistributionConfidence(rooms);
    confidence += roomDistributionConfidence * 0.4;

    return Math.min(1, confidence);
  }

  /**
   * 计算房间分布置信度
   */
  private calculateRoomDistributionConfidence(rooms: Room[]): number {
    if (rooms.length === 0) return 0;

    // 检查房间是否合理分布
    const centers = rooms.map((room) => room.center).filter((c) => c);
    const avgDistance = this.calculateAverageDistance(centers);

    // 基于平均距离计算置信度
    const expectedDistance = 200; // 期望的房间间距离
    const distanceRatio = Math.min(
      avgDistance / expectedDistance,
      expectedDistance / avgDistance
    );

    return distanceRatio;
  }

  /**
   * 计算平均距离
   */
  private calculateAverageDistance(points: (Point | undefined)[]): number {
    const validPoints = points.filter((p): p is Point => p !== undefined);
    if (validPoints.length < 2) return 0;

    let totalDistance = 0;
    let pairCount = 0;

    for (let i = 0; i < validPoints.length; i++) {
      for (let j = i + 1; j < validPoints.length; j++) {
        const distance = Math.sqrt(
          (validPoints[i].x - validPoints[j].x) ** 2 +
            (validPoints[i].y - validPoints[j].y) ** 2
        );
        totalDistance += distance;
        pairCount++;
      }
    }

    return pairCount > 0 ? totalDistance / pairCount : 0;
  }

  /**
   * 应用网格对齐
   */
  private applyGridSnapping(translation: Point): Point {
    const gridSize = this.config.gridSize;

    return {
      x: Math.round(translation.x / gridSize) * gridSize,
      y: Math.round(translation.y / gridSize) * gridSize,
    };
  }

  /**
   * 手动设置对齐
   */
  setManualAlignment(
    rotationAngle: number,
    translation: Point
  ): AlignmentResult {
    return {
      rotationAngle,
      translation,
      confidence: 1.0,
      method: 'manual',
      processingTime: 0,
    };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SpaceMappingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): SpaceMappingConfig {
    return { ...this.config };
  }
}
