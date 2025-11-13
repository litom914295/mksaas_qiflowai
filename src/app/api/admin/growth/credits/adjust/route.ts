import { addCredits, consumeCredits, getUserCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { AuditAction, logCreditAction } from '@/lib/audit/logAudit';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const adjustSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  reason: z.string().optional(),
});

/**
 * 调整用户积分(管理员操作)
 */
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, amount, reason } = adjustSchema.parse(body);

    // 获取用户当前余额（使用统一的数据源）
    const currentBalance = await getUserCredits(userId);
    console.log(`[管理员调整] 用户 ${userId} 当前余额: ${currentBalance}`);

    // 检查用户是否存在（简单验证）
    if (currentBalance < 0) {
      throw new Error('User not found or invalid balance');
    }

    // 如果是扣减，检查余额是否足够
    if (amount < 0 && currentBalance < Math.abs(amount)) {
      throw new Error(
        `Insufficient balance. Current: ${currentBalance}, Required: ${Math.abs(amount)}`
      );
    }

    // 使用统一的积分系统进行调整
    if (amount > 0) {
      // 增加积分
      await addCredits({
        userId,
        amount,
        type: CREDIT_TRANSACTION_TYPE.MANUAL_ADJUSTMENT || 'admin_adjust',
        description: reason || `管理员手动增加 ${amount} 积分`,
        expireDays: 365, // 管理员调整的积分1年有效期
      });
    } else {
      // 扣减积分
      await consumeCredits({
        userId,
        amount: Math.abs(amount),
        description: reason || `管理员手动扣减 ${Math.abs(amount)} 积分`,
      });
    }

    // 获取调整后的余额
    const newBalance = await getUserCredits(userId);
    console.log(`[管理员调整] 用户 ${userId} 新余额: ${newBalance}`);

    // 记录审计日志
    const adminUser = (request as any).user; // 从withAdminAuth中间件获取
    await logCreditAction({
      userId: adminUser?.id || 'unknown',
      action: AuditAction.CREDIT_ADJUST,
      targetUserId: userId,
      description: `调整用户积分: ${amount > 0 ? '+' : ''}${amount} (${reason || '无备注'})`,
      changes: {
        before: { balance: currentBalance },
        after: { balance: newBalance },
      },
      request,
    });

    return NextResponse.json({
      success: true,
      message: '积分调整成功',
      data: {
        userId,
        amount,
        oldBalance: currentBalance,
        newBalance,
        description:
          reason || (amount > 0 ? '管理员增加积分' : '管理员扣减积分'),
      },
    });
  } catch (error) {
    console.error('Error adjusting credits:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '请求参数错误',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '积分调整失败',
      },
      { status: 500 }
    );
  }
});
