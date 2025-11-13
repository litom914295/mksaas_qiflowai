'use server';

/**
 * Phase 8: 生成月度运势 Server Action
 *
 * 功能：
 * 1. 验证用户权限（Pro 会员）
 * 2. 检查是否已生成（防重复）
 * 3. 扣除积分（30 积分）
 * 4. 调用核心引擎生成运势
 * 5. 保存到数据库
 * 6. 失败自动回滚
 */

import { getDb } from '@/db';
import { monthlyFortunes } from '@/db/schema';
import { creditTransaction } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import type { BaziChart } from '@/lib/qiflow/bazi/types';
import { generateFortuneWithAI } from '@/lib/qiflow/monthly-fortune/ai-generator';
import { generateMonthlyFortune } from '@/lib/qiflow/monthly-fortune/engine';
import { and, eq } from 'drizzle-orm';

// ==================== 常量定义 ====================

const MONTHLY_FORTUNE_CREDITS = 30; // 月度运势所需积分

// ==================== 类型定义 ====================

export interface GenerateMonthlyFortuneInput {
  year: number;
  month: number;
  baziChart: BaziChart;
  useAI?: boolean; // 是否使用 AI 增强（默认 true）
}

export interface GenerateMonthlyFortuneResult {
  success: boolean;
  fortuneId?: string;
  error?: string;
  message?: string;
}

// ==================== 主函数 ====================

export async function generateMonthlyFortuneAction(
  input: GenerateMonthlyFortuneInput
): Promise<GenerateMonthlyFortuneResult> {
  try {
    // 1. 验证用户身份
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: '请先登录',
      };
    }

    const userId = session.user.id;
    const { year, month, baziChart, useAI = true } = input;

    // 2. 验证输入参数
    if (!year || !month || month < 1 || month > 12) {
      return {
        success: false,
        error: 'INVALID_INPUT',
        message: '年份或月份参数无效',
      };
    }

    if (!baziChart) {
      return {
        success: false,
        error: 'MISSING_BAZI',
        message: '缺少八字信息',
      };
    }

    // 3. 检查是否已生成（防重复）
    const db = await getDb();
    const existingList = await db
      .select()
      .from(monthlyFortunes)
      .where(
        and(
          eq(monthlyFortunes.userId, userId),
          eq(monthlyFortunes.year, year),
          eq(monthlyFortunes.month, month)
        )
      )
      .limit(1);
    const existing = existingList[0];

    if (existing) {
      if (existing.status === 'completed') {
        return {
          success: false,
          error: 'ALREADY_EXISTS',
          message: `${year}年${month}月的运势已生成`,
          fortuneId: existing.id,
        };
      }

      // 如果之前生成失败，允许重新生成
      if (existing.status === 'failed') {
        await db
          .delete(monthlyFortunes)
          .where(eq(monthlyFortunes.id, existing.id));
      }
    }

    // 4. 检查用户积分余额
    const userCredits = await getUserCredits(userId);
    if (userCredits < MONTHLY_FORTUNE_CREDITS) {
      return {
        success: false,
        error: 'INSUFFICIENT_CREDITS',
        message: `积分不足，需要 ${MONTHLY_FORTUNE_CREDITS} 积分，当前余额 ${userCredits} 积分`,
      };
    }

    // 5. 创建待生成记录
    const [newFortune] = await db
      .insert(monthlyFortunes)
      .values({
        userId,
        year,
        month,
        status: 'generating',
        fortuneData: {} as any, // 临时占位
        creditsUsed: 0, // 生成成功后更新
      })
      .returning();

    const fortuneId = newFortune.id;

    try {
      // 6. 生成基础运势（飞星计算）
      const basicFortune = await generateMonthlyFortune({
        userId,
        year,
        month,
        baziChart,
      });

      // 7. AI 增强生成（可选）
      let finalFortuneData = basicFortune.fortuneData;
      let aiCostUSD = 0;
      let aiModel = '';

      if (useAI) {
        const aiResult = await generateFortuneWithAI(
          year,
          month,
          baziChart,
          basicFortune
        );

        // 合并 AI 生成的内容
        finalFortuneData = {
          ...basicFortune.fortuneData,
          careerForecast: aiResult.careerForecast,
          healthWarnings: aiResult.healthWarnings,
          relationshipTips: aiResult.relationshipTips,
          wealthAdvice: aiResult.wealthAdvice,
        };

        aiCostUSD = aiResult.aiCostUSD;
        aiModel = 'deepseek-chat';
      }

      // 8. 扣除积分
      await deductCredits(userId, MONTHLY_FORTUNE_CREDITS, fortuneId);

      // 9. 更新运势记录为完成状态
      await db
        .update(monthlyFortunes)
        .set({
          status: 'completed',
          fortuneData: finalFortuneData,
          flyingStarAnalysis: basicFortune.flyingStarAnalysis,
          baziTimeliness: basicFortune.baziTimeliness,
          creditsUsed: MONTHLY_FORTUNE_CREDITS,
          generatedAt: new Date(),
          metadata: {
            aiModel,
            generationTimeMs: basicFortune.metadata.generationTimeMs || 0,
            aiCostUSD,
            generationMethod: 'manual',
          },
          updatedAt: new Date(),
        })
        .where(eq(monthlyFortunes.id, fortuneId));

      return {
        success: true,
        fortuneId,
        message: `${year}年${month}月运势生成成功`,
      };
    } catch (generationError) {
      // 生成失败，回滚
      console.error('月度运势生成失败:', generationError);

      // 标记为失败状态
      await db
        .update(monthlyFortunes)
        .set({
          status: 'failed',
          updatedAt: new Date(),
        })
        .where(eq(monthlyFortunes.id, fortuneId));

      // 不扣积分（因为还没扣）

      return {
        success: false,
        error: 'GENERATION_FAILED',
        message: '运势生成失败，请稍后重试',
      };
    }
  } catch (error) {
    console.error('generateMonthlyFortuneAction error:', error);

    return {
      success: false,
      error: 'INTERNAL_ERROR',
      message: '系统错误，请联系客服',
    };
  }
}

// ==================== 辅助函数 ====================

/**
 * 获取用户积分余额
 */
async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  const { user } = await import('@/db/schema');
  const userList = await db
    .select({ credits: user.credits })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userList[0]?.credits || 0;
}

/**
 * 扣除积分（带事务保护）
 */
async function deductCredits(
  userId: string,
  amount: number,
  fortuneId: string
): Promise<void> {
  const db = await getDb();
  await db.transaction(async (tx) => {
    // 1. 扣除用户积分
    await tx.execute(
      `UPDATE "user" SET credits = credits - ${amount} WHERE id = '${userId}'`
    );

    // 2. 记录积分交易
    await tx.insert(creditTransaction).values({
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'MONTHLY_FORTUNE_PURCHASE', // 新增交易类型
      description: `生成月度运势 - ${fortuneId}`,
      amount: -amount,
      metadata: {
        fortuneId,
        feature: 'monthly_fortune',
      },
    });
  });
}

// ==================== 查询函数 ====================

/**
 * 获取用户的月度运势列表
 */
export async function getMyMonthlyFortunes(options?: {
  year?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    year: number;
    month: number;
    status: string;
    overallScore: number;
    luckyDirections: string[];
    luckyColors: string[];
    luckyNumbers: number[];
    generatedAt: Date | null;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        data: [],
      };
    }

    const userId = session.user.id;
    const { year, limit = 12 } = options || {};

    const db = await getDb();
    let query = db.select().from(monthlyFortunes);

    if (year) {
      query = query.where(
        and(eq(monthlyFortunes.userId, userId), eq(monthlyFortunes.year, year))
      ) as any;
    } else {
      query = query.where(eq(monthlyFortunes.userId, userId)) as any;
    }

    const fortunes = await query.limit(limit);

    return {
      success: true,
      data: fortunes.map((f) => ({
        id: f.id,
        year: f.year,
        month: f.month,
        status: f.status,
        overallScore: (f.fortuneData as any)?.overallScore || 0,
        luckyDirections: (f.fortuneData as any)?.luckyDirections || [],
        luckyColors: (f.fortuneData as any)?.luckyColors || [],
        luckyNumbers: (f.fortuneData as any)?.luckyNumbers || [],
        generatedAt: f.generatedAt,
        createdAt: f.createdAt,
      })),
    };
  } catch (error) {
    console.error('getMyMonthlyFortunes error:', error);
    return {
      success: false,
      error: 'INTERNAL_ERROR',
      data: [],
    };
  }
}

/**
 * 获取特定月度运势详情
 */
export async function getMonthlyFortuneById(fortuneId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await getSession();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'UNAUTHORIZED',
    };
  }

  const db = await getDb();
  const fortuneList = await db
    .select()
    .from(monthlyFortunes)
    .where(
      and(
        eq(monthlyFortunes.id, fortuneId),
        eq(monthlyFortunes.userId, session.user.id)
      )
    )
    .limit(1);
  const fortune = fortuneList[0];

  if (!fortune) {
    return {
      success: false,
      error: 'NOT_FOUND',
    };
  }

  return {
    success: true,
    data: fortune,
  };
}

// ==================== 导出 ====================

export type { GenerateMonthlyFortuneInput, GenerateMonthlyFortuneResult };
