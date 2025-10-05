/**
 * QiFlow 产品定价配置
 * 统一管理所有产品的积分消耗
 */
export const QIFLOW_PRICING = {
  aiChat: 5,
  bazi: 10,
  xuankong: 20,
  deepInterpretation: 30,
  pdfExport: 5,
} as const;

export type QiflowProduct = keyof typeof QIFLOW_PRICING;

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
