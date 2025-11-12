/**
 * QiFlow 产品定价配置
 * 统一管理所有产品的积分消耗
 */
export const QIFLOW_PRICING = {
  // 现有产品
  aiChat: 5,
  bazi: 10,
  xuankong: 20,
  deepInterpretation: 30,
  pdfExport: 5,

  // Phase 2 新增: 报告产品
  reportBasic: 50, // 基础报告 (仅生辰解读)
  reportEssential: 120, // 精华报告 (3 主题精选)

  // Phase 6 新增: Chat 会话制
  chatSession15Min: 40, // 15 分钟 Chat 会话
} as const;

export type QiflowProduct = keyof typeof QIFLOW_PRICING;

/**
 * 报告类型映射
 */
export const REPORT_TYPES = {
  basic: 'reportBasic',
  essential: 'reportEssential',
} as const;

export type ReportType = keyof typeof REPORT_TYPES;

/**
 * 获取产品定价
 */
export function getQiflowPrice(product: QiflowProduct): number {
  return QIFLOW_PRICING[product];
}

/**
 * 检查用户是否有足够积分
 */
export function hasEnoughCredits(
  userCredits: number,
  product: QiflowProduct
): boolean {
  return userCredits >= QIFLOW_PRICING[product];
}

/**
 * 计算所需积分
 */
export function calculateRequiredCredits(products: QiflowProduct[]): number {
  return products.reduce(
    (total, product) => total + QIFLOW_PRICING[product],
    0
  );
}
