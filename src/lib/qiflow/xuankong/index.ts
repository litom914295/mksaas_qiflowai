/**
 * QiFlow AI - 玄空风水计算主入口
 *
 * 基于九宫飞星算法的专业级玄空风水分析服务
 * 提供高精度、专业级的玄空风水分析能力
 */

import { evaluatePlate } from './evaluate';
import { analyzeLocation } from './location';
import { 
  generateTianpan, 
  generateShanpan, 
  generateXiangpan, 
  mergePlates 
} from './luoshu';
import { analyzeGeju } from './geju';
import { getWenchangwei, getCaiwei } from './positions';
import {
  DEFAULT_FLYING_STAR_CONFIG,
  FlyingStarConfig,
  GenerateFlyingStarInput,
  GenerateFlyingStarOutput,
} from './types';
import { getYunInfo } from './yun';

export function getConfig(
  partial?: Partial<FlyingStarConfig>
): FlyingStarConfig {
  return { ...DEFAULT_FLYING_STAR_CONFIG, ...(partial ?? {}) };
}

export function generateFlyingStar(
  input: GenerateFlyingStarInput
): GenerateFlyingStarOutput {
  const config = getConfig(input.config);
  const observedAt = input.observedAt;
  const { period, isBoundary } = getYunInfo(observedAt);
  
  // 分析坐向和兼向
  const location = analyzeLocation(input.facing.degrees, config.toleranceDeg);
  
  // 生成天盘（运盘）
  const tianpan = generateTianpan(period);
  
  // 生成山盘和向盘
  const shanpan = generateShanpan(tianpan, location.zuo, location.isJian);
  const xiangpan = generateXiangpan(tianpan, location.xiang, location.isJian);
  
  // 合并三盘
  const mergedPlate = mergePlates(tianpan, shanpan, xiangpan);
  
  // 评价各宫位
  const evaluation = evaluatePlate(mergedPlate, period);
  
  // 格局分析
  const geju = analyzeGeju(mergedPlate, location.zuo, location.xiang, period, location.isJian);
  
  // 文昌位和财位
  const wenchangwei = getWenchangwei(mergedPlate);
  const caiwei = getCaiwei(mergedPlate, period);
  
  const rulesApplied: string[] = [];
  if (config.applyTiGua) rulesApplied.push('TiGua');
  if (config.applyFanGua) rulesApplied.push('FanGua');
  if (location.isJian) rulesApplied.push('兼向');

  const meta = {
    rulesApplied,
    ambiguous: location.ambiguous || isBoundary,
  } as const;

  return { 
    period, 
    plates: { period: mergedPlate, year: mergedPlate, month: mergedPlate, day: mergedPlate }, 
    evaluation, 
    meta,
    geju,
    wenchangwei,
    caiwei
  };
}

export * from './layering';
export * from './palace-profiles';
export * from './stack';
export * from './types';
export * from './location';
export * from './luoshu';
export * from './geju';
export * from './positions';
export * from './explanation';
export { getYunByYear } from './yun';

