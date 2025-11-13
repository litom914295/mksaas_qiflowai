/**
 * 免责声明模块
 *
 * 统一管理所有法律声明和免责条款
 */

/**
 * 免责声明类型
 */
export type DisclaimerType =
  | 'report_general' // 报告通用声明
  | 'report_premium' // 付费报告声明
  | 'ai_generated' // AI生成内容声明
  | 'fengshui_analysis' // 风水分析声明
  | 'personal_advice' // 个人建议声明
  | 'age_restriction'; // 年龄限制声明

/**
 * 免责声明内容库
 */
export const DISCLAIMERS = {
  // 报告通用声明
  report_general: {
    title: '重要声明',
    content: `本报告由QiFlowAI人工智能系统生成，结合了传统命理学、风水学理论与现代数据分析技术。报告内容仅供参考，不构成任何专业建议。

用户在使用本报告时，应充分理解以下事项：

1. 本报告基于用户提供的出生信息和住宅数据生成，数据准确性直接影响分析质量。

2. 传统命理学和风水学属于文化传承，其理论和方法存在多种流派和解释，本报告采用的是主流派系观点。

3. AI生成的内容可能存在偏差或不准确之处，用户应结合自身实际情况理性判断，不应完全依赖报告内容做出重大决策。

4. 本报告不对任何决策结果承担责任。涉及健康、财务、法律等重大事项时，建议咨询相关领域的专业人士。

5. 本报告内容受版权保护，仅供个人使用，不得用于商业目的或转售。`,
    short:
      '本报告仅供参考，不构成专业建议。请理性看待，重大决策建议咨询专业人士。',
  },

  // 付费报告声明
  report_premium: {
    title: '精华报告特别声明',
    content: `感谢您购买QiFlowAI精华报告。除通用免责声明外，请注意：

1. 精华报告提供更深入的分析和建议，但仍属于参考性质，不保证结果的绝对准确性。

2. "人宅合一"分析基于算法和AI模型，可能因数据限制或算法局限性产生偏差。

3. 布局建议需根据实际居住环境调整，实施前建议咨询专业风水师。

4. 报告一经购买，恕不退款。如对报告内容有疑问，请联系客服。`,
    short: '精华报告提供深度分析，但仍为参考性质。布局建议需结合实际情况调整。',
  },

  // AI生成内容声明
  ai_generated: {
    title: 'AI生成内容说明',
    content: `本内容由人工智能系统自动生成。AI系统基于大量数据训练，但可能出现以下情况：

1. 内容表述可能不够精确或存在理解偏差
2. 分析结论可能不完全符合传统理论
3. 建议措施可能需要根据实际情况调整

QiFlowAI承诺：
- 所有AI生成内容经过合规性检查
- 不含有害、歧视或误导性信息
- 持续优化AI模型以提升准确性`,
    short: 'AI生成内容已通过合规检查，但可能存在理解偏差，请结合实际情况判断。',
  },

  // 风水分析声明
  fengshui_analysis: {
    title: '风水分析说明',
    content: `风水学是中国传统文化的重要组成部分，但其效果因人而异，受多种因素影响。

本报告的风水分析：
1. 基于玄空飞星等传统理论
2. 结合现代环境心理学原理
3. 通过AI算法进行综合评估

请注意：
- 风水调整效果无法量化保证
- 建议措施应在确保安全的前提下实施
- 大型改造建议咨询专业风水师和建筑师`,
    short:
      '风水分析基于传统理论与现代算法，效果因人而异。大型改造建议咨询专业人士。',
  },

  // 个人建议声明
  personal_advice: {
    title: '个人建议使用须知',
    content: `报告中的个人建议是基于算法分析得出的一般性建议，具有以下特点：

1. 建议内容针对大多数情况，但不一定适用于您的特殊情况
2. 实施建议前请评估自身实际条件和能力
3. 如建议涉及健康、投资等敏感领域，务必咨询专业人士

责任限制：
- 用户自主决定是否采纳建议
- 因实施建议产生的任何后果由用户自行承担
- QiFlowAI不对建议实施效果做任何保证`,
    short:
      '个人建议仅供参考，实施前请评估自身条件。敏感领域建议务必咨询专业人士。',
  },

  // 年龄限制声明
  age_restriction: {
    title: '使用年龄限制',
    content: `根据相关法律法规和保护未成年人原则：

1. 本服务仅面向18周岁及以上成年人
2. 未成年人不得使用本服务
3. 监护人应监督未成年人的网络行为

如发现未成年人使用，我们将：
- 立即停止服务
- 删除相关数据
- 通知监护人`,
    short: '本服务仅供18周岁及以上成年人使用。',
  },
} as const;

/**
 * 获取免责声明
 */
export function getDisclaimer(
  type: DisclaimerType,
  format: 'full' | 'short' = 'full'
): string {
  const disclaimer = DISCLAIMERS[type];

  if (format === 'short') {
    return disclaimer.short;
  }

  return `## ${disclaimer.title}\n\n${disclaimer.content}`;
}

/**
 * 获取多个免责声明（组合）
 */
export function getCombinedDisclaimers(
  types: DisclaimerType[],
  format: 'full' | 'short' = 'full'
): string {
  return types.map((type) => getDisclaimer(type, format)).join('\n\n---\n\n');
}

/**
 * 获取报告默认免责声明组合
 */
export function getReportDisclaimers(isPremium = false): string {
  const types: DisclaimerType[] = [
    'report_general',
    'ai_generated',
    'age_restriction',
  ];

  if (isPremium) {
    types.splice(1, 0, 'report_premium', 'fengshui_analysis');
  }

  return getCombinedDisclaimers(types, 'full');
}

/**
 * 验证用户是否已同意免责声明
 */
export function validateDisclaimerAcceptance(
  acceptedVersion: string,
  currentVersion = '1.0.0'
): boolean {
  // 简单版本比较（实际应使用semver库）
  return acceptedVersion === currentVersion;
}

/**
 * 生成免责声明接受记录
 */
export function createDisclaimerAcceptanceRecord(userId: string) {
  return {
    userId,
    version: '1.0.0',
    acceptedAt: new Date().toISOString(),
    ipAddress: 'placeholder', // 应从请求中获取
    userAgent: 'placeholder', // 应从请求中获取
  };
}
