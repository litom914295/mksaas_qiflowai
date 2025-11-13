/**
 * Phase 4: 报告购买 Action (积分支付)
 *
 * 流程:
 * 1. 检查积分余额
 * 2. 创建报告记录 (status: generating)
 * 3. 扣除积分
 * 4. 调用报告生成引擎
 * 5. 保存报告结果
 * 6. 失败时回滚积分
 */

'use server';

import { QIFLOW_PRICING } from '@/config/qiflow-pricing';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { creditTransaction, qiflowReports } from '@/db/schema';
import { auth } from '@/lib/auth';
import { CreditsManager } from '@/lib/credits/manager';
import {
  type EssentialReportInput,
  generateEssentialReport,
} from '@/lib/qiflow/reports/essential-report';
import { eq } from 'drizzle-orm';

/**
 * 购买结果
 */
export interface PurchaseReportResult {
  success: boolean;
  reportId?: string;
  error?: string;
  errorCode?:
    | 'UNAUTHORIZED'
    | 'INSUFFICIENT_CREDITS'
    | 'GENERATION_FAILED'
    | 'UNKNOWN';
  requiredCredits?: number;
  currentBalance?: number;
}

/**
 * 使用积分购买精华报告
 */
export async function purchaseReportWithCreditsAction(
  input: EssentialReportInput
): Promise<PurchaseReportResult> {
  // 1. 认证检查
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: '请先登录',
      errorCode: 'UNAUTHORIZED',
    };
  }

  const userId = session.user.id;
  const price = QIFLOW_PRICING.reportEssential; // 120 积分
  const creditsManager = new CreditsManager();

  try {
    // 2. 检查余额
    console.log(`[Purchase] 用户 ${userId} 购买报告，需要 ${price} 积分`);
    const balance = await creditsManager.getBalance(userId);

    if (balance < price) {
      console.log(`[Purchase] 积分不足: ${balance} < ${price}`);
      return {
        success: false,
        error: '积分不足',
        errorCode: 'INSUFFICIENT_CREDITS',
        requiredCredits: price,
        currentBalance: balance,
      };
    }

    // 3. 创建报告记录 (status: generating)
    const db = await getDb();
    const [report] = await db
      .insert(qiflowReports)
      .values({
        userId,
        reportType: 'essential',
        status: 'generating',
        input: {
          birthInfo: input.birthInfo,
          selectedThemes: input.selectedThemes,
        },
        creditsUsed: price,
        metadata: {
          purchaseMethod: 'credits',
          aiModel: 'deepseek-chat',
          generationTimeMs: 0,
          aiCostUSD: 0,
        },
      })
      .returning();

    console.log(`[Purchase] 报告记录已创建: ${report.id}`);

    // 4. 扣除积分
    const deductSuccess = await creditsManager.deduct(userId, price);
    if (!deductSuccess) {
      // 扣费失败，删除报告记录
      await db.delete(qiflowReports).where(eq(qiflowReports.id, report.id));
      throw new Error('积分扣除失败');
    }

    // 记录交易
    await db.insert(creditTransaction).values({
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: CREDIT_TRANSACTION_TYPE.REPORT_PURCHASE,
      description: `购买精华报告 - ${report.id}`,
      amount: -price,
      remainingAmount: balance - price,
    });

    console.log(`[Purchase] 积分已扣除: ${price}`);

    // 5. 生成报告 (同步，约 12 秒)
    console.log(`[Purchase] 开始生成报告...`);
    const startTime = Date.now();

    try {
      const reportOutput = await generateEssentialReport(input);

      // 6. 保存报告结果
      await db
        .update(qiflowReports)
        .set({
          status: 'completed',
          output: {
            baziData: reportOutput.baziData,
            flyingStarData: reportOutput.flyingStarData,
            themes: reportOutput.themes,
            qualityScore: reportOutput.qualityScore,
          },
          generatedAt: new Date(),
          expiresAt: null, // 终身有效
          metadata: {
            purchaseMethod: 'credits',
            aiModel: reportOutput.metadata.aiModel,
            generationTimeMs: Date.now() - startTime,
            aiCostUSD: reportOutput.metadata.aiCostUSD,
          },
        })
        .where(eq(qiflowReports.id, report.id));

      console.log(
        `[Purchase] 报告生成成功: ${report.id}, 耗时 ${Date.now() - startTime}ms`
      );

      return {
        success: true,
        reportId: report.id,
      };
    } catch (genError) {
      console.error(`[Purchase] 报告生成失败:`, genError);

      // 7. 失败回滚积分
      await creditsManager.addCredits(userId, price);

      // 记录退款交易
      await db.insert(creditTransaction).values({
        id: `txn_refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: CREDIT_TRANSACTION_TYPE.USAGE, // 或创建新类型 REFUND
        description: `报告生成失败退款 - ${report.id}`,
        amount: price,
        remainingAmount: balance,
      });

      // 更新报告状态为 failed
      await db
        .update(qiflowReports)
        .set({ status: 'failed' })
        .where(eq(qiflowReports.id, report.id));

      return {
        success: false,
        error: '报告生成失败，积分已退回',
        errorCode: 'GENERATION_FAILED',
      };
    }
  } catch (error) {
    console.error('[Purchase] 购买流程异常:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '购买失败',
      errorCode: 'UNKNOWN',
    };
  }
}

/**
 * 查询报告状态
 */
export async function getReportStatusAction(reportId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: '请先登录' };
  }

  const db = await getDb();
  const report = await db.query.qiflowReports.findFirst({
    where: (reports, { eq, and }) =>
      and(eq(reports.id, reportId), eq(reports.userId, session.user.id)),
  });

  if (!report) {
    return { error: '报告不存在' };
  }

  return {
    status: report.status,
    reportType: report.reportType,
    generatedAt: report.generatedAt,
    output: report.status === 'completed' ? report.output : null,
  };
}
