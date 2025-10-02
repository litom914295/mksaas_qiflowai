/**
 * QiFlow 阈值常量配置
 * 统一管理所有算法的置信度阈值和UI状态
 */

/**
 * 置信度阈值配置
 */
export const CONFIDENCE_THRESHOLDS = {
  // 红色拒答阈值
  REJECT: 0.4,
  // 黄色提示阈值
  WARNING: 0.7,
  // 绿色正常阈值
  NORMAL: 0.7,
} as const

/**
 * UI状态类型
 */
export type ConfidenceLevel = 'reject' | 'warning' | 'normal'

/**
 * 根据置信度获取UI状态
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence < CONFIDENCE_THRESHOLDS.REJECT) {
    return 'reject'
  } else if (confidence < CONFIDENCE_THRESHOLDS.WARNING) {
    return 'warning'
  } else {
    return 'normal'
  }
}

/**
 * 置信度状态配置
 */
export const CONFIDENCE_STATES = {
  reject: {
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    icon: '❌',
    label: '置信度过低',
    message: '分析结果置信度过低，建议重新输入或调整参数',
    action: 'reject',
  },
  warning: {
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    icon: '⚠️',
    label: '置信度一般',
    message: '分析结果置信度一般，建议谨慎参考',
    action: 'warning',
  },
  normal: {
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    icon: '✅',
    label: '置信度良好',
    message: '分析结果置信度良好，可以放心参考',
    action: 'normal',
  },
} as const

/**
 * 算法特定阈值配置
 */
export const ALGORITHM_THRESHOLDS = {
  bazi: {
    // 八字计算特定阈值
    minAccuracy: 0.6,
    maxProcessingTime: 5000, // 5秒
    requiredFields: ['datetime', 'gender'],
  },
  xuankong: {
    // 玄空风水特定阈值
    minAccuracy: 0.5,
    maxProcessingTime: 3000, // 3秒
    requiredFields: ['facing', 'observedAt'],
    toleranceDeg: 3, // 度数容差
  },
  compass: {
    // 罗盘特定阈值
    minAccuracy: 0.7,
    maxProcessingTime: 1000, // 1秒
    requiredFields: ['accelerometer', 'magnetometer', 'gyroscope'],
    calibrationRequired: true,
  },
} as const

/**
 * 获取算法特定阈值
 */
export function getAlgorithmThresholds(algorithm: keyof typeof ALGORITHM_THRESHOLDS) {
  return ALGORITHM_THRESHOLDS[algorithm]
}

/**
 * 验证算法输入是否满足阈值要求
 */
export function validateAlgorithmInput(
  algorithm: keyof typeof ALGORITHM_THRESHOLDS,
  input: Record<string, any>
): { valid: boolean; missingFields: string[] } {
  const thresholds = getAlgorithmThresholds(algorithm)
  const missingFields = thresholds.requiredFields.filter(field => !input[field])
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  }
}

/**
 * 检查处理时间是否超时
 */
export function checkProcessingTimeout(
  algorithm: keyof typeof ALGORITHM_THRESHOLDS,
  processingTime: number
): boolean {
  const thresholds = getAlgorithmThresholds(algorithm)
  return processingTime > thresholds.maxProcessingTime
}

/**
 * 获取置信度百分比显示
 */
export function getConfidencePercentage(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

/**
 * 获取置信度颜色类名
 */
export function getConfidenceColorClass(confidence: number): string {
  const level = getConfidenceLevel(confidence)
  return CONFIDENCE_STATES[level].textColor
}

/**
 * 获取置信度背景色类名
 */
export function getConfidenceBgClass(confidence: number): string {
  const level = getConfidenceLevel(confidence)
  return CONFIDENCE_STATES[level].bgColor
}

/**
 * 获取置信度边框色类名
 */
export function getConfidenceBorderClass(confidence: number): string {
  const level = getConfidenceLevel(confidence)
  return CONFIDENCE_STATES[level].borderColor
}

