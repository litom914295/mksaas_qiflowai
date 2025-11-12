import { evaluatePlate } from './evaluate';
import { analyzeGeju } from './geju';
import { analyzeLocation } from './location';
import {
  generateShanpan,
  generateTianpan,
  generateXiangpan,
  mergePlates,
} from './luoshu';
import { getCaiwei, getWenchangwei } from './positions';
import {
  DEFAULT_FLYING_STAR_CONFIG,
  type FlyingStarConfig,
  type GenerateFlyingStarInput,
  type GenerateFlyingStarOutput,
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

  // 生成山盘和向盘，传入替卦配置
  const shanpan = generateShanpan(
    tianpan,
    location.zuo,
    location.isJian,
    config.applyTiGua || false
  );
  const xiangpan = generateXiangpan(
    tianpan,
    location.xiang,
    location.isJian,
    config.applyTiGua || false
  );

  // 合并三盘
  const mergedPlate = mergePlates(tianpan, shanpan, xiangpan);

  // 评价各宫位
  const evaluation = evaluatePlate(mergedPlate, period);

  // 格局分析
  const geju = analyzeGeju(
    mergedPlate,
    location.zuo,
    location.xiang,
    period,
    location.isJian
  );

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
    plates: {
      period: mergedPlate,
      year: mergedPlate,
      month: mergedPlate,
      day: mergedPlate,
    },
    evaluation,
    meta,
    geju,
    wenchangwei,
    caiwei,
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

// v6.0 API导出
export * from './converters';
export * from './adapters/v6-adapter';

// P1阶段新功能：诊断预警和化解方案
export * from './diagnostic-system';
export * from './remedy-generator';

// 导出别名以保持兼容性
export { generateXuankongPlate } from './plate-generator';
export { analyzeXuankongDiagnosis } from './diagnostic-engine';
export { generateRemedyPlans } from './remedy-engine';
export { analyzeKeyPositions } from '../fusion/key-positions';
