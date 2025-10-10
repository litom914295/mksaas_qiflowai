/**
 * Room Mapper
 *
 * Responsible for precisely mapping rooms to Nine Palace positions
 * Implements intelligent room-to-Nine Palace allocation
 */

import type { Point, Room } from '../image-processing/types';
import type {
  AlignmentResult,
  PalaceMapping,
  RoomMappingResult,
  SpaceMappingConfig,
} from './types';

export class RoomMapper {
  private config: SpaceMappingConfig;

  constructor(config: Partial<SpaceMappingConfig> = {}) {
    this.config = {
      enableAutoRotation: true,
      enablePreciseAlignment: true,
      toleranceAngle: 1,
      toleranceDistance: 5,
      enableGridSnapping: true,
      gridSize: 20,
      enableRoomMerging: false,
      minRoomArea: 1000,
      ...config,
    };
  }

  /**
   * Map rooms to Nine Palace
   */
  async mapRoomsToPalaces(
    rooms: Room[],
    alignment: AlignmentResult,
    imageSize: { width: number; height: number }
  ): Promise<RoomMappingResult[]> {
    try {
      // 1. Apply alignment transformation
      const transformedRooms = this.applyAlignment(rooms, alignment);

      // 2. Create Nine Palace layout
      const palaceLayout = this.createPalaceLayout(imageSize);

      // 3. Map rooms to palace positions
      const roomMappings = this.mapRoomsToPalaceLayout(
        transformedRooms,
        palaceLayout
      );

      // 4. Optimize mapping results
      const optimizedMappings = this.optimizeMappings(
        roomMappings,
        palaceLayout
      );

      return optimizedMappings;
    } catch (error) {
      console.error('Room mapping failed:', error);
      throw new Error(
        `Room mapping failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Apply alignment transformation
   */
  private applyAlignment(rooms: Room[], alignment: AlignmentResult): Room[] {
    return rooms.map((room) => ({
      ...room,
      coordinates: room.coordinates.map((point) =>
        this.transformPoint(point, alignment)
      ),
      center: this.transformPoint(room.center, alignment),
    }));
  }

  /**
   * Transform point coordinates
   */
  private transformPoint(point: Point, alignment: AlignmentResult): Point {
    // Apply rotation
    const angle = (alignment.rotationAngle * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rotatedX = point.x * cos - point.y * sin;
    const rotatedY = point.x * sin + point.y * cos;

    // Apply translation
    return {
      x: rotatedX + alignment.translation.x,
      y: rotatedY + alignment.translation.y,
    };
  }

  /**
   * Create Nine Palace layout
   */
  private createPalaceLayout(imageSize: { width: number; height: number }): Map<
    number,
    PalaceMapping
  > {
    const palaceLayout = new Map<number, PalaceMapping>();

    const palaceWidth = imageSize.width / 3;
    const palaceHeight = imageSize.height / 3;

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const palaceIndex = row * 3 + col + 1; // 1-9
        const x = col * palaceWidth;
        const y = row * palaceHeight;

        palaceLayout.set(palaceIndex, {
          palaceIndex,
          center: {
            x: x + palaceWidth / 2,
            y: y + palaceHeight / 2,
          },
          bounds: {
            minX: x,
            maxX: x + palaceWidth,
            minY: y,
            maxY: y + palaceHeight,
          },
          rooms: [],
        });
      }
    }

    return palaceLayout;
  }

  /**
   * Map rooms to palace layout
   */
  private mapRoomsToPalaceLayout(
    rooms: Room[],
    palaceLayout: Map<number, PalaceMapping>
  ): RoomMappingResult[] {
    const mappings: RoomMappingResult[] = [];

    for (const room of rooms) {
      // Find best palace position
      const bestPalace = this.findBestPalace(room, palaceLayout);

      if (bestPalace) {
        const mapping: RoomMappingResult = {
          roomId: room.id,
          palaceIndex: bestPalace.palaceIndex,
          coordinates: room.coordinates,
          center: room.center,
          area: room.area,
          confidence: this.calculateMappingConfidence(room, bestPalace),
          alignmentScore: this.calculateAlignmentScore(room, bestPalace),
        };

        mappings.push(mapping);

        // Update palace room list
        bestPalace.rooms.push(room.id);
      }
    }

    return mappings;
  }

  /**
   * 找到最佳宫位
   */
  private findBestPalace(
    room: Room,
    palaceLayout: Map<number, PalaceMapping>
  ): PalaceMapping | null {
    let bestPalace: PalaceMapping | null = null;
    let bestScore = -1;

    for (const palace of palaceLayout.values()) {
      const score = this.calculatePalaceScore(room, palace);

      if (score > bestScore) {
        bestScore = score;
        bestPalace = palace;
      }
    }

    return bestPalace;
  }

  /**
   * 计算宫位得分
   */
  private calculatePalaceScore(room: Room, palace: PalaceMapping): number {
    // 1. 中心点距离得分
    const centerDistance = Math.sqrt(
      (room.center.x - palace.center.x) ** 2 +
        (room.center.y - palace.center.y) ** 2
    );
    const maxDistance = Math.sqrt(
      (palace.bounds.maxX - palace.bounds.minX) ** 2 +
        (palace.bounds.maxY - palace.bounds.minY) ** 2
    );
    const centerScore = 1 - centerDistance / maxDistance;

    // 2. 重叠面积得分
    const overlapArea = this.calculateOverlapArea(room, palace);
    const roomArea = this.calculateRoomArea(room);
    const overlapScore = roomArea > 0 ? overlapArea / roomArea : 0;

    // 3. 边界对齐得分
    const alignmentScore = this.calculateBoundaryAlignment(room, palace);

    // 综合得分
    return centerScore * 0.4 + overlapScore * 0.4 + alignmentScore * 0.2;
  }

  /**
   * 计算重叠面积
   */
  private calculateOverlapArea(room: Room, palace: PalaceMapping): number {
    // 简化的重叠面积计算
    const roomBounds = this.calculateRoomBounds(room);

    const overlapX = Math.max(
      0,
      Math.min(roomBounds.maxX, palace.bounds.maxX) -
        Math.max(roomBounds.minX, palace.bounds.minX)
    );

    const overlapY = Math.max(
      0,
      Math.min(roomBounds.maxY, palace.bounds.maxY) -
        Math.max(roomBounds.minY, palace.bounds.minY)
    );

    return overlapX * overlapY;
  }

  /**
   * 计算房间边界
   */
  private calculateRoomBounds(room: Room): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    if (room.coordinates.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const xs = room.coordinates.map((p) => p.x);
    const ys = room.coordinates.map((p) => p.y);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  /**
   * 计算房间面积
   */
  private calculateRoomArea(room: Room): number {
    if (room.coordinates.length < 3) return 0;

    // 使用鞋带公式计算多边形面积
    let area = 0;
    const n = room.coordinates.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += room.coordinates[i].x * room.coordinates[j].y;
      area -= room.coordinates[j].x * room.coordinates[i].y;
    }

    return Math.abs(area) / 2;
  }

  /**
   * 计算边界对齐得分
   */
  private calculateBoundaryAlignment(
    room: Room,
    palace: PalaceMapping
  ): number {
    const roomBounds = this.calculateRoomBounds(room);

    // 检查房间边界是否与宫位边界对齐
    const xAlignment = this.calculateAxisAlignment(
      roomBounds.minX,
      roomBounds.maxX,
      palace.bounds.minX,
      palace.bounds.maxX
    );

    const yAlignment = this.calculateAxisAlignment(
      roomBounds.minY,
      roomBounds.maxY,
      palace.bounds.minY,
      palace.bounds.maxY
    );

    return (xAlignment + yAlignment) / 2;
  }

  /**
   * 计算轴对齐得分
   */
  private calculateAxisAlignment(
    roomMin: number,
    roomMax: number,
    palaceMin: number,
    palaceMax: number
  ): number {
    const tolerance = this.config.toleranceDistance;

    // 检查左边界对齐
    const leftAlignment = Math.abs(roomMin - palaceMin) <= tolerance ? 1 : 0;

    // 检查右边界对齐
    const rightAlignment = Math.abs(roomMax - palaceMax) <= tolerance ? 1 : 0;

    // 检查中心对齐
    const roomCenter = (roomMin + roomMax) / 2;
    const palaceCenter = (palaceMin + palaceMax) / 2;
    const centerAlignment =
      Math.abs(roomCenter - palaceCenter) <= tolerance ? 1 : 0;

    return Math.max(leftAlignment, rightAlignment, centerAlignment);
  }

  /**
   * 计算映射置信度
   */
  private calculateMappingConfidence(
    room: Room,
    palace: PalaceMapping
  ): number {
    const palaceScore = this.calculatePalaceScore(room, palace);
    const roomConfidence = room.confidence || 0.5;

    return (palaceScore + roomConfidence) / 2;
  }

  /**
   * 计算对齐得分
   */
  private calculateAlignmentScore(room: Room, palace: PalaceMapping): number {
    return this.calculateBoundaryAlignment(room, palace);
  }

  /**
   * 优化映射结果
   */
  private optimizeMappings(
    mappings: RoomMappingResult[],
    palaceLayout: Map<number, PalaceMapping>
  ): RoomMappingResult[] {
    // 1. 解决冲突（一个宫位多个房间）
    const conflictResolved = this.resolveConflicts(mappings, palaceLayout);

    // 2. 优化空宫位分配
    const optimized = this.optimizeEmptyPalaces(conflictResolved, palaceLayout);

    return optimized;
  }

  /**
   * 解决映射冲突
   */
  private resolveConflicts(
    mappings: RoomMappingResult[],
    palaceLayout: Map<number, PalaceMapping>
  ): RoomMappingResult[] {
    const palaceRoomCount = new Map<number, number>();

    // 统计每个宫位的房间数量
    for (const mapping of mappings) {
      const count = palaceRoomCount.get(mapping.palaceIndex) || 0;
      palaceRoomCount.set(mapping.palaceIndex, count + 1);
    }

    // 处理多房间宫位
    const resolvedMappings: RoomMappingResult[] = [];

    for (const mapping of mappings) {
      const palaceCount = palaceRoomCount.get(mapping.palaceIndex) || 0;

      if (palaceCount === 1) {
        // 无冲突，直接添加
        resolvedMappings.push(mapping);
      } else {
        // 有冲突，选择最佳房间
        const palaceMappings = mappings.filter(
          (m) => m.palaceIndex === mapping.palaceIndex
        );
        const bestMapping = this.selectBestMapping(palaceMappings);

        if (bestMapping === mapping) {
          resolvedMappings.push(mapping);
        }
      }
    }

    return resolvedMappings;
  }

  /**
   * 选择最佳映射
   */
  private selectBestMapping(mappings: RoomMappingResult[]): RoomMappingResult {
    return mappings.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
  }

  /**
   * 优化空宫位分配
   */
  private optimizeEmptyPalaces(
    mappings: RoomMappingResult[],
    palaceLayout: Map<number, PalaceMapping>
  ): RoomMappingResult[] {
    const usedPalaces = new Set(mappings.map((m) => m.palaceIndex));
    const emptyPalaces = Array.from(palaceLayout.keys()).filter(
      (p) => !usedPalaces.has(p)
    );

    // 如果有空宫位，尝试重新分配房间
    if (emptyPalaces.length > 0) {
      return this.redistributeRooms(mappings, emptyPalaces, palaceLayout);
    }

    return mappings;
  }

  /**
   * 重新分配房间
   */
  private redistributeRooms(
    mappings: RoomMappingResult[],
    emptyPalaces: number[],
    palaceLayout: Map<number, PalaceMapping>
  ): RoomMappingResult[] {
    // 简化的重新分配逻辑
    // 在实际应用中，这里可以实现更复杂的优化算法

    return mappings;
  }

  /**
   * 获取宫位映射
   */
  getPalaceMappings(mappings: RoomMappingResult[]): Map<number, PalaceMapping> {
    const palaceMappings = new Map<number, PalaceMapping>();

    for (const mapping of mappings) {
      const palace = palaceMappings.get(mapping.palaceIndex);

      if (palace) {
        palace.rooms.push(mapping.roomId);
      } else {
        palaceMappings.set(mapping.palaceIndex, {
          palaceIndex: mapping.palaceIndex,
          center: mapping.center,
          bounds: {
            minX: mapping.center.x - 50,
            maxX: mapping.center.x + 50,
            minY: mapping.center.y - 50,
            maxY: mapping.center.y + 50,
          },
          rooms: [mapping.roomId],
        });
      }
    }

    return palaceMappings;
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
