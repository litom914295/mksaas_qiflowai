/**
 * 数据同步脚本：将 Prisma user.credits 同步到 Drizzle user_credit.current_credits
 *
 * 使用场景：
 * 1. 修复现有数据不一致问题
 * 2. 管理员通过 Prisma 添加的积分同步到统一的积分系统
 *
 * 使用方法：
 * npm run sync-credits                              # 同步所有用户
 * npm run sync-credits -- --email demo@example.com # 同步特定用户
 * npm run sync-credits -- --userId abc123          # 同步特定用户ID
 * npm run sync-credits -- --dry-run                # 预览模式，不实际执行
 */

import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../src/db';
import { creditTransaction, user, userCredit } from '../src/db/schema';

interface SyncOptions {
  email?: string;
  userId?: string;
  dryRun?: boolean;
}

interface SyncResult {
  userId: string;
  email: string | null;
  prismaCredits: number;
  userCreditBalance: number;
  needsSync: boolean;
  syncAmount: number;
  success?: boolean;
  error?: string;
}

async function syncCreditsToUserCredit(options: SyncOptions = {}) {
  console.log('========================================');
  console.log('积分数据同步工具');
  console.log(
    '从 user.credits (Prisma) 同步到 user_credit.current_credits (Drizzle)'
  );
  console.log('========================================\n');

  try {
    const db = await getDb();
    console.log('✅ 数据库连接成功\n');

    // 根据参数构建查询条件
    let whereClause: ReturnType<typeof eq> | undefined;
    if (options.userId) {
      whereClause = eq(user.id, options.userId);
      console.log(`🎯 指定用户ID: ${options.userId}`);
    } else if (options.email) {
      whereClause = eq(user.email, options.email);
      console.log(`🎯 指定用户邮箱: ${options.email}`);
    } else {
      console.log('🔍 同步所有用户');
    }

    // 查询需要同步的用户（只查询有 credits 字段的用户）
    // 注意：这里假设你的 user 表有 credits 字段
    console.log('步骤 1: 查找需要同步的用户...');

    const usersQuery = `
      SELECT u.id, u.email, u.name, u.credits as prisma_credits,
             uc.current_credits as user_credit_balance
      FROM "user" u 
      LEFT JOIN user_credit uc ON u.id = uc.user_id
      ${
        options.userId
          ? `WHERE u.id = '${options.userId}'`
          : options.email
            ? `WHERE u.email = '${options.email}'`
            : ''
      } 
      ORDER BY u.created_at DESC
      LIMIT 500
    `;

    const result = await db.execute({ sql: usersQuery, args: [] });
    const usersToSync = result.rows as any[];

    console.log(`找到 ${usersToSync.length} 个用户\n`);

    if (usersToSync.length === 0) {
      console.log('没有找到需要同步的用户');
      return;
    }

    // 分析需要同步的数据
    console.log('步骤 2: 分析数据差异...');
    const syncResults: SyncResult[] = [];

    for (const userData of usersToSync) {
      const prismaCredits = Number.parseInt(userData.prisma_credits) || 0;
      const userCreditBalance =
        Number.parseInt(userData.user_credit_balance) || 0;
      const syncAmount = prismaCredits - userCreditBalance;
      const needsSync = syncAmount !== 0;

      syncResults.push({
        userId: userData.id,
        email: userData.email,
        prismaCredits,
        userCreditBalance,
        needsSync,
        syncAmount,
      });

      if (needsSync) {
        console.log(`📊 ${userData.email || userData.id}:`);
        console.log(`   Prisma积分: ${prismaCredits}`);
        console.log(`   UserCredit积分: ${userCreditBalance}`);
        console.log(`   需要同步: ${syncAmount > 0 ? '+' : ''}${syncAmount}`);
      }
    }

    const needsSyncUsers = syncResults.filter((r) => r.needsSync);
    console.log(
      `\n需要同步的用户: ${needsSyncUsers.length}/${syncResults.length}\n`
    );

    if (needsSyncUsers.length === 0) {
      console.log('✅ 所有用户的积分数据已同步，无需操作');
      return;
    }

    if (options.dryRun) {
      console.log('🔍 预览模式 - 不会实际执行同步操作');
      console.log('\n需要同步的用户:');
      needsSyncUsers.forEach((user) => {
        console.log(
          `  ${user.email}: ${user.syncAmount > 0 ? '+' : ''}${user.syncAmount} 积分`
        );
      });
      return;
    }

    // 执行同步
    console.log('步骤 3: 执行数据同步...');

    for (const syncItem of needsSyncUsers) {
      try {
        if (syncItem.syncAmount > 0) {
          // 需要增加积分到 user_credit
          await addCreditsToUserCredit(
            db,
            syncItem.userId,
            syncItem.syncAmount,
            '数据同步：从Prisma导入'
          );
        } else if (syncItem.syncAmount < 0) {
          // 需要减少 user_credit 中的积分（不常见，但处理一下）
          await reduceCreditsFromUserCredit(
            db,
            syncItem.userId,
            Math.abs(syncItem.syncAmount),
            '数据同步：调整为Prisma值'
          );
        }

        syncItem.success = true;
        console.log(
          `✅ ${syncItem.email}: 同步成功 (${syncItem.syncAmount > 0 ? '+' : ''}${syncItem.syncAmount})`
        );
      } catch (error) {
        syncItem.success = false;
        syncItem.error = (error as Error).message;
        console.error(`❌ ${syncItem.email}: 同步失败 - ${syncItem.error}`);
      }
    }

    // 汇总结果
    const successCount = needsSyncUsers.filter((r) => r.success).length;
    const failCount = needsSyncUsers.filter((r) => !r.success).length;

    console.log('\n========================================');
    console.log('同步完成:');
    console.log('========================================');
    console.log(`✅ 成功: ${successCount} 个用户`);
    if (failCount > 0) {
      console.log(`❌ 失败: ${failCount} 个用户`);
    }
    console.log(
      `📊 总计同步积分: ${needsSyncUsers.filter((r) => r.success).reduce((sum, r) => sum + r.syncAmount, 0)}`
    );
  } catch (error) {
    console.error('❌ 同步失败:', error);
    if (error instanceof Error) {
      console.error('错误详情:', error.message);
    }
    throw error;
  }
}

// 辅助函数：添加积分到 user_credit 表
async function addCreditsToUserCredit(
  db: any,
  userId: string,
  amount: number,
  description: string
) {
  // 检查是否已有 user_credit 记录
  const existing = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    // 创建新的 user_credit 记录
    await db.insert(userCredit).values({
      id: `ucr_sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      currentCredits: amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    // 更新现有记录
    await db
      .update(userCredit)
      .set({
        currentCredits: existing[0].currentCredits + amount,
        updatedAt: new Date(),
      })
      .where(eq(userCredit.userId, userId));
  }

  // 记录交易日志
  await db.insert(creditTransaction).values({
    id: `txn_sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    userId,
    type: 'DATA_SYNC',
    amount: amount,
    remainingAmount: amount,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// 辅助函数：减少 user_credit 中的积分
async function reduceCreditsFromUserCredit(
  db: any,
  userId: string,
  amount: number,
  description: string
) {
  const existing = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    const newBalance = Math.max(0, existing[0].currentCredits - amount);
    await db
      .update(userCredit)
      .set({
        currentCredits: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(userCredit.userId, userId));

    // 记录交易日志
    await db.insert(creditTransaction).values({
      id: `txn_sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      type: 'DATA_SYNC',
      amount: -amount,
      remainingAmount: null,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// 解析命令行参数
function parseArgs(): SyncOptions {
  const args = process.argv.slice(2);
  const options: SyncOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--email':
        options.email = args[++i];
        break;
      case '--userId':
      case '--user-id':
        options.userId = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  return options;
}

// 运行脚本
const options = parseArgs();
syncCreditsToUserCredit(options)
  .then(() => {
    console.log('\n🎉 数据同步完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('数据同步异常:', error);
    process.exit(1);
  });
