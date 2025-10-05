/**
 * 风水罗盘相关类型定义
 */

/**
 * 传感器数据
 */
export interface SensorData {
  magneticHeading: number; // 磁北方向角度 (0-360)
  trueHeading?: number; // 真北方向角度 (0-360)
  accuracy: number; // 精度 (度)
  timestamp: number; // 时间戳
  calibration?: CalibrationStatus;
}

/**
 * 校准状态
 */
export interface CalibrationStatus {
  isCalibrated: boolean;
  level: 'low' | 'medium' | 'high';
  message?: string;
}

/**
 * 罗盘事件
 */
export interface CompassEvent {
  type: 'heading' | 'calibration' | 'error' | 'permission';
  data?: SensorData | CalibrationStatus | Error | PermissionState;
  timestamp: number;
}

/**
 * AI 分析结果
 */
export interface AIAnalysisResult {
  direction: number; // 方向角度
  element: string; // 五行元素
  trigram: string; // 八卦
  mountain: string; // 二十四山
  favorable: boolean; // 是否吉利
  interpretation: string; // 解释说明
  suggestions: string[]; // 建议事项
  confidence: number; // 置信度 (0-1)
}

/**
 * 风水罗盘属性
 */
export interface FengShuiCompassProps {
  className?: string;
  onHeadingChange?: (heading: number) => void;
  onAnalysis?: (result: AIAnalysisResult) => void;
  onError?: (error: Error) => void;
  theme?: 'traditional' | 'modern' | 'dark';
  showGrid?: boolean;
  showRings?: boolean;
  showMountains?: boolean;
  showBagua?: boolean;
  autoCalibrate?: boolean;
  language?: 'zh' | 'en';
}

/**
 * 二十四山数据
 */
export const TWENTY_FOUR_MOUNTAINS = [
  { name: '壬', angle: 337.5, element: '水' },
  { name: '子', angle: 352.5, element: '水' },
  { name: '癸', angle: 7.5, element: '水' },
  { name: '丑', angle: 22.5, element: '土' },
  { name: '艮', angle: 37.5, element: '土' },
  { name: '寅', angle: 52.5, element: '木' },
  { name: '甲', angle: 67.5, element: '木' },
  { name: '卯', angle: 82.5, element: '木' },
  { name: '乙', angle: 97.5, element: '木' },
  { name: '辰', angle: 112.5, element: '土' },
  { name: '巽', angle: 127.5, element: '木' },
  { name: '巳', angle: 142.5, element: '火' },
  { name: '丙', angle: 157.5, element: '火' },
  { name: '午', angle: 172.5, element: '火' },
  { name: '丁', angle: 187.5, element: '火' },
  { name: '未', angle: 202.5, element: '土' },
  { name: '坤', angle: 217.5, element: '土' },
  { name: '申', angle: 232.5, element: '金' },
  { name: '庚', angle: 247.5, element: '金' },
  { name: '酉', angle: 262.5, element: '金' },
  { name: '辛', angle: 277.5, element: '金' },
  { name: '戌', angle: 292.5, element: '土' },
  { name: '乾', angle: 307.5, element: '金' },
  { name: '亥', angle: 322.5, element: '水' },
] as const;

/**
 * 八卦数据
 */
export const EIGHT_TRIGRAMS = [
  { name: '坎', angle: 0, element: '水', symbol: '☵' },
  { name: '艮', angle: 45, element: '土', symbol: '☶' },
  { name: '震', angle: 90, element: '木', symbol: '☳' },
  { name: '巽', angle: 135, element: '木', symbol: '☴' },
  { name: '离', angle: 180, element: '火', symbol: '☲' },
  { name: '坤', angle: 225, element: '土', symbol: '☷' },
  { name: '兑', angle: 270, element: '金', symbol: '☱' },
  { name: '乾', angle: 315, element: '金', symbol: '☰' },
] as const;

/**
 * 山的类型
 */
export type Mountain = (typeof TWENTY_FOUR_MOUNTAINS)[number];

/**
 * 获取方向对应的二十四山
 */
export function getMountainByAngle(angle: number): Mountain {
  // 规范化角度到 0-360
  const normalizedAngle = ((angle % 360) + 360) % 360;

  // 每个山占 15 度
  const mountainWidth = 15;

  // 找到最接近的山
  let closestMountain: Mountain = TWENTY_FOUR_MOUNTAINS[0];
  let minDiff = 360;

  for (const mountain of TWENTY_FOUR_MOUNTAINS) {
    // 计算角度差
    let diff = Math.abs(mountain.angle - normalizedAngle);
    if (diff > 180) diff = 360 - diff;

    if (diff < minDiff) {
      minDiff = diff;
      closestMountain = mountain;
    }
  }

  return closestMountain;
}

/**
 * 卦的类型
 */
export type Trigram = (typeof EIGHT_TRIGRAMS)[number];

/**
 * 获取方向对应的八卦
 */
export function getTrigramByAngle(angle: number): Trigram {
  // 规范化角度到 0-360
  const normalizedAngle = ((angle % 360) + 360) % 360;

  // 每个卦占 45 度
  const trigramWidth = 45;

  // 找到最接近的卦
  let closestTrigram: Trigram = EIGHT_TRIGRAMS[0];
  let minDiff = 360;

  for (const trigram of EIGHT_TRIGRAMS) {
    // 计算角度差
    let diff = Math.abs(trigram.angle - normalizedAngle);
    if (diff > 180) diff = 360 - diff;

    if (diff < minDiff) {
      minDiff = diff;
      closestTrigram = trigram;
    }
  }

  return closestTrigram;
}

/**
 * 分析风水方向
 */
export function analyzeFengShuiDirection(angle: number): AIAnalysisResult {
  const mountain = getMountainByAngle(angle);
  const trigram = getTrigramByAngle(angle);

  // 简单的吉凶判断逻辑（实际应该更复杂）
  const favorable = ['子', '午', '卯', '酉', '乾', '坤', '巽', '艮'].includes(
    mountain.name
  );

  return {
    direction: angle,
    element: mountain.element,
    trigram: trigram.name,
    mountain: mountain.name,
    favorable,
    interpretation: `坐向${mountain.name}山，属${mountain.element}，卦象${trigram.name}${trigram.symbol}`,
    suggestions: favorable
      ? [
          `${mountain.name}山方向吉利，适合居住或办公`,
          `五行属${mountain.element}，可以加强${mountain.element}元素的布置`,
        ]
      : [`${mountain.name}山方向需要化解`, '建议调整朝向或加强风水布局'],
    confidence: 0.85,
  };
}
