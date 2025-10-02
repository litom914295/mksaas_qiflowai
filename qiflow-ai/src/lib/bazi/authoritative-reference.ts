/**
 * 权威干支日柱对照表
 * 基于万年历和传统命理资料的权威数据
 * 用于验证和校正算法
 */

export const AUTHORITATIVE_DAY_PILLARS = {
  // 基准日期 - 已确认的权威基准
  '2000-01-01': '戊午', // Y2K年新年 - 已确认
  '2000-01-02': '己未', // 戊午日的下一天 
  '2000-01-03': '庚申', // 庚申日 
  
  // 常见出生年份测试点 - 基于搜索验证更新
  '1990-05-10': '乙亥', // 1990年5月10日 - 搜索确认为乙亥日而非乙酉日
  
  // 传统基准日期（需要用新算法验证）
  '1900-01-31': '甲子', // 传统甲子日基准 - 待验证
  '1900-02-01': '乙丑', // 甲子日的下一天 - 待验证
  
  // 其他日期（需要通过在线工具验证）
  '1985-12-25': '甲申', // 1985年12月25日 - 待验证
  '1995-03-15': '壬申', // 1995年3月15日 - 待验证
  '2004-02-29': '甲戌', // 2004年闰年2月29日 - 待验证
  '2020-01-01': '甲子', // 2020年1月1日 - 待验证
  '2020-01-02': '乙丑', // 2020年1月2日 - 待验证
  '2023-02-04': '癸卯', // 2023年立春日 - 待验证
  '2024-01-01': '癸卯', // 2024年新年 - 待验证
  '2025-01-01': '戊申', // 2025年新年 - 待验证
} as const;

/**
 * 天干地支基础数据
 */
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/**
 * 生成60甲子表
 */
export function generateSixtyJiazi(): string[] {
  const jiazi: string[] = [];
  
  for (let i = 0; i < 60; i++) {
    const stem = HEAVENLY_STEMS[i % 10];
    const branch = EARTHLY_BRANCHES[i % 12];
    jiazi.push(`${stem}${branch}`);
  }
  
  return jiazi;
}

/**
 * 计算两个日期之间的天数差
 * @param fromDate 起始日期
 * @param toDate 目标日期
 * @returns 天数差 (可以是负数)
 */
export function calculateDaysDiff(fromDate: Date, toDate: Date): number {
  const fromTime = fromDate.getTime();
  const toTime = toDate.getTime();
  return Math.floor((toTime - fromTime) / (1000 * 60 * 60 * 24));
}

/**
 * 根据权威基准计算干支日柱
 * @param targetDate 目标日期
 * @returns 干支日柱
 */
export function calculateAuthoritativeDayPillar(targetDate: Date): string {
  // 使用2000年1月1日戊午日作为已知基准点
  const referenceDate = new Date(2000, 0, 1); // 2000年1月1日
  referenceDate.setHours(0, 0, 0, 0);
  const referencePillar = '戊午'; // 已确认的正确日柱
  
  const normalizedTarget = new Date(targetDate);
  normalizedTarget.setHours(0, 0, 0, 0);
  
  const daysDiff = calculateDaysDiff(referenceDate, normalizedTarget);
  const jiazi = generateSixtyJiazi();
  
  // 找到戊午在60甲子中的索引
  const referenceIndex = jiazi.indexOf(referencePillar); // 戊午的索引
  
  // 计算目标日期的索引
  const targetIndex = ((referenceIndex + daysDiff) % 60 + 60) % 60; // 确保结果为正数
  
  return jiazi[targetIndex];
}

/**
 * 验证权威数据准确性
 */
export function validateAuthoritativeData(): { [date: string]: { expected: string; calculated: string; match: boolean } } {
  const results: { [date: string]: { expected: string; calculated: string; match: boolean } } = {};
  
  for (const [dateStr, expectedPillar] of Object.entries(AUTHORITATIVE_DAY_PILLARS)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day); // 月份从0开始
    
    const calculated = calculateAuthoritativeDayPillar(targetDate);
    const match = calculated === expectedPillar;
    
    results[dateStr] = {
      expected: expectedPillar,
      calculated,
      match
    };
  }
  
  return results;
}

/**
 * 处理子时跨日的日期调整
 * @param originalDate 原始日期
 * @param useZiBoundary 是否使用子时跨日规则
 * @returns 调整后的日期
 */
export function adjustDateForZiHour(originalDate: Date, useZiBoundary: boolean = true): Date {
  if (!useZiBoundary) {
    return new Date(originalDate);
  }
  
  const adjusted = new Date(originalDate);
  const hour = adjusted.getHours();
  
  // 23:00-23:59 按传统子时跨日规则算作次日
  if (hour >= 23) {
    adjusted.setDate(adjusted.getDate() + 1);
    adjusted.setHours(0, 0, 0, 0);
  } else {
    adjusted.setHours(0, 0, 0, 0);
  }
  
  return adjusted;
}