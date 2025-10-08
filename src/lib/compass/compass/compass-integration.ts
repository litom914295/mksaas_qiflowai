/**
 * 罗盘集成服务
 * 
 * 整合数字罗盘和风水罗盘功能
 * 提供统一的罗盘服务接口
 */

import { FengShuiAIAnalysis } from './ai-analysis';
import { DEFAULT_COMPASS_DATA } from './feng-shui-data';
import { CompassUtil, FengShuiCompassEngine } from './feng-shui-engine';
import {
  AIAnalysisResult,
  CompassEvent,
  LayerData,
  SensorData
} from './feng-shui-types';

export class CompassIntegrationService {
  private fengShuiEngine: FengShuiCompassEngine;
  private compassUtil: CompassUtil;
  private aiAnalysis: FengShuiAIAnalysis;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.fengShuiEngine = new FengShuiCompassEngine();
    this.compassUtil = new CompassUtil(this.fengShuiEngine);
    this.aiAnalysis = new FengShuiAIAnalysis(this.compassUtil);
    
    // 初始化默认数据
    this.fengShuiEngine.setCompassData(DEFAULT_COMPASS_DATA);
  }

  // 事件监听
  addEventListener(eventType: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  removeEventListener(eventType: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: CompassEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  // 处理传感器数据
  async processSensorData(sensorData: SensorData): Promise<void> {
    this.emitEvent({
      type: 'direction_change',
      timestamp: sensorData.timestamp,
      data: sensorData
    });
  }

  // 执行AI分析
  async performAIAnalysis(direction: number): Promise<AIAnalysisResult> {
    try {
      const result = await this.aiAnalysis.analyzeDirection(direction);
      
      this.emitEvent({
        type: 'ai_analysis_complete',
        timestamp: Date.now(),
        data: result
      });
      
      return result;
    } catch (error) {
      this.emitEvent({
        type: 'sensor_error',
        timestamp: Date.now(),
        data: { error: 'AI分析失败', details: error }
      });
      throw error;
    }
  }

  // 获取方位信息
  getDirectionInfo(direction: number) {
    const mountain = this.compassUtil.getTwentyFourMountain(direction);
    const bagua = this.compassUtil.getBaguaInfo(direction);
    
    return {
      direction,
      mountain,
      bagua,
      timestamp: Date.now()
    };
  }

  // 设置罗盘数据
  setCompassData(data: LayerData[]): void {
    this.fengShuiEngine.setCompassData(data);
  }

  // 获取罗盘引擎
  getFengShuiEngine(): FengShuiCompassEngine {
    return this.fengShuiEngine;
  }

  // 获取罗盘工具
  getCompassUtil(): CompassUtil {
    return this.compassUtil;
  }

  // 获取AI分析器
  getAIAnalysis(): FengShuiAIAnalysis {
    return this.aiAnalysis;
  }

  // 校准罗盘
  async calibrateCompass(): Promise<void> {
    this.emitEvent({
      type: 'calibration_complete',
      timestamp: Date.now(),
      data: { message: '罗盘校准完成' }
    });
  }

  // 重置罗盘
  resetCompass(): void {
    this.fengShuiEngine.setCompassData(DEFAULT_COMPASS_DATA);
    this.emitEvent({
      type: 'direction_change',
      timestamp: Date.now(),
      data: { direction: 0, accuracy: 0 }
    });
  }
}