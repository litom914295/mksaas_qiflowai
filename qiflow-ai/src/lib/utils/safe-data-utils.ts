/**
 * 安全数据访问工具函数
 * 用于处理可能为undefined或null的数据访问，防止TypeError
 */

/**
 * 安全地将数组转换为字符串
 * @param arr - 可能为undefined的数组
 * @param separator - 分隔符，默认为', '
 * @param fallback - 当数组为空或undefined时的默认值
 * @returns 格式化的字符串
 */
export function safeArrayJoin(
  arr: unknown[] | undefined | null,
  separator: string = ', ',
  fallback: string = '暂无数据'
): string {
  if (!Array.isArray(arr) || arr.length === 0) {
    return fallback;
  }
  
  return arr
    .filter(item => item != null && item !== '') // 过滤空值
    .map(item => String(item)) // 确保转换为字符串
    .join(separator);
}

/**
 * 安全地获取数字值
 * @param value - 可能为undefined的数字
 * @param fallback - 默认值
 * @returns 数字值
 */
export function safeNumber(
  value: number | undefined | null,
  fallback: number = 0
): number {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
}

/**
 * 安全地获取字符串值
 * @param value - 可能为undefined的字符串
 * @param fallback - 默认值
 * @returns 字符串值
 */
export function safeString(
  value: string | undefined | null,
  fallback: string = ''
): string {
  return typeof value === 'string' ? value : fallback;
}

/**
 * 确保值是数组类型
 * @param value - 任意值
 * @returns 数组或空数组
 */
export function ensureArray<T>(value: T[] | T | undefined | null): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  
  if (value != null) {
    return [value];
  }
  
  return [];
}

/**
 * 安全地访问对象属性
 * @param obj - 对象
 * @param path - 属性路径，如 'user.profile.name'
 * @param fallback - 默认值
 * @returns 属性值或默认值
 */
export function safeGet(obj: any, path: string, fallback: any = undefined): any {
  if (!obj || typeof obj !== 'object') {
    return fallback;
  }

  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return fallback;
    }
    current = current[key];
  }

  return current;
}

/**
 * 检查值是否为有效的非空值
 * @param value - 要检查的值
 * @returns 是否为有效值
 */
export function isValidValue(value: any): boolean {
  return value != null && value !== '' && value !== undefined;
}

/**
 * AI分析结果的安全访问器
 */
export interface SafeAIAnalysisResult {
  score: number;
  recommendations: string[];
  confidence: number;
  summary?: string;
  areas?: any[];
}

/**
 * 创建安全的AI分析结果访问器
 * @param data - 原始AI分析数据
 * @returns 安全的数据访问器
 */
export function createSafeAIAnalysis(data: any): SafeAIAnalysisResult {
  return {
    score: safeNumber(data?.score, 0),
    recommendations: ensureArray(data?.recommendations),
    confidence: safeNumber(data?.confidence, 0),
    summary: safeString(data?.summary, ''),
    areas: ensureArray(data?.areas)
  };
}

/**
 * 格式化AI分析建议
 * @param recommendations - 建议数组
 * @returns 格式化的建议字符串
 */
export function formatRecommendations(
  recommendations: unknown[] | undefined | null
): string {
  return safeArrayJoin(recommendations, ', ', '暂无建议');
}

/**
 * 格式化置信度百分比
 * @param confidence - 置信度值 (0-1)
 * @returns 格式化的百分比字符串
 */
export function formatConfidence(confidence: number | undefined | null): string {
  const safeConf = safeNumber(confidence, 0);
  return `${(safeConf * 100).toFixed(1)}%`;
}

/**
 * 验证AI分析结果的完整性
 * @param data - AI分析数据
 * @returns 验证结果
 */
export function validateAIAnalysisResult(data: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data) {
    errors.push('分析数据为空');
    return { isValid: false, errors, warnings };
  }

  if (typeof data.score !== 'number' || isNaN(data.score)) {
    errors.push('评分数据无效');
  } else if (data.score < 0 || data.score > 100) {
    warnings.push('评分超出正常范围 (0-100)');
  }

  if (!Array.isArray(data.recommendations)) {
    errors.push('建议数据格式错误');
  } else if (data.recommendations.length === 0) {
    warnings.push('暂无建议内容');
  }

  if (typeof data.confidence !== 'number' || isNaN(data.confidence)) {
    errors.push('置信度数据无效');
  } else if (data.confidence < 0 || data.confidence > 1) {
    warnings.push('置信度超出正常范围 (0-1)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}