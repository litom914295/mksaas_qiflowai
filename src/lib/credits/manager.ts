/**
 * Credits Manager - 积分管理系统
 * 实现三级降级策略和计费管理
 */

import { getDb } from '@/db';
import { creditTransaction, user, userCredit } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type FeatureType =
  | 'aiChat'
  | 'deepInterpretation'
  | 'bazi'
  | 'xuankong'
  | 'pdfExport'
  | 'xuankongUnifiedBasic'
  | 'xuankongUnifiedStandard'
  | 'xuankongUnifiedComprehensive'
  | 'xuankongUnifiedExpert';
export type XuankongMode =
  | 'local'
  | 'unified-basic'
  | 'unified-standard'
  | 'unified-comprehensive'
  | 'unified-expert';
export type ExecutionResult<T = any> =
  | { type: 'full'; result: T; creditsUsed: number }
  | { type: 'limited'; result: T; creditsUsed: number }
  | {
      type: 'insufficient';
      message: string;
      required: number;
      balance: number;
    };

export class CreditsManager {
  // 计费口径（积分消耗）
  static readonly PRICES = {
    aiChat: 5,
    deepInterpretation: 30,
    bazi: 10,
    xuankong: 20, // 本地玄空分析（前端计算）
    pdfExport: 5,
    // 统一引擎分级计费
    xuankongUnifiedBasic: 30, // 基础后端分析
    xuankongUnifiedStandard: 50, // 标准分析（+评分+预警）
    xuankongUnifiedComprehensive: 80, // 综合分析（+流年+个性化）
    xuankongUnifiedExpert: 120, // 专家级分析（全模块）
  } as const;

  // 获取功能所需积分
  static getPrice(feature: FeatureType): number {
    return CreditsManager.PRICES[feature];
  }

  // 获取用户当前积分余额
  async getBalance(userId: string): Promise<number> {
    try {
      const db = await getDb();
      const userCredits = await db
        .select({ credits: userCredit.currentCredits })
        .from(userCredit)
        .where(eq(userCredit.userId, userId))
        .limit(1);

      return userCredits[0]?.credits ?? 0;
    } catch (error) {
      console.error('Failed to get user balance:', error);
      return 0;
    }
  }

  // 扣除用户积分
  async deduct(userId: string, amount: number): Promise<boolean> {
    try {
      const currentBalance = await this.getBalance(userId);
      if (currentBalance < amount) {
        return false;
      }

      const db = await getDb();
      await db
        .update(userCredit)
        .set({ currentCredits: currentBalance - amount, updatedAt: new Date() })
        .where(eq(userCredit.userId, userId));

      // 记录交易
      await db.insert(creditTransaction).values({
        id: `txn_${Date.now()}`,
        userId,
        type: 'deduction',
        amount: -amount,
        remainingAmount: currentBalance - amount,
        description: 'Feature usage',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Failed to deduct credits:', error);
      return false;
    }
  }

  // 添加用户积分（充值或奖励）
  async addCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const currentBalance = await this.getBalance(userId);
      const db = await getDb();

      // 如果用户还没有积分记录，创建一个
      const existing = await db
        .select()
        .from(userCredit)
        .where(eq(userCredit.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(userCredit).values({
          id: `ucr_${Date.now()}`,
          userId,
          currentCredits: amount,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        await db
          .update(userCredit)
          .set({
            currentCredits: currentBalance + amount,
            updatedAt: new Date(),
          })
          .where(eq(userCredit.userId, userId));
      }

      // 记录交易
      await db.insert(creditTransaction).values({
        id: `txn_${Date.now()}`,
        userId,
        type: 'addition',
        amount: amount,
        remainingAmount: currentBalance + amount,
        description: 'Credit added',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Failed to add credits:', error);
      return false;
    }
  }

  // 三级降级策略执行
  async executeWithCredits<T>(
    userId: string,
    feature: FeatureType,
    fullCallback: () => Promise<T>,
    limitedCallback?: () => Promise<T>
  ): Promise<ExecutionResult<T>> {
    const required = CreditsManager.PRICES[feature];
    const balance = await this.getBalance(userId);

    // 级别1：完整功能
    if (balance >= required) {
      try {
        const result = await fullCallback();
        await this.deduct(userId, required);
        return {
          type: 'full',
          result,
          creditsUsed: required,
        };
      } catch (error) {
        console.error('Failed to execute full feature:', error);
        throw error;
      }
    }

    // 级别2：简化功能（消耗一半积分）
    const limitedRequired = Math.floor(required / 2);
    if (balance >= limitedRequired && limitedCallback) {
      try {
        const result = await limitedCallback();
        await this.deduct(userId, limitedRequired);
        return {
          type: 'limited',
          result,
          creditsUsed: limitedRequired,
        };
      } catch (error) {
        console.error('Failed to execute limited feature:', error);
        throw error;
      }
    }

    // 级别3：积分不足
    return {
      type: 'insufficient',
      message: `余额不足，需要 ${required} 积分，当前余额 ${balance} 积分`,
      required,
      balance,
    };
  }

  // 检查用户是否有足够积分
  async canAfford(userId: string, feature: FeatureType): Promise<boolean> {
    const required = CreditsManager.PRICES[feature];
    const balance = await this.getBalance(userId);
    return balance >= required;
  }

  // 批量操作 - 检查多个功能
  async checkMultipleFeatures(
    userId: string,
    features: FeatureType[]
  ): Promise<Record<FeatureType, boolean>> {
    const balance = await this.getBalance(userId);
    const result = {} as Record<FeatureType, boolean>;

    for (const feature of features) {
      result[feature] = balance >= CreditsManager.PRICES[feature];
    }

    return result;
  }

  /**
   * 智能选择玄空分析模式（根据用户积分）
   */
  async selectXuankongMode(userId: string): Promise<{
    mode: XuankongMode;
    reason: string;
    balance: number;
    costBreakdown: Record<XuankongMode, number>;
  }> {
    const balance = await this.getBalance(userId);

    const costBreakdown: Record<XuankongMode, number> = {
      local: CreditsManager.PRICES.xuankong,
      'unified-basic': CreditsManager.PRICES.xuankongUnifiedBasic,
      'unified-standard': CreditsManager.PRICES.xuankongUnifiedStandard,
      'unified-comprehensive':
        CreditsManager.PRICES.xuankongUnifiedComprehensive,
      'unified-expert': CreditsManager.PRICES.xuankongUnifiedExpert,
    };

    // 优先推荐性价比最高的模式
    if (balance >= CreditsManager.PRICES.xuankongUnifiedComprehensive) {
      return {
        mode: 'unified-comprehensive',
        reason: '积分充足，推荐综合分析（含个性化+流年预测+行动计划）',
        balance,
        costBreakdown,
      };
    }

    if (balance >= CreditsManager.PRICES.xuankongUnifiedStandard) {
      return {
        mode: 'unified-standard',
        reason: '推荐标准分析（含智能评分+分级预警+关键位置）',
        balance,
        costBreakdown,
      };
    }

    if (balance >= CreditsManager.PRICES.xuankongUnifiedBasic) {
      return {
        mode: 'unified-basic',
        reason: '推荐基础后端分析（飞星盘+格局判断）',
        balance,
        costBreakdown,
      };
    }

    if (balance >= CreditsManager.PRICES.xuankong) {
      return {
        mode: 'local',
        reason: '积分有限，使用本地专业模式（前端计算，秒级响应）',
        balance,
        costBreakdown,
      };
    }

    return {
      mode: 'local',
      reason: `积分不足（需${CreditsManager.PRICES.xuankong}，余额${balance}），请充值或使用匿名试用`,
      balance,
      costBreakdown,
    };
  }

  /**
   * 执行玄空分析（带自动扣费）
   */
  async executeXuankongAnalysis(
    userId: string,
    mode: XuankongMode,
    callback: () => Promise<any>
  ): Promise<ExecutionResult> {
    const priceMap: Record<XuankongMode, number> = {
      local: CreditsManager.PRICES.xuankong,
      'unified-basic': CreditsManager.PRICES.xuankongUnifiedBasic,
      'unified-standard': CreditsManager.PRICES.xuankongUnifiedStandard,
      'unified-comprehensive':
        CreditsManager.PRICES.xuankongUnifiedComprehensive,
      'unified-expert': CreditsManager.PRICES.xuankongUnifiedExpert,
    };

    const required = priceMap[mode];
    const balance = await this.getBalance(userId);

    if (balance < required) {
      return {
        type: 'insufficient',
        message: `积分不足，需要 ${required} 积分，当前余额 ${balance}`,
        required,
        balance,
      };
    }

    try {
      const result = await callback();
      await this.deduct(userId, required);
      return {
        type: 'full',
        result,
        creditsUsed: required,
      };
    } catch (error) {
      console.error('玄空分析执行失败:', error);
      throw error;
    }
  }

  // 获取用户可用功能列表
  async getAvailableFeatures(userId: string): Promise<FeatureType[]> {
    const balance = await this.getBalance(userId);
    const available: FeatureType[] = [];

    for (const [feature, price] of Object.entries(CreditsManager.PRICES)) {
      if (balance >= price) {
        available.push(feature as FeatureType);
      }
    }

    return available;
  }

  // 记录积分消费日志
  async logConsumption(
    userId: string,
    feature: FeatureType,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // 这里可以添加到日志表
      console.log('Credits consumption:', {
        userId,
        feature,
        amount,
        timestamp: new Date().toISOString(),
        ...metadata,
      });
    } catch (error) {
      console.error('Failed to log consumption:', error);
    }
  }
}

// 单例实例
export const creditsManager = new CreditsManager();
