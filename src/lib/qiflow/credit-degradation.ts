/**
 * 积分降级策略管理器
 * 根据用户余额实现三级降级机制
 */

// 降级等级定义
export type DegradationLevel = 'full' | 'medium' | 'lite';

// 功能权限定义
export interface FeaturePermissions {
  // 八字分析功能
  baziFullAnalysis: boolean;
  baziTenGods: boolean;
  baziCharts: boolean;
  baziInterpretation: boolean;
  baziExport: boolean;

  // 玄空风水功能
  xuankongFullAnalysis: boolean;
  xuankongNinePalace: boolean;
  xuankongRecommendations: boolean;
  xuankongExport: boolean;

  // AI聊天功能
  aiChatUnlimited: boolean;
  aiChatDeepAnalysis: boolean;
  aiChatHistory: boolean;

  // 缓存策略
  cacheEnabled: boolean;
  cacheTTL: number; // 秒
}

// 积分消耗配置
export const CREDIT_COSTS = {
  bazi: {
    full: 10,
    medium: 5,
    lite: 2,
  },
  xuankong: {
    full: 20,
    medium: 10,
    lite: 5,
  },
  aiChat: {
    deep: 30,
    normal: 5,
    simple: 1,
  },
  pdfExport: 5,
} as const;

// 降级阈值配置
export const DEGRADATION_THRESHOLDS = {
  full: 100, // >= 100积分：完整功能
  medium: 50, // 50-99积分：中级功能
  lite: 10, // 10-49积分：基础功能
  minimum: 1, // < 10积分：最小功能
} as const;

/**
 * 获取用户的降级等级
 */
export function getDegradationLevel(credits: number): DegradationLevel {
  if (credits >= DEGRADATION_THRESHOLDS.full) {
    return 'full';
  }
  if (credits >= DEGRADATION_THRESHOLDS.medium) {
    return 'medium';
  }
  return 'lite';
}

/**
 * 获取降级等级对应的功能权限
 */
export function getFeaturePermissions(
  level: DegradationLevel
): FeaturePermissions {
  switch (level) {
    case 'full':
      return {
        // 完整功能
        baziFullAnalysis: true,
        baziTenGods: true,
        baziCharts: true,
        baziInterpretation: true,
        baziExport: true,
        xuankongFullAnalysis: true,
        xuankongNinePalace: true,
        xuankongRecommendations: true,
        xuankongExport: true,
        aiChatUnlimited: true,
        aiChatDeepAnalysis: true,
        aiChatHistory: true,
        cacheEnabled: true,
        cacheTTL: 3600, // 1小时
      };

    case 'medium':
      return {
        // 中级功能（无导出和深度分析）
        baziFullAnalysis: true,
        baziTenGods: true,
        baziCharts: true,
        baziInterpretation: false,
        baziExport: false,
        xuankongFullAnalysis: true,
        xuankongNinePalace: true,
        xuankongRecommendations: false,
        xuankongExport: false,
        aiChatUnlimited: false,
        aiChatDeepAnalysis: false,
        aiChatHistory: true,
        cacheEnabled: true,
        cacheTTL: 1800, // 30分钟
      };

    case 'lite':
      return {
        // 基础功能（仅基本分析）
        baziFullAnalysis: false,
        baziTenGods: false,
        baziCharts: false,
        baziInterpretation: false,
        baziExport: false,
        xuankongFullAnalysis: false,
        xuankongNinePalace: false,
        xuankongRecommendations: false,
        xuankongExport: false,
        aiChatUnlimited: false,
        aiChatDeepAnalysis: false,
        aiChatHistory: false,
        cacheEnabled: true,
        cacheTTL: 900, // 15分钟
      };
  }
}

/**
 * 检查是否有足够的积分执行操作
 */
export function canAffordOperation(
  credits: number,
  operation: keyof typeof CREDIT_COSTS,
  level?: 'full' | 'medium' | 'lite' | 'deep' | 'normal' | 'simple'
): boolean {
  const costs = CREDIT_COSTS[operation];

  if (typeof costs === 'number') {
    return credits >= costs;
  }

  if (level && typeof costs === 'object' && level in costs) {
    return credits >= costs[level as keyof typeof costs];
  }

  return false;
}

/**
 * 计算操作后的剩余积分
 */
export function calculateRemainingCredits(
  currentCredits: number,
  operation: keyof typeof CREDIT_COSTS,
  level?: 'full' | 'medium' | 'lite' | 'deep' | 'normal' | 'simple'
): number {
  const costs = CREDIT_COSTS[operation];

  if (typeof costs === 'number') {
    return Math.max(0, currentCredits - costs);
  }

  if (level && typeof costs === 'object' && level in costs) {
    const cost = costs[level as keyof typeof costs];
    return Math.max(0, currentCredits - cost);
  }

  return currentCredits;
}

/**
 * 降级结果处理器
 * 根据降级等级返回相应的结果
 */
export function degradeResult<T>(
  fullResult: T,
  level: DegradationLevel
): Partial<T> {
  if (level === 'full') {
    return fullResult;
  }

  // 这里可以根据具体的结果类型进行降级处理
  // 例如，移除某些高级字段
  const result = { ...fullResult } as any;

  if (level === 'medium') {
    // 中级降级：移除导出和深度分析相关字段
    result.exportUrl = undefined;
    result.deepInterpretation = undefined;
    result.recommendations = undefined;
  } else if (level === 'lite') {
    // 基础降级：只保留基本信息
    const basicFields = ['id', 'name', 'date', 'basicInfo', 'summary'];
    const liteResult: any = {};

    basicFields.forEach((field) => {
      if (field in result) {
        liteResult[field] = result[field];
      }
    });

    return liteResult;
  }

  return result;
}

/**
 * 获取降级提示信息
 */
export function getDegradationMessage(
  level: DegradationLevel,
  credits: number
): string {
  switch (level) {
    case 'full':
      return `您当前有 ${credits} 积分，享受完整功能。`;
    case 'medium':
      return `您当前有 ${credits} 积分，部分高级功能受限。充值到 ${DEGRADATION_THRESHOLDS.full} 积分解锁完整功能。`;
    case 'lite':
      return `您当前积分不足（${credits} 积分），仅能使用基础功能。充值到 ${DEGRADATION_THRESHOLDS.medium} 积分解锁更多功能。`;
  }
}

/**
 * 积分不足时的降级建议
 */
export interface DegradationSuggestion {
  message: string;
  suggestedAction: 'recharge' | 'use_lite' | 'try_later';
  requiredCredits?: number;
  alternativeOptions?: string[];
}

export function getDegradationSuggestion(
  currentCredits: number,
  requiredCredits: number
): DegradationSuggestion {
  const shortage = requiredCredits - currentCredits;

  if (shortage <= 10) {
    return {
      message: `您还需要 ${shortage} 积分即可使用此功能。`,
      suggestedAction: 'recharge',
      requiredCredits: shortage,
      alternativeOptions: ['使用基础版本', '查看免费示例'],
    };
  }
  if (shortage <= 50) {
    return {
      message: `此功能需要 ${requiredCredits} 积分，您当前有 ${currentCredits} 积分。`,
      suggestedAction: 'use_lite',
      requiredCredits: shortage,
      alternativeOptions: ['使用简化版分析', '充值后使用完整功能'],
    };
  }
  return {
    message: '积分不足，建议先充值或使用其他功能。',
    suggestedAction: 'try_later',
    requiredCredits: shortage,
    alternativeOptions: ['查看免费内容', '了解充值优惠'],
  };
}
