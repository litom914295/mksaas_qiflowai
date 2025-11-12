/**
 * Phase 8 Step 6: 月度运势自动生成 Cron Job
 * 
 * 功能：
 * 1. 每月 1 日凌晨 2 点自动触发
 * 2. 批量生成所有 Pro 会员的当月运势
 * 3. 失败重试机制（最多 3 次）
 * 4. 日志记录和错误监控
 * 
 * 使用方法：
 * - Vercel Cron: vercel.json 中配置
 * - 手动触发: POST /api/cron/generate-monthly-fortunes
 */

import { db } from '@/db';
import { users } from '@/db/schema';
import { generateMonthlyFortuneAction } from '@/actions/qiflow/generate-monthly-fortune';
import { eq } from 'drizzle-orm';
import type { BaziChart } from '@/lib/qiflow/bazi/types';

// ==================== 类型定义 ====================

interface CronJobResult {
  success: boolean;
  totalUsers: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: Array<{
    userId: string;
    email: string;
    error: string;
  }>;
  executionTime: number;
}

interface UserWithBazi {
  id: string;
  email: string;
  baziChart: BaziChart | null;
}

// ==================== 主函数 ====================

/**
 * 自动生成所有 Pro 会员的月度运势
 */
export async function generateMonthlyFortunesForAllProUsers(): Promise<CronJobResult> {
  const startTime = Date.now();
  
  console.log('[Cron] Starting monthly fortune generation...');
  console.log(`[Cron] Timestamp: ${new Date().toISOString()}`);

  const result: CronJobResult = {
    success: true,
    totalUsers: 0,
    successCount: 0,
    failureCount: 0,
    skippedCount: 0,
    errors: [],
    executionTime: 0,
  };

  try {
    // 1. 获取当前年月
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    console.log(`[Cron] Generating fortunes for ${currentYear}/${currentMonth}`);

    // 2. 查询所有 Pro 会员
    const proUsers = await db
      .select({
        id: users.id,
        email: users.email,
        metadata: users.metadata,
      })
      .from(users)
      .where(eq(users.subscriptionTier, 'pro'));

    result.totalUsers = proUsers.length;
    console.log(`[Cron] Found ${result.totalUsers} Pro users`);

    if (result.totalUsers === 0) {
      console.log('[Cron] No Pro users found, skipping generation');
      result.executionTime = Date.now() - startTime;
      return result;
    }

    // 3. 批量生成运势（串行处理避免 API 速率限制）
    for (const user of proUsers) {
      try {
        console.log(`[Cron] Processing user: ${user.email} (${user.id})`);

        // 3.1 获取用户的八字数据
        const baziChart = extractBaziFromMetadata(user.metadata);

        if (!baziChart) {
          console.log(`[Cron] User ${user.email} has no bazi data, skipping`);
          result.skippedCount++;
          continue;
        }

        // 3.2 调用生成函数（带重试机制）
        const generateResult = await generateFortuneWithRetry({
          userId: user.id,
          year: currentYear,
          month: currentMonth,
          baziChart,
          maxRetries: 3,
        });

        if (generateResult.success) {
          console.log(`[Cron] ✅ Success for user ${user.email}`);
          result.successCount++;
        } else {
          console.log(`[Cron] ❌ Failed for user ${user.email}: ${generateResult.error}`);
          result.failureCount++;
          result.errors.push({
            userId: user.id,
            email: user.email,
            error: generateResult.error || 'Unknown error',
          });
        }

        // 3.3 延迟 500ms 避免 API 速率限制
        await sleep(500);

      } catch (error) {
        console.error(`[Cron] Error processing user ${user.email}:`, error);
        result.failureCount++;
        result.errors.push({
          userId: user.id,
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // 4. 计算执行时间
    result.executionTime = Date.now() - startTime;

    // 5. 输出总结
    console.log('[Cron] ========== Execution Summary ==========');
    console.log(`[Cron] Total Users: ${result.totalUsers}`);
    console.log(`[Cron] Success: ${result.successCount}`);
    console.log(`[Cron] Failure: ${result.failureCount}`);
    console.log(`[Cron] Skipped: ${result.skippedCount}`);
    console.log(`[Cron] Execution Time: ${(result.executionTime / 1000).toFixed(2)}s`);
    console.log('[Cron] ==========================================');

    // 6. 如果有失败，标记为部分失败
    if (result.failureCount > 0) {
      result.success = false;
    }

  } catch (error) {
    console.error('[Cron] Fatal error during cron job execution:', error);
    result.success = false;
    result.errors.push({
      userId: 'system',
      email: 'system',
      error: error instanceof Error ? error.message : 'Unknown system error',
    });
    result.executionTime = Date.now() - startTime;
  }

  return result;
}

// ==================== 辅助函数 ====================

/**
 * 从用户 metadata 中提取八字数据
 */
function extractBaziFromMetadata(metadata: any): BaziChart | null {
  try {
    if (!metadata || typeof metadata !== 'object') {
      return null;
    }

    // 假设八字数据存储在 metadata.baziChart
    const baziChart = metadata.baziChart;

    if (!baziChart || typeof baziChart !== 'object') {
      return null;
    }

    // 基本校验
    if (
      !baziChart.year ||
      !baziChart.month ||
      !baziChart.day ||
      !baziChart.hour ||
      !baziChart.pillars
    ) {
      return null;
    }

    return baziChart as BaziChart;
  } catch (error) {
    console.error('[Cron] Error extracting bazi from metadata:', error);
    return null;
  }
}

/**
 * 带重试机制的运势生成
 */
async function generateFortuneWithRetry(params: {
  userId: string;
  year: number;
  month: number;
  baziChart: BaziChart;
  maxRetries: number;
}): Promise<{ success: boolean; error?: string }> {
  const { userId, year, month, baziChart, maxRetries } = params;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Cron] Attempt ${attempt}/${maxRetries} for user ${userId}`);

      const result = await generateMonthlyFortuneAction({
        year,
        month,
        baziChart,
        useAI: true,
      });

      if (result.success) {
        return { success: true };
      }

      // 如果是积分不足或已存在，不重试
      if (
        result.message?.includes('积分不足') ||
        result.message?.includes('已存在')
      ) {
        return { success: false, error: result.message };
      }

      // 其他错误，继续重试
      console.log(`[Cron] Attempt ${attempt} failed: ${result.message}`);

      if (attempt < maxRetries) {
        // 指数退避：1s, 2s, 4s
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        console.log(`[Cron] Retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      }

    } catch (error) {
      console.error(`[Cron] Attempt ${attempt} error:`, error);

      if (attempt === maxRetries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      // 重试前延迟
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      await sleep(delayMs);
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== 手动触发接口 ====================

/**
 * 手动触发单个用户的运势生成（用于测试）
 */
export async function generateFortuneForUser(params: {
  userId: string;
  year?: number;
  month?: number;
}): Promise<{ success: boolean; message: string }> {
  try {
    const { userId, year, month } = params;

    // 获取当前年月（如果未指定）
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    console.log(`[Manual] Generating fortune for user ${userId}: ${targetYear}/${targetMonth}`);

    // 获取用户数据
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        metadata: users.metadata,
        subscriptionTier: users.subscriptionTier,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.subscriptionTier !== 'pro') {
      return { success: false, message: 'User is not a Pro member' };
    }

    // 获取八字数据
    const baziChart = extractBaziFromMetadata(user.metadata);

    if (!baziChart) {
      return { success: false, message: 'User has no bazi data' };
    }

    // 生成运势
    const result = await generateMonthlyFortuneAction({
      year: targetYear,
      month: targetMonth,
      baziChart,
      useAI: true,
    });

    if (result.success) {
      return {
        success: true,
        message: `Fortune generated successfully for ${user.email}`,
      };
    } else {
      return {
        success: false,
        message: result.message || 'Generation failed',
      };
    }

  } catch (error) {
    console.error('[Manual] Error generating fortune:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ==================== 导出 ====================

export type { CronJobResult };
