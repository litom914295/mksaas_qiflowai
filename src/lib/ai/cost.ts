import type { AIRequest, AIResponse, CostBudget } from './types';

export type CostRecord = {
  userId?: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  at: number;
};

// 简化的内存预算与统计（后续可替换为持久化）
const usageByUser: Map<string, { daily: number; monthly: number }> = new Map();

// 持久化存储接口
interface CostStorage {
  getUsage(userId: string): Promise<{ daily: number; monthly: number } | null>;
  setUsage(
    userId: string,
    usage: { daily: number; monthly: number }
  ): Promise<void>;
  incrementUsage(userId: string, cost: number): Promise<void>;
  resetDailyUsage(): Promise<void>;
  resetMonthlyUsage(): Promise<void>;
}

// 内存存储实现（开发环境）
class MemoryCostStorage implements CostStorage {
  private storage = new Map<string, { daily: number; monthly: number }>();

  async getUsage(
    userId: string
  ): Promise<{ daily: number; monthly: number } | null> {
    return this.storage.get(userId) || null;
  }

  async setUsage(
    userId: string,
    usage: { daily: number; monthly: number }
  ): Promise<void> {
    this.storage.set(userId, usage);
  }

  async incrementUsage(userId: string, cost: number): Promise<void> {
    const current = (await this.getUsage(userId)) || { daily: 0, monthly: 0 };
    await this.setUsage(userId, {
      daily: current.daily + cost,
      monthly: current.monthly + cost,
    });
  }

  async resetDailyUsage(): Promise<void> {
    for (const [userId, usage] of this.storage.entries()) {
      this.storage.set(userId, { ...usage, daily: 0 });
    }
  }

  async resetMonthlyUsage(): Promise<void> {
    for (const [userId, usage] of this.storage.entries()) {
      this.storage.set(userId, { ...usage, monthly: 0 });
    }
  }
}

// 数据库存储实现（生产环境）
class DatabaseCostStorage implements CostStorage {
  private supabase: any;

  constructor() {
    // 延迟初始化以避免环境变量问题
    this.initialize();
  }

  private async initialize() {
    if (this.supabase) return;

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.warn(
        'Supabase credentials not found, falling back to memory storage'
      );
      return;
    }

    this.supabase = createClient(supabaseUrl, serviceKey);
  }

  async getUsage(
    userId: string
  ): Promise<{ daily: number; monthly: number } | null> {
    await this.initialize();
    if (!this.supabase) return null;

    try {
      // 获取今日使用量
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyData, error: dailyError } = await this.supabase
        .from('ai_cost_tracking')
        .select('cost_usd')
        .eq('user_id', userId)
        .gte('created_at', today + 'T00:00:00.000Z')
        .lt('created_at', today + 'T23:59:59.999Z');

      if (dailyError) throw dailyError;

      // 获取本月使用量
      const monthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();
      const { data: monthlyData, error: monthlyError } = await this.supabase
        .from('ai_cost_tracking')
        .select('cost_usd')
        .eq('user_id', userId)
        .gte('created_at', monthStart);

      if (monthlyError) throw monthlyError;

      const daily =
        dailyData?.reduce(
          (sum: number, record: any) => sum + record.cost_usd,
          0
        ) || 0;
      const monthly =
        monthlyData?.reduce(
          (sum: number, record: any) => sum + record.cost_usd,
          0
        ) || 0;

      return { daily, monthly };
    } catch (error) {
      console.error('Failed to get usage from database:', error);
      return null;
    }
  }

  async setUsage(
    userId: string,
    usage: { daily: number; monthly: number }
  ): Promise<void> {
    // 对于数据库存储，我们不需要直接设置总量，而是记录单独的记录
    // 这个方法在数据库实现中可能不需要
  }

  async incrementUsage(userId: string, cost: number): Promise<void> {
    await this.initialize();
    if (!this.supabase) {
      console.warn('Supabase not available, cannot record usage');
      return;
    }

    try {
      const { error } = await this.supabase.from('ai_cost_tracking').insert({
        user_id: userId,
        cost_usd: cost,
        recorded_at: new Date().toISOString(),
        metadata: {
          source: 'ai-api',
          recorded_by: 'cost-tracking-system',
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to record usage in database:', error);
    }
  }

  async resetDailyUsage(): Promise<void> {
    // 对于数据库存储，我们不删除记录，而是依靠时间查询来计算当日使用量
    // 这个方法在数据库实现中可能不需要
  }

  async resetMonthlyUsage(): Promise<void> {
    // 对于数据库存储，我们不删除记录，而是依靠时间查询来计算当月使用量
    // 这个方法在数据库实现中可能不需要
  }
}

// 根据环境选择存储实现
const costStorage: CostStorage =
  process.env.NODE_ENV === 'production'
    ? new DatabaseCostStorage()
    : new MemoryCostStorage();

export const estimateCostUsd = (
  model: string,
  promptTokens: number,
  completionTokens: number
): number => {
  // 模型定价表（每1K tokens的价格，USD）
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4o': { prompt: 0.005, completion: 0.015 },
    'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
    'claude-3-5-sonnet': { prompt: 0.003, completion: 0.015 },
    'claude-3-opus': { prompt: 0.015, completion: 0.075 },
    'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
    'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
    'gemini-pro': { prompt: 0.0005, completion: 0.0015 },
    'deepseek-chat': { prompt: 0.00014, completion: 0.00028 },
  };

  const modelPricing = pricing[model.toLowerCase()] || pricing['gpt-4o-mini'];
  const promptCost = (promptTokens / 1000) * modelPricing.prompt;
  const completionCost = (completionTokens / 1000) * modelPricing.completion;

  return promptCost + completionCost;
};

export const checkBudget = async (
  userId: string | undefined,
  budget?: CostBudget
): Promise<boolean> => {
  if (!budget) return true;
  if (!userId) return true;

  const usage = await costStorage.getUsage(userId);
  if (!usage) return true;

  if (budget.hardLimitUsd && usage.monthly >= budget.hardLimitUsd) return false;
  if (budget.dailyUsd && usage.daily >= budget.dailyUsd) return false;
  if (budget.monthlyUsd && usage.monthly >= budget.monthlyUsd) return false;
  return true;
};

export const recordUsage = async (
  userId: string | undefined,
  cost: number
): Promise<void> => {
  if (!userId) return;
  await costStorage.incrementUsage(userId, cost);
};

// 新增：获取用户使用情况
export const getUserUsage = async (
  userId: string
): Promise<{ daily: number; monthly: number }> => {
  const usage = await costStorage.getUsage(userId);
  return usage || { daily: 0, monthly: 0 };
};

// 新增：获取用户预算状态
export const getUserBudgetStatus = async (
  userId: string,
  budget: CostBudget
): Promise<{
  daily: { used: number; limit: number; remaining: number; percentage: number };
  monthly: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  nearLimit: boolean;
  overLimit: boolean;
}> => {
  const usage = await getUserUsage(userId);

  const dailyLimit = budget.dailyUsd || 0;
  const monthlyLimit = budget.monthlyUsd || 0;

  const dailyRemaining = Math.max(0, dailyLimit - usage.daily);
  const monthlyRemaining = Math.max(0, monthlyLimit - usage.monthly);

  const dailyPercentage = dailyLimit > 0 ? (usage.daily / dailyLimit) * 100 : 0;
  const monthlyPercentage =
    monthlyLimit > 0 ? (usage.monthly / monthlyLimit) * 100 : 0;

  const nearLimit = dailyPercentage > 80 || monthlyPercentage > 80;
  const overLimit = dailyPercentage >= 100 || monthlyPercentage >= 100;

  return {
    daily: {
      used: usage.daily,
      limit: dailyLimit,
      remaining: dailyRemaining,
      percentage: dailyPercentage,
    },
    monthly: {
      used: usage.monthly,
      limit: monthlyLimit,
      remaining: monthlyRemaining,
      percentage: monthlyPercentage,
    },
    nearLimit,
    overLimit,
  };
};

// 新增：重置使用情况（用于定时任务）
export const resetDailyUsage = async (): Promise<void> => {
  await costStorage.resetDailyUsage();
};

export const resetMonthlyUsage = async (): Promise<void> => {
  await costStorage.resetMonthlyUsage();
};
