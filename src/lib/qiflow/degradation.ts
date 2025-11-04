/**
 * 低置信度降级处理系统
 * 处理置信度<0.4时的拒答和降级策略
 */

import {
  CONFIDENCE_STATES,
  getConfidenceLevel,
} from '@/config/qiflow-thresholds';

export interface DegradationReason {
  code: string;
  message: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface DegradationResult {
  shouldReject: boolean;
  reason?: DegradationReason;
  fallbackOptions: FallbackOption[];
  manualInputRequired: boolean;
}

export interface FallbackOption {
  id: string;
  name: string;
  description: string;
  confidence: number;
  requiresManualInput: boolean;
}

/**
 * 分析降级原因
 */
export function analyzeDegradationReason(
  confidence: number,
  algorithm: 'bazi' | 'xuankong' | 'compass',
  input: Record<string, any>,
  errors?: string[]
): DegradationReason {
  const reasons: DegradationReason[] = [];

  // 基础置信度检查
  if (confidence < 0.4) {
    reasons.push({
      code: 'LOW_CONFIDENCE',
      message: '分析结果置信度过低',
      suggestions: [
        '请检查输入信息的完整性和准确性',
        '尝试提供更详细的信息',
        '考虑使用手动输入模式',
      ],
      severity: 'high',
    });
  }

  // 算法特定检查
  if (algorithm === 'bazi') {
    if (!input.datetime) {
      reasons.push({
        code: 'MISSING_DATETIME',
        message: '缺少出生时间信息',
        suggestions: [
          '请提供准确的出生日期和时间',
          '如果不确定时间，可以选择"时间未知"',
          '使用手动输入模式输入八字信息',
        ],
        severity: 'high',
      });
    }

    if (!input.gender) {
      reasons.push({
        code: 'MISSING_GENDER',
        message: '缺少性别信息',
        suggestions: ['请选择性别', '性别信息对八字分析很重要'],
        severity: 'medium',
      });
    }
  }

  if (algorithm === 'xuankong') {
    if (input.facing === undefined || input.facing < 0 || input.facing > 359) {
      reasons.push({
        code: 'INVALID_FACING',
        message: '朝向角度无效',
        suggestions: [
          '请提供0-359度之间的朝向角度',
          '使用罗盘工具测量准确朝向',
          '手动输入朝向信息',
        ],
        severity: 'high',
      });
    }
  }

  if (algorithm === 'compass') {
    if (!input.accelerometer || !input.magnetometer || !input.gyroscope) {
      reasons.push({
        code: 'MISSING_SENSOR_DATA',
        message: '传感器数据不完整',
        suggestions: [
          '请确保所有传感器正常工作',
          '重新校准设备',
          '使用手动输入模式',
        ],
        severity: 'high',
      });
    }
  }

  // 错误信息检查
  if (errors && errors.length > 0) {
    reasons.push({
      code: 'PROCESSING_ERRORS',
      message: '处理过程中出现错误',
      suggestions: ['请检查输入信息格式', '尝试重新提交', '联系技术支持'],
      severity: 'high',
    });
  }

  // 返回最严重的原因
  const sortedReasons = reasons.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return (
    sortedReasons[0] || {
      code: 'UNKNOWN',
      message: '未知错误',
      suggestions: ['请重试或联系技术支持'],
      severity: 'medium',
    }
  );
}

/**
 * 获取降级处理结果
 */
export function getDegradationResult(
  confidence: number,
  algorithm: 'bazi' | 'xuankong' | 'compass',
  input: Record<string, any>,
  errors?: string[]
): DegradationResult {
  const level = getConfidenceLevel(confidence);
  const shouldReject = level === 'reject';

  if (!shouldReject) {
    return {
      shouldReject: false,
      fallbackOptions: [],
      manualInputRequired: false,
    };
  }

  const reason = analyzeDegradationReason(confidence, algorithm, input, errors);
  const fallbackOptions = getFallbackOptions(algorithm, reason);
  const manualInputRequired = fallbackOptions.some(
    (option) => option.requiresManualInput
  );

  return {
    shouldReject: true,
    reason,
    fallbackOptions,
    manualInputRequired,
  };
}

/**
 * 获取降级选项
 */
function getFallbackOptions(
  algorithm: 'bazi' | 'xuankong' | 'compass',
  reason: DegradationReason
): FallbackOption[] {
  const options: FallbackOption[] = [];

  switch (algorithm) {
    case 'bazi':
      options.push(
        {
          id: 'manual-bazi',
          name: '手动输入八字',
          description: '手动输入年柱、月柱、日柱、时柱信息',
          confidence: 0.8,
          requiresManualInput: true,
        },
        {
          id: 'simplified-bazi',
          name: '简化八字分析',
          description: '基于现有信息进行简化分析',
          confidence: 0.6,
          requiresManualInput: false,
        },
        {
          id: 'retry-bazi',
          name: '重新输入',
          description: '重新输入出生信息',
          confidence: 0.7,
          requiresManualInput: false,
        }
      );
      break;

    case 'xuankong':
      options.push(
        {
          id: 'manual-xuankong',
          name: '手动输入朝向',
          description: '手动输入准确的朝向角度',
          confidence: 0.8,
          requiresManualInput: true,
        },
        {
          id: 'compass-tool',
          name: '使用罗盘工具',
          description: '使用内置罗盘工具测量朝向',
          confidence: 0.9,
          requiresManualInput: false,
        },
        {
          id: 'retry-xuankong',
          name: '重新输入',
          description: '重新输入朝向信息',
          confidence: 0.7,
          requiresManualInput: false,
        }
      );
      break;

    case 'compass':
      options.push(
        {
          id: 'manual-compass',
          name: '手动输入方向',
          description: '手动输入磁北和真北方向',
          confidence: 0.8,
          requiresManualInput: true,
        },
        {
          id: 'calibrate-compass',
          name: '重新校准',
          description: '重新校准传感器',
          confidence: 0.9,
          requiresManualInput: false,
        },
        {
          id: 'retry-compass',
          name: '重新测量',
          description: '重新进行罗盘测量',
          confidence: 0.7,
          requiresManualInput: false,
        }
      );
      break;
  }

  return options;
}

/**
 * 检查是否可以降级处理
 */
export function canDegrade(
  confidence: number,
  algorithm: 'bazi' | 'xuankong' | 'compass'
): boolean {
  const level = getConfidenceLevel(confidence);

  // 只有低置信度时才考虑降级
  if (level !== 'reject') {
    return false;
  }

  // 检查是否有可用的降级选项
  const reason = analyzeDegradationReason(confidence, algorithm, {});
  const options = getFallbackOptions(algorithm, reason);

  return options.length > 0;
}

/**
 * 获取降级建议
 */
export function getDegradationSuggestions(
  confidence: number,
  algorithm: 'bazi' | 'xuankong' | 'compass',
  input: Record<string, any>
): string[] {
  const result = getDegradationResult(confidence, algorithm, input);

  if (!result.shouldReject) {
    return [];
  }

  const suggestions: string[] = [];

  if (result.reason) {
    suggestions.push(...result.reason.suggestions);
  }

  if (result.fallbackOptions.length > 0) {
    suggestions.push('您可以选择以下替代方案：');
    result.fallbackOptions.forEach((option) => {
      suggestions.push(`• ${option.name}: ${option.description}`);
    });
  }

  return suggestions;
}
