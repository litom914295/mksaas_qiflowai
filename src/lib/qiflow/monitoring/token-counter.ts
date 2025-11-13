/**
 * Token 计数器
 *
 * 精确计算AI调用的token消耗和成本
 */

/**
 * 模型价格表（单位：美元/1M tokens）
 */
const MODEL_PRICING = {
  'deepseek-chat': {
    input: 0.27, // $0.27 / 1M input tokens
    output: 1.1, // $1.10 / 1M output tokens
    cache: 0.014, // $0.014 / 1M cached tokens (95% discount)
  },
  'gpt-3.5-turbo': {
    input: 0.5,
    output: 1.5,
    cache: 0,
  },
  'gpt-4': {
    input: 30.0,
    output: 60.0,
    cache: 0,
  },
} as const;

export type ModelName = keyof typeof MODEL_PRICING;

/**
 * Token使用统计
 */
export interface TokenUsage {
  model: ModelName;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  totalTokens: number;
  estimatedCost: number; // USD
  timestamp: Date;
}

/**
 * 成本明细
 */
export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cacheCost: number;
  totalCost: number;
  currency: 'USD';
}

/**
 * 简单的token估算（基于字符数）
 * 实际应使用 tiktoken 库进行精确计算
 */
export function estimateTokens(text: string): number {
  // 中文：1.5字符 ≈ 1 token
  // 英文：4字符 ≈ 1 token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;

  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}

/**
 * 计算成本
 */
export function calculateCost(
  model: ModelName,
  inputTokens: number,
  outputTokens: number,
  cachedTokens = 0
): CostBreakdown {
  const pricing = MODEL_PRICING[model];

  const inputCost = (inputTokens * pricing.input) / 1_000_000;
  const outputCost = (outputTokens * pricing.output) / 1_000_000;
  const cacheCost = (cachedTokens * pricing.cache) / 1_000_000;

  return {
    inputCost: Number(inputCost.toFixed(6)),
    outputCost: Number(outputCost.toFixed(6)),
    cacheCost: Number(cacheCost.toFixed(6)),
    totalCost: Number((inputCost + outputCost + cacheCost).toFixed(6)),
    currency: 'USD',
  };
}

/**
 * 记录token使用
 */
export function recordTokenUsage(
  model: ModelName,
  inputTokens: number,
  outputTokens: number,
  cachedTokens?: number
): TokenUsage {
  const cost = calculateCost(model, inputTokens, outputTokens, cachedTokens);

  return {
    model,
    inputTokens,
    outputTokens,
    cachedTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCost: cost.totalCost,
    timestamp: new Date(),
  };
}

/**
 * 批量统计token使用
 */
export function aggregateTokenUsage(usages: TokenUsage[]): {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  byModel: Record<string, { tokens: number; cost: number }>;
} {
  const byModel: Record<string, { tokens: number; cost: number }> = {};

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;

  for (const usage of usages) {
    totalInputTokens += usage.inputTokens;
    totalOutputTokens += usage.outputTokens;
    totalCost += usage.estimatedCost;

    if (!byModel[usage.model]) {
      byModel[usage.model] = { tokens: 0, cost: 0 };
    }
    byModel[usage.model].tokens += usage.totalTokens;
    byModel[usage.model].cost += usage.estimatedCost;
  }

  return {
    totalInputTokens,
    totalOutputTokens,
    totalCost: Number(totalCost.toFixed(6)),
    byModel,
  };
}

/**
 * Token计数器类（支持持久化）
 */
export class TokenCounter {
  private usages: TokenUsage[] = [];

  /**
   * 记录使用
   */
  record(
    model: ModelName,
    inputTokens: number,
    outputTokens: number,
    cachedTokens?: number
  ): TokenUsage {
    const usage = recordTokenUsage(
      model,
      inputTokens,
      outputTokens,
      cachedTokens
    );
    this.usages.push(usage);
    return usage;
  }

  /**
   * 获取统计
   */
  getStats() {
    return aggregateTokenUsage(this.usages);
  }

  /**
   * 获取最近的使用记录
   */
  getRecent(count = 10): TokenUsage[] {
    return this.usages.slice(-count);
  }

  /**
   * 重置计数器
   */
  reset(): void {
    this.usages = [];
  }

  /**
   * 导出数据
   */
  export(): TokenUsage[] {
    return [...this.usages];
  }

  /**
   * 导入数据
   */
  import(usages: TokenUsage[]): void {
    this.usages = usages.map((u) => ({
      ...u,
      timestamp: new Date(u.timestamp),
    }));
  }
}

/**
 * 全局计数器实例
 */
export const globalTokenCounter = new TokenCounter();
