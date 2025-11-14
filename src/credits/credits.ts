import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import { getDb } from '@/db';
import { creditTransaction, userCredit } from '@/db/schema';
import { logCreditsChange } from '@/lib/audit-log';
import { findPlanByPlanId, findPlanByPriceId } from '@/lib/price-plan';
import { add, isAfter } from 'date-fns';
import { and, asc, eq, gt, isNull, not, or, sql } from 'drizzle-orm';
import { CREDIT_TRANSACTION_TYPE } from './types';

/**
 * Get user's current credit balance
 * @param userId - User ID
 * @returns User's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const db = await getDb();

    // Optimized query: only select the needed field
    // This can benefit from covering index if we add one later
    const record = await db
      .select({ currentCredits: userCredit.currentCredits })
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);

    return record[0]?.currentCredits || 0;
  } catch (error) {
    console.error('getUserCredits, error:', error);
    // Return 0 on error to prevent UI from breaking
    return 0;
  }
}

/**
 * Update user's current credit balance
 * @param userId - User ID
 * @param credits - New credit balance
 */
export async function updateUserCredits(userId: string, credits: number) {
  try {
    const db = await getDb();
    await db
      .update(userCredit)
      .set({ currentCredits: credits, updatedAt: new Date() })
      .where(eq(userCredit.userId, userId));
  } catch (error) {
    console.error('updateUserCredits, error:', error);
  }
}

/**
 * Write a credit transaction record
 * @param params - Credit transaction parameters
 */
export async function saveCreditTransaction({
  userId,
  type,
  amount,
  description,
  paymentId,
  expirationDate,
}: {
  userId: string;
  type: string;
  amount: number;
  description: string;
  paymentId?: string;
  expirationDate?: Date;
}) {
  if (!userId || !type || !description) {
    console.error(
      'saveCreditTransaction, invalid params',
      userId,
      type,
      description
    );
    throw new Error('saveCreditTransaction, invalid params');
  }
  if (!Number.isFinite(amount) || amount === 0) {
    console.error('saveCreditTransaction, invalid amount', userId, amount);
    throw new Error('saveCreditTransaction, invalid amount');
  }
  const db = await getDb();
  await db.insert(creditTransaction).values({
    id: randomUUID(),
    userId,
    type,
    amount,
    // remaining amount is the same as amount for earn transactions
    // remaining amount is null for spend transactions
    remainingAmount: amount > 0 ? amount : null,
    description,
    paymentId,
    expirationDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Refund credits with validation and limits
 * @param params - Refund parameters
 */
export async function refundCredits({
  userId,
  amount,
  reason,
  originalTransactionId,
  metadata,
}: {
  userId: string;
  amount: number;
  reason: string;
  originalTransactionId?: string;
  metadata?: Record<string, any>;
}) {
  if (!userId || !reason) {
    console.error('refundCredits, invalid params', userId, reason);
    throw new Error('Invalid refund parameters');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    console.error('refundCredits, invalid amount', userId, amount);
    throw new Error('Invalid refund amount');
  }

  const db = await getDb();
  const now = new Date();

  // 1. Check refund time limit (24 hours)
  if (originalTransactionId) {
    const original = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.id, originalTransactionId))
      .limit(1);

    if (original.length === 0) {
      throw new Error('Original transaction not found');
    }

    const transactionTime = original[0]?.createdAt;
    if (transactionTime) {
      const hoursSinceTransaction =
        (now.getTime() - transactionTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceTransaction > 24) {
        console.warn(
          `refundCredits, transaction too old (${hoursSinceTransaction.toFixed(1)}h), userId: ${userId}`
        );
        throw new Error('Refund window expired (24 hours limit)');
      }
    }
  }

  // 2. Check for duplicate refund
  if (originalTransactionId) {
    const existingRefund = await db
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.REFUND),
          sql`${creditTransaction.description} LIKE ${'%' + originalTransactionId + '%'}`
        )
      )
      .limit(1);

    if (existingRefund.length > 0) {
      console.warn(
        `refundCredits, duplicate refund detected, userId: ${userId}, originalTransactionId: ${originalTransactionId}`
      );
      throw new Error('Credits already refunded for this transaction');
    }
  }

  // 3. Perform refund using addCredits
  const description = originalTransactionId
    ? `Refund: ${reason} (Transaction: ${originalTransactionId})`
    : `Refund: ${reason}`;

  await addCredits({
    userId,
    amount,
    type: CREDIT_TRANSACTION_TYPE.REFUND,
    description,
    paymentId: originalTransactionId,
  });

  console.log(
    `refundCredits, successfully refunded ${amount} credits for user ${userId}, reason: ${reason}`
  );

  // 4. Enhanced audit log with refund metadata
  try {
    await logCreditsChange({
      userId,
      amount,
      type: 'refund',
      description,
      metadata: {
        transactionType: CREDIT_TRANSACTION_TYPE.REFUND,
        reason,
        originalTransactionId,
        refundedAt: now.toISOString(),
        ...metadata,
      },
    });
  } catch (error) {
    console.error('Failed to log credit refund:', error);
  }
}

/**
 * Add credits (registration, monthly, purchase, etc.)
 * Uses database transaction to prevent race conditions
 * @param params - Credit creation parameters
 */
export async function addCredits({
  userId,
  amount,
  type,
  description,
  paymentId,
  expireDays,
}: {
  userId: string;
  amount: number;
  type: string;
  description: string;
  paymentId?: string;
  expireDays?: number;
}) {
  if (!userId || !type || !description) {
    console.error('addCredits, invalid params', userId, type, description);
    throw new Error('Invalid params');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    console.error('addCredits, invalid amount', userId, amount);
    throw new Error('Invalid amount');
  }
  if (
    expireDays !== undefined &&
    (!Number.isFinite(expireDays) || expireDays < 0)
  ) {
    console.error('addCredits, invalid expire days', userId, expireDays);
    throw new Error('Invalid expire days');
  }

  const db = await getDb();
  const now = new Date();
  const expirationDate =
    expireDays && expireDays > 0 ? add(now, { days: expireDays }) : undefined;

  // Use database transaction to ensure atomicity
  await db.transaction(async (tx) => {
    // 1. Lock user credit record for update
    const current = await tx
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .for('update') // Pessimistic lock
      .limit(1);

    // 2. Update or insert user credit balance
    if (current.length > 0) {
      const newBalance = (current[0]?.currentCredits || 0) + amount;
      console.log('addCredits, update user credit', userId, newBalance);
      await tx
        .update(userCredit)
        .set({
          currentCredits: newBalance,
          updatedAt: now,
        })
        .where(eq(userCredit.userId, userId));
    } else {
      const newBalance = amount;
      console.log('addCredits, insert user credit', userId, newBalance);
      await tx.insert(userCredit).values({
        id: randomUUID(),
        userId,
        currentCredits: newBalance,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 3. Write credit transaction record
    await tx.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      type,
      amount,
      remainingAmount: amount, // For earn transactions, remaining equals amount
      description,
      paymentId,
      expirationDate,
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(
    `addCredits, successfully added ${amount} credits for user ${userId}`
  );

  // Audit log
  try {
    await logCreditsChange({
      userId,
      amount,
      type: 'add',
      description,
      metadata: { transactionType: type, paymentId, expireDays },
    });
  } catch (error) {
    console.error('Failed to log credit addition:', error);
  }
}

/**
 * Check if user has enough credits
 * @param userId - User ID
 * @param requiredCredits - Required credits
 */
export async function hasEnoughCredits({
  userId,
  requiredCredits,
}: {
  userId: string;
  requiredCredits: number;
}) {
  const balance = await getUserCredits(userId);
  return balance >= requiredCredits;
}

/**
 * Consume credits (FIFO, by expiration)
 * Uses database transaction with pessimistic locking to prevent race conditions
 * @param params - Credit consumption parameters
 */
export async function consumeCredits({
  userId,
  amount,
  description,
}: {
  userId: string;
  amount: number;
  description: string;
}) {
  if (!userId || !description) {
    console.error('consumeCredits, invalid params', userId, description);
    throw new Error('Invalid params');
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    console.error('consumeCredits, invalid amount', userId, amount);
    throw new Error('Invalid amount');
  }

  const db = await getDb();
  const now = new Date();

  // Use database transaction with pessimistic locking
  await db.transaction(async (tx) => {
    // 1. Lock user credit record for update (pessimistic lock)
    const currentCredit = await tx
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .for('update') // SELECT ... FOR UPDATE - prevents concurrent modifications
      .limit(1);

    const currentBalance = currentCredit[0]?.currentCredits || 0;

    // 2. Check balance inside transaction
    if (currentBalance < amount) {
      console.error(
        `consumeCredits, insufficient credits for user ${userId}, current: ${currentBalance}, required: ${amount}`
      );
      throw new Error('Insufficient credits');
    }

    // 3. Lock and fetch available credit transactions (FIFO by expiration)
    const transactions = await tx
      .select()
      .from(creditTransaction)
      .where(
        and(
          eq(creditTransaction.userId, userId),
          // Exclude usage and expire records
          not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.USAGE)),
          not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.EXPIRE)),
          // Only include transactions with remaining amount > 0
          gt(creditTransaction.remainingAmount, 0),
          // Only include unexpired credits
          or(
            isNull(creditTransaction.expirationDate),
            gt(creditTransaction.expirationDate, now)
          )
        )
      )
      .orderBy(
        asc(creditTransaction.expirationDate),
        asc(creditTransaction.createdAt)
      )
      .for('update'); // Lock selected transactions for update

    // 4. Consume credits (FIFO)
    let remainingToDeduct = amount;
    for (const transaction of transactions) {
      if (remainingToDeduct <= 0) break;
      const remainingAmount = transaction.remainingAmount || 0;
      if (remainingAmount <= 0) continue;

      const deductFromThis = Math.min(remainingAmount, remainingToDeduct);
      await tx
        .update(creditTransaction)
        .set({
          remainingAmount: remainingAmount - deductFromThis,
          updatedAt: now,
        })
        .where(eq(creditTransaction.id, transaction.id));

      remainingToDeduct -= deductFromThis;
    }

    // 5. Update user credit balance
    const newBalance = currentBalance - amount;
    await tx
      .update(userCredit)
      .set({ currentCredits: newBalance, updatedAt: now })
      .where(eq(userCredit.userId, userId));

    // 6. Write usage record
    await tx.insert(creditTransaction).values({
      id: randomUUID(),
      userId,
      type: CREDIT_TRANSACTION_TYPE.USAGE,
      amount: -amount,
      remainingAmount: null, // Usage records don't have remaining amount
      description,
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(
    `consumeCredits, successfully consumed ${amount} credits for user ${userId}`
  );

  // Audit log
  try {
    await logCreditsChange({
      userId,
      amount,
      type: 'consume',
      description,
      metadata: { transactionType: 'USAGE' },
    });
  } catch (error) {
    console.error('Failed to log credit consumption:', error);
  }
}

/**
 * Process expired credits
 * @param userId - User ID
 * @deprecated This function is no longer used, see distribute.ts instead
 */
export async function processExpiredCredits(userId: string) {
  const now = new Date();
  // Get all credit transactions that can expire (have expirationDate and not yet processed)
  const db = await getDb();
  const transactions = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        // Exclude usage and expire records (these are consumption/expiration logs)
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.USAGE)),
        not(eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.EXPIRE)),
        // Only include transactions with expirationDate set
        not(isNull(creditTransaction.expirationDate)),
        // Only include transactions not yet processed for expiration
        isNull(creditTransaction.expirationDateProcessedAt),
        // Only include transactions with remaining amount > 0
        gt(creditTransaction.remainingAmount, 0)
      )
    );
  let expiredTotal = 0;
  // Process expired credit transactions
  for (const transaction of transactions) {
    if (
      transaction.expirationDate &&
      isAfter(now, transaction.expirationDate) &&
      !transaction.expirationDateProcessedAt
    ) {
      const remain = transaction.remainingAmount || 0;
      if (remain > 0) {
        expiredTotal += remain;
        await db
          .update(creditTransaction)
          .set({
            remainingAmount: 0,
            expirationDateProcessedAt: now,
            updatedAt: now,
          })
          .where(eq(creditTransaction.id, transaction.id));
      }
    }
  }
  if (expiredTotal > 0) {
    // Deduct expired credits from balance
    const current = await db
      .select()
      .from(userCredit)
      .where(eq(userCredit.userId, userId))
      .limit(1);
    const newBalance = Math.max(
      0,
      (current[0]?.currentCredits || 0) - expiredTotal
    );
    await db
      .update(userCredit)
      .set({ currentCredits: newBalance, updatedAt: now })
      .where(eq(userCredit.userId, userId));
    // Write expire record
    await saveCreditTransaction({
      userId,
      type: CREDIT_TRANSACTION_TYPE.EXPIRE,
      amount: -expiredTotal,
      description: `Expire credits: ${expiredTotal}`,
    });

    console.log(
      `processExpiredCredits, ${expiredTotal} credits expired for user ${userId}`
    );
  }
}

/**
 * Check if specific type of credits can be added for a user based on transaction history
 * @param userId - User ID
 * @param creditType - Type of credit transaction to check
 */
export async function canAddCreditsByType(userId: string, creditType: string) {
  const db = await getDb();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Check if user has already received this type of credits this month
  const existingTransaction = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        eq(creditTransaction.type, creditType),
        // Check if transaction was created in the current month and year
        sql`EXTRACT(MONTH FROM ${creditTransaction.createdAt}) = ${currentMonth + 1}`,
        sql`EXTRACT(YEAR FROM ${creditTransaction.createdAt}) = ${currentYear}`
      )
    )
    .limit(1);

  return existingTransaction.length === 0;
}

/**
 * Check if subscription credits can be added for a user based on last refresh time
 * @param userId - User ID
 */

/**
 * Add register gift credits
 * @param userId - User ID
 */
export async function addRegisterGiftCredits(userId: string) {
  // 本地开发可通过环境变量跳过积分数据库操作，避免阻塞登录
  if (process.env.DISABLE_CREDITS_DB === 'true') {
    console.warn(
      '[credits] skipped addRegisterGiftCredits due to DISABLE_CREDITS_DB=true'
    );
    return;
  }
  // Check if user has already received register gift credits
  const db = await getDb();
  const record = await db
    .select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        eq(creditTransaction.type, CREDIT_TRANSACTION_TYPE.REGISTER_GIFT)
      )
    )
    .limit(1);

  // add register gift credits if user has not received them yet
  if (record.length === 0) {
    const credits = websiteConfig.credits.registerGiftCredits.amount;
    const expireDays = websiteConfig.credits.registerGiftCredits.expireDays;
    await addCredits({
      userId,
      amount: credits,
      type: CREDIT_TRANSACTION_TYPE.REGISTER_GIFT,
      description: `Register gift credits: ${credits}`,
      expireDays,
    });

    console.log(
      `addRegisterGiftCredits, ${credits} credits for user ${userId}`
    );
  }
}

/**
 * Add free monthly credits
 * @param userId - User ID
 * @param planId - Plan ID
 */
export async function addMonthlyFreeCredits(userId: string, planId: string) {
  // NOTICE: make sure the free plan is not disabled and has credits enabled
  const pricePlan = findPlanByPlanId(planId);
  if (
    !pricePlan ||
    pricePlan.disabled ||
    !pricePlan.isFree ||
    !pricePlan.credits ||
    !pricePlan.credits.enable
  ) {
    console.log(
      `addMonthlyFreeCredits, no credits configured for plan ${planId}`
    );
    return;
  }

  const canAdd = await canAddCreditsByType(
    userId,
    CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH
  );
  const now = new Date();

  // add credits if it's a new month
  if (canAdd) {
    const credits = pricePlan.credits?.amount || 0;
    const expireDays = pricePlan.credits?.expireDays || 0;
    await addCredits({
      userId,
      amount: credits,
      type: CREDIT_TRANSACTION_TYPE.MONTHLY_REFRESH,
      description: `Free monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expireDays,
    });

    console.log(
      `addMonthlyFreeCredits, ${credits} credits for user ${userId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  } else {
    console.log(
      `addMonthlyFreeCredits, no new month for user ${userId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  }
}

/**
 * Add subscription credits
 * @param userId - User ID
 * @param priceId - Price ID
 */
export async function addSubscriptionCredits(userId: string, priceId: string) {
  // NOTICE: the price plan maybe disabled, but we still need to add credits for existing users
  const pricePlan = findPlanByPriceId(priceId);
  if (
    !pricePlan ||
    // pricePlan.disabled ||
    !pricePlan.credits ||
    !pricePlan.credits.enable
  ) {
    console.log(
      `addSubscriptionCredits, no credits configured for plan ${priceId}`
    );
    return;
  }

  const canAdd = await canAddCreditsByType(
    userId,
    CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL
  );
  const now = new Date();

  // Add credits if it's a new month
  if (canAdd) {
    const credits = pricePlan.credits.amount;
    const expireDays = pricePlan.credits.expireDays;

    await addCredits({
      userId,
      amount: credits,
      type: CREDIT_TRANSACTION_TYPE.SUBSCRIPTION_RENEWAL,
      description: `Subscription renewal credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expireDays,
    });

    console.log(
      `addSubscriptionCredits, ${credits} credits for user ${userId}, priceId: ${priceId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  } else {
    console.log(
      `addSubscriptionCredits, no new month for user ${userId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  }
}

/**
 * Add lifetime monthly credits
 * @param userId - User ID
 * @param priceId - Price ID
 */
export async function addLifetimeMonthlyCredits(
  userId: string,
  priceId: string
) {
  // NOTICE: make sure the lifetime plan is not disabled and has credits enabled
  const pricePlan = findPlanByPriceId(priceId);
  if (
    !pricePlan ||
    !pricePlan.isLifetime ||
    pricePlan.disabled ||
    !pricePlan.credits ||
    !pricePlan.credits.enable
  ) {
    console.log(
      `addLifetimeMonthlyCredits, no credits configured for plan ${priceId}`
    );
    return;
  }

  const canAdd = await canAddCreditsByType(
    userId,
    CREDIT_TRANSACTION_TYPE.LIFETIME_MONTHLY
  );
  const now = new Date();

  // Add credits if it's a new month
  if (canAdd) {
    const credits = pricePlan.credits.amount;
    const expireDays = pricePlan.credits.expireDays;

    await addCredits({
      userId,
      amount: credits,
      type: CREDIT_TRANSACTION_TYPE.LIFETIME_MONTHLY,
      description: `Lifetime monthly credits: ${credits} for ${now.getFullYear()}-${now.getMonth() + 1}`,
      expireDays,
    });

    console.log(
      `addLifetimeMonthlyCredits, ${credits} credits for user ${userId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  } else {
    console.log(
      `addLifetimeMonthlyCredits, no new month for user ${userId}, date: ${now.getFullYear()}-${now.getMonth() + 1}`
    );
  }
}
