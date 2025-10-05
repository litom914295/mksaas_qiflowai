/**
 * Credits Manager - 积分管理系统
 * 实现三级降级策略和计费管理
 */

import { getDb } from '@/db';
import { user, userCredit, creditTransaction } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type FeatureType = 'aiChat' | 'deepInterpretation' | 'bazi' | 'xuankong' | 'pdfExport';
export type ExecutionResult<T = any> = 
  | { type: 'full'; result: T; creditsUsed: number }
  | { type: 'limited'; result: T; creditsUsed: number }
  | { type: 'insufficient'; message: string; required: number; balance: number };

export class CreditsManager {
  // 计费口径（积分消耗）
  static readonly PRICES = {
    aiChat: 5,
    deepInterpretation: 30,
    bazi: 10,
    xuankong: 20,
    pdfExport: 5,
  } as const;

  // 获取功能所需积分
  static getPrice(feature: FeatureType): number {
    return this.PRICES[feature];
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
          .set({ currentCredits: currentBalance + amount, updatedAt: new Date() })
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
          creditsUsed: required 
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
          creditsUsed: limitedRequired
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
      balance
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
        ...metadata
      });
    } catch (error) {
      console.error('Failed to log consumption:', error);
    }
  }
}

// 单例实例
export const creditsManager = new CreditsManager();