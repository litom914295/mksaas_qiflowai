/**
 * Smart Space Mapping Main Controller
 * 
 * Integrates alignment engine and room mapper
 * Provides complete space mapping solution
 */

import { Point, Room, Wall } from '../image-processing/types';
import { AlignmentEngine } from './alignment-engine';
import { RoomMapper } from './room-mapper';
import {
    MappingValidation,
    SpaceMappingConfig,
    SpaceMappingResult,
    SpaceMappingState
} from './types';

export class SpaceMapper {
  private state: SpaceMappingState;
  private alignmentEngine: AlignmentEngine;
  private roomMapper: RoomMapper;

  constructor(config: Partial<SpaceMappingConfig> = {}) {
    this.state = {
      config: {
        enableAutoRotation: true,
        enablePreciseAlignment: true,
        toleranceAngle: 1,
        toleranceDistance: 5,
        enableGridSnapping: true,
        gridSize: 20,
        enableRoomMerging: false,
        minRoomArea: 1000,
        ...config
      },
      currentAlignment: null,
      roomMappings: new Map(),
      palaceMappings: new Map(),
      gridMapping: null,
      validation: null
    };

    this.alignmentEngine = new AlignmentEngine(this.state.config);
    this.roomMapper = new RoomMapper(this.state.config);
  }

  /**
   * Execute complete space mapping
   */
  async mapSpace(
    rooms: Room[],
    walls: Wall[],
    imageSize: { width: number; height: number }
  ): Promise<SpaceMappingResult> {
    const startTime = performance.now();

    try {
      // 1. Execute space alignment
      console.log('Starting space alignment...');
      const alignment = await this.alignmentEngine.alignSpace(rooms, walls, imageSize);
      this.state.currentAlignment = alignment;

      // 2. Map rooms to Nine Palace
      console.log('Starting room mapping...');
      const roomMappings = await this.roomMapper.mapRoomsToPalaces(rooms, alignment, imageSize);
      
      // 更新状态
      this.state.roomMappings.clear();
      for (const mapping of roomMappings) {
        this.state.roomMappings.set(mapping.roomId, mapping);
      }

      // 3. 创建宫位映射
      this.state.palaceMappings = this.roomMapper.getPalaceMappings(roomMappings);

      // 4. 验证映射结果
      const validation = this.validateMapping(roomMappings, alignment);
      this.state.validation = validation;

      // 5. 计算整体置信度
      const overallConfidence = this.calculateOverallConfidence(roomMappings, alignment);

      const processingTime = performance.now() - startTime;

      const result: SpaceMappingResult = {
        alignment,
        roomMappings,
        overallConfidence,
        processingTime,
        success: true
      };

      console.log('空间映射完成:', result);
      return result;

    } catch (error) {
      console.error('空间映射失败:', error);
      const processingTime = performance.now() - startTime;

      return {
        alignment: this.state.currentAlignment || {
          rotationAngle: 0,
          translation: { x: 0, y: 0 },
          confidence: 0,
          method: 'manual',
          processingTime: 0
        },
        roomMappings: [],
        overallConfidence: 0,
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 验证映射结果
   */
  private validateMapping(
    roomMappings: any[],
    alignment: any
  ): MappingValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 检查对齐质量
    if (alignment.confidence < 0.5) {
      errors.push('空间对齐置信度过低，建议手动调整');
    } else if (alignment.confidence < 0.8) {
      warnings.push('空间对齐置信度中等，建议检查对齐结果');
    }

    // 检查房间映射
    const mappedRooms = roomMappings.length;
    if (mappedRooms === 0) {
      errors.push('没有房间被成功映射到九宫格');
    } else if (mappedRooms < 3) {
      warnings.push('映射的房间数量较少，可能影响分析准确性');
    }

    // 检查宫位分布
    const palaceDistribution = this.analyzePalaceDistribution(roomMappings);
    if (palaceDistribution.emptyPalaces > 5) {
      warnings.push('存在较多空宫位，建议检查房间分布');
    }

    // 检查映射质量
    const lowConfidenceMappings = roomMappings.filter(m => m.confidence < 0.6);
    if (lowConfidenceMappings.length > 0) {
      warnings.push(`${lowConfidenceMappings.length}个房间的映射置信度较低`);
    }

    // 生成建议
    if (errors.length === 0 && warnings.length === 0) {
      suggestions.push('空间映射质量良好，可以继续进行分析');
    } else if (errors.length === 0) {
      suggestions.push('建议检查警告信息并适当调整');
    } else {
      suggestions.push('建议重新进行空间映射或手动调整');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * 分析宫位分布
   */
  private analyzePalaceDistribution(roomMappings: any[]): {
    emptyPalaces: number;
    occupiedPalaces: number;
    distribution: Map<number, number>;
  } {
    const distribution = new Map<number, number>();
    
    for (const mapping of roomMappings) {
      const count = distribution.get(mapping.palaceIndex) || 0;
      distribution.set(mapping.palaceIndex, count + 1);
    }

    const occupiedPalaces = distribution.size;
    const emptyPalaces = 9 - occupiedPalaces;

    return {
      emptyPalaces,
      occupiedPalaces,
      distribution
    };
  }

  /**
   * 计算整体置信度
   */
  private calculateOverallConfidence(roomMappings: any[], alignment: any): number {
    if (roomMappings.length === 0) return 0;

    // 对齐置信度权重
    const alignmentWeight = 0.3;
    
    // 房间映射置信度权重
    const mappingWeight = 0.7;
    const avgMappingConfidence = roomMappings.reduce(
      (sum, mapping) => sum + mapping.confidence, 0
    ) / roomMappings.length;

    return alignment.confidence * alignmentWeight + avgMappingConfidence * mappingWeight;
  }

  /**
   * 手动设置对齐
   */
  setManualAlignment(rotationAngle: number, translation: Point): void {
    const alignment = this.alignmentEngine.setManualAlignment(rotationAngle, translation);
    this.state.currentAlignment = alignment;
  }

  /**
   * 获取房间映射
   */
  getRoomMapping(roomId: string): any | undefined {
    return this.state.roomMappings.get(roomId);
  }

  /**
   * 获取宫位映射
   */
  getPalaceMapping(palaceIndex: number): any | undefined {
    return this.state.palaceMappings.get(palaceIndex);
  }

  /**
   * 获取所有房间映射
   */
  getAllRoomMappings(): Map<string, any> {
    return new Map(this.state.roomMappings);
  }

  /**
   * 获取所有宫位映射
   */
  getAllPalaceMappings(): Map<number, any> {
    return new Map(this.state.palaceMappings);
  }

  /**
   * 获取当前状态
   */
  getState(): SpaceMappingState {
    return { ...this.state };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SpaceMappingConfig>): void {
    this.state.config = { ...this.state.config, ...config };
    this.alignmentEngine.updateConfig(this.state.config);
    this.roomMapper.updateConfig(this.state.config);
  }

  /**
   * 获取当前配置
   */
  getConfig(): SpaceMappingConfig {
    return { ...this.state.config };
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.state.currentAlignment = null;
    this.state.roomMappings.clear();
    this.state.palaceMappings.clear();
    this.state.gridMapping = null;
    this.state.validation = null;
  }

  /**
   * 导出映射数据
   */
  exportMappingData(): {
    alignment: any;
    roomMappings: any[];
    palaceMappings: any[];
    validation: any;
    timestamp: number;
  } {
    return {
      alignment: this.state.currentAlignment,
      roomMappings: Array.from(this.state.roomMappings.values()),
      palaceMappings: Array.from(this.state.palaceMappings.values()),
      validation: this.state.validation,
      timestamp: Date.now()
    };
  }

  /**
   * 导入映射数据
   */
  importMappingData(data: {
    alignment: any;
    roomMappings: any[];
    palaceMappings: any[];
    validation: any;
  }): void {
    this.state.currentAlignment = data.alignment;
    
    this.state.roomMappings.clear();
    for (const mapping of data.roomMappings) {
      this.state.roomMappings.set(mapping.roomId, mapping);
    }
    
    this.state.palaceMappings.clear();
    for (const mapping of data.palaceMappings) {
      this.state.palaceMappings.set(mapping.palaceIndex, mapping);
    }
    
    this.state.validation = data.validation;
  }
}

