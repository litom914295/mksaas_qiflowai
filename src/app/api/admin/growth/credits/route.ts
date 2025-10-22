import { getDb } from '@/db';
import { creditTransaction, user, userCredit } from '@/db/schema';
import { and, desc, eq, gt, lt } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 验证schema
const creditTransactionSchema = z.object({
  userId: z.string(),
  amount: z.number(),
  type: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// 获取积分交易记录 - 暂时保留模拟数据供前端使用
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'transactions';
    const userId = searchParams.get('userId');
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');

    if (type === 'transactions') {
      // 从数据库获取真实交易记录（使用统一的数据源）
      const db = await getDb();
      console.log(
        `[管理员接口] 获取交易记录, userId=${userId}, page=${page}, limit=${limit}`
      );

      let transactionsQuery = db
        .select({
          id: creditTransaction.id,
          userId: creditTransaction.userId,
          type: creditTransaction.type,
          description: creditTransaction.description,
          amount: creditTransaction.amount,
          remainingAmount: creditTransaction.remainingAmount,
          paymentId: creditTransaction.paymentId,
          expirationDate: creditTransaction.expirationDate,
          createdAt: creditTransaction.createdAt,
          updatedAt: creditTransaction.updatedAt,
          userName: user.name,
          userEmail: user.email,
          userCredits: userCredit.currentCredits,
        })
        .from(creditTransaction)
        .leftJoin(user, eq(creditTransaction.userId, user.id))
        .leftJoin(userCredit, eq(creditTransaction.userId, userCredit.userId))
        .orderBy(desc(creditTransaction.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      // 如果指定了用户ID，添加过滤条件
      if (userId) {
        transactionsQuery = transactionsQuery.where(
          eq(creditTransaction.userId, userId)
        );
      }

      const transactions = await transactionsQuery;

      // 获取总数（简化版本，实际生产环境可能需要更精确的count）
      let countQuery = db
        .select({ count: creditTransaction.id })
        .from(creditTransaction);
      if (userId) {
        countQuery = countQuery.where(eq(creditTransaction.userId, userId));
      }
      const countResult = await countQuery;
      const total = countResult.length;

      // 格式化数据以匹配前端预期
      const formattedTransactions = transactions.map((tx) => ({
        id: tx.id,
        userId: tx.userId,
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        remainingAmount: tx.remainingAmount,
        paymentId: tx.paymentId,
        expirationDate: tx.expirationDate,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        user: {
          id: tx.userId,
          name: tx.userName || 'Unknown',
          email: tx.userEmail || '',
          credits: tx.userCredits || 0,
        },
      }));

      return NextResponse.json({
        success: true,
        data: {
          transactions: formattedTransactions,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }

    if (type === 'balance') {
      // 获取用户余额统计（使用统一的数据源）
      const db = await getDb();
      console.log('[管理员接口] 获取用户余额统计');

      // 获取有积分记录的用户
      const usersWithCredits = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          credits: userCredit.currentCredits,
          updatedAt: userCredit.updatedAt,
        })
        .from(user)
        .leftJoin(userCredit, eq(user.id, userCredit.userId))
        .orderBy(desc(userCredit.currentCredits))
        .limit(100); // 限制返回数量，避免数据过多

      const balances = await Promise.all(
        usersWithCredits.map(async (userData) => {
          // 获取收入交易总额
          const earnedResult = await db
            .select({ sum: creditTransaction.amount })
            .from(creditTransaction)
            .where(
              and(
                eq(creditTransaction.userId, userData.id),
                gt(creditTransaction.amount, 0)
              )
            );

          const totalEarned = earnedResult.reduce(
            (sum, row) => sum + (row.sum || 0),
            0
          );

          // 获取支出交易总额
          const spentResult = await db
            .select({ sum: creditTransaction.amount })
            .from(creditTransaction)
            .where(
              and(
                eq(creditTransaction.userId, userData.id),
                lt(creditTransaction.amount, 0)
              )
            );

          const totalSpent = Math.abs(
            spentResult.reduce((sum, row) => sum + (row.sum || 0), 0)
          );

          // 获取最后一笔交易时间
          const lastTransactionResult = await db
            .select({ createdAt: creditTransaction.createdAt })
            .from(creditTransaction)
            .where(eq(creditTransaction.userId, userData.id))
            .orderBy(desc(creditTransaction.createdAt))
            .limit(1);

          return {
            userId: userData.id,
            userName: userData.name || 'Unknown',
            balance: userData.credits || 0, // 从 user_credit 表获取真实余额
            totalEarned,
            totalSpent,
            lastTransaction:
              lastTransactionResult[0]?.createdAt?.toISOString() || null,
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: { balances },
      });
    }

    if (type === 'config') {
      // 返回积分配置(暂时使用硬编码配置)
      const config = {
        tasks: [
          { taskId: 'signup', name: '新用户注册', credits: 100, enabled: true },
          {
            taskId: 'first_invite',
            name: '首次邀请',
            credits: 50,
            enabled: true,
          },
          {
            taskId: 'daily_login',
            name: '每日签到',
            credits: 2,
            enabled: true,
            dailyLimit: 1,
          },
          {
            taskId: 'share_content',
            name: '分享内容',
            credits: 3,
            enabled: true,
            dailyLimit: 3,
          },
        ],
        settings: {
          creditName: '积分',
          creditSymbol: '💎',
        },
      };

      return NextResponse.json({
        success: true,
        data: config,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching credits data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credits data' },
      { status: 500 }
    );
  }
}

// 创建积分交易
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = creditTransactionSchema.parse(body);

    console.log(`[管理员接口] 创建积分交易:`, validatedData);

    // 使用统一的积分系统
    if (validatedData.amount > 0) {
      // 增加积分
      const { addCredits } = await import('@/credits/credits');
      await addCredits({
        userId: validatedData.userId,
        amount: validatedData.amount,
        type: validatedData.type,
        description:
          validatedData.description ||
          `API创建积分交易: +${validatedData.amount}`,
        expireDays: 365, // 默认1年有效期
      });
    } else {
      // 扣减积分
      const { consumeCredits } = await import('@/credits/credits');
      await consumeCredits({
        userId: validatedData.userId,
        amount: Math.abs(validatedData.amount),
        description:
          validatedData.description ||
          `API创建积分交易: ${validatedData.amount}`,
      });
    }

    // 获取更新后的余额
    const { getUserCredits } = await import('@/credits/credits');
    const newBalance = await getUserCredits(validatedData.userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Transaction created successfully',
        data: {
          userId: validatedData.userId,
          amount: validatedData.amount,
          type: validatedData.type,
          description: validatedData.description,
          newBalance,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating transaction:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Failed to create transaction',
      },
      { status: 500 }
    );
  }
}

// 批量调整积分
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, amount, reason } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid user IDs' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    console.log(
      `[管理员接口] 批量调整积分: ${userIds.length} 个用户, 金额: ${amount}`
    );

    // 使用统一的积分系统批量调整
    const { addCredits, consumeCredits } = await import('@/credits/credits');
    const { CREDIT_TRANSACTION_TYPE } = await import('@/credits/types');

    const results = [];
    for (const userId of userIds) {
      try {
        if (amount > 0) {
          // 增加积分
          await addCredits({
            userId,
            amount,
            type: CREDIT_TRANSACTION_TYPE.MANUAL_ADJUSTMENT,
            description: reason || `管理员批量增加 ${amount} 积分`,
            expireDays: 365,
          });
        } else {
          // 扣减积分
          await consumeCredits({
            userId,
            amount: Math.abs(amount),
            description: reason || `管理员批量扣减 ${Math.abs(amount)} 积分`,
          });
        }
        results.push({ userId, success: true });
      } catch (error) {
        console.error(`批量调整积分失败, userId: ${userId}`, error);
        results.push({
          userId,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: successCount > 0,
      message: `Successfully adjusted credits for ${successCount}/${userIds.length} users`,
      data: {
        totalUsers: userIds.length,
        successCount,
        failCount,
        totalAmount: amount * successCount,
        results,
      },
    });
  } catch (error) {
    console.error('Error adjusting credits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to adjust credits' },
      { status: 500 }
    );
  }
}
