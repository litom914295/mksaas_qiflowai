import { websiteConfig } from '@/config/website';
import { addCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import {
  achievements,
  baziCalculations,
  fengshuiAnalysis,
  pdfAudit,
  referralRelationships,
} from '@/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { incrementTaskProgress } from './task-progress';

/**
 * Try mark user as "activated" and distribute referral rewards (if any pending).
 * Activation rules (either):
 *  A) Has at least 1 bazi calculation AND at least 1 fengshui analysis
 *  B) Has at least 1 pdf export audit AND chat rounds >= 3 (task_id = 'ai_chat_rounds')
 */
export async function tryMarkActivation(userId: string) {
  const db = await getDb();

  // 1) Quick check: if there is no referral relation for this user, skip
  const rel = await db
    .select({
      id: referralRelationships.id,
      referrerId: referralRelationships.referrerId,
      rewardGranted: referralRelationships.rewardGranted,
      status: referralRelationships.status,
    })
    .from(referralRelationships)
    .where(eq(referralRelationships.refereeId, userId))
    .limit(1);

  if (rel.length === 0) return { activated: false, rewarded: false };
  const relation = rel[0];
  if (relation.rewardGranted) return { activated: true, rewarded: true }; // already rewarded

  // 2) Evaluate activation conditions
  const [baziAny] = await db
    .select({ id: baziCalculations.id })
    .from(baziCalculations)
    .where(eq(baziCalculations.userId, userId))
    .limit(1);

  const [fengshuiAny] = await db
    .select({ id: fengshuiAnalysis.id })
    .from(fengshuiAnalysis)
    .where(eq(fengshuiAnalysis.userId, userId))
    .limit(1);

  const [pdfAny] = await db
    .select({ id: pdfAudit.id })
    .from(pdfAudit)
    .where(eq(pdfAudit.userId, userId))
    .limit(1);

  // Read chat rounds from task_progress
  const tp = await db
    .select({
      progress: (await import('@/db/schema')).taskProgress.progress,
      id: (await import('@/db/schema')).taskProgress.id,
    })
    .from((await import('@/db/schema')).taskProgress)
    .where(
      and(
        eq((await import('@/db/schema')).taskProgress.userId, userId),
        eq((await import('@/db/schema')).taskProgress.taskId, 'ai_chat_rounds')
      )
    )
    .limit(1);
  const chatRounds = tp[0]?.progress ?? 0;

  const conditionA = !!baziAny && !!fengshuiAny;
  const conditionB = !!pdfAny && chatRounds >= 3;

  if (!conditionA && !conditionB) return { activated: false, rewarded: false };

  // 3) Mark relation active if needed
  if (relation.status !== 'active') {
    await db
      .update(referralRelationships)
      .set({ status: 'active', activatedAt: new Date() })
      .where(eq(referralRelationships.id, relation.id));
  }

  // 4) Distribute referral rewards (once) with caps
  const refCfg = websiteConfig.credits.referral || {
    inviterCredits: 15,
    inviteeCredits: 20,
    requireActivation: true,
  };

  // Caps: 推荐奖励3次/日、40次/月（基于已激活且已发放）
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0
  );

  const dailyCountRows = await db
    .select({
      c: (await import('drizzle-orm')).sql<number>`count(*)`,
    })
    .from(referralRelationships)
    .where(
      and(
        eq(referralRelationships.referrerId, relation.referrerId!),
        eq(referralRelationships.rewardGranted, true),
        gte(referralRelationships.activatedAt as any, startOfDay as any)
      )
    );
  const monthlyCountRows = await db
    .select({
      c: (await import('drizzle-orm')).sql<number>`count(*)`,
    })
    .from(referralRelationships)
    .where(
      and(
        eq(referralRelationships.referrerId, relation.referrerId!),
        eq(referralRelationships.rewardGranted, true),
        gte(referralRelationships.activatedAt as any, startOfMonth as any)
      )
    );
  const dailyCount = Number((dailyCountRows as any)[0]?.c || 0);
  const monthlyCount = Number((monthlyCountRows as any)[0]?.c || 0);

  const DAILY_CAP = 3;
  const MONTHLY_CAP = 40;
  if (dailyCount >= DAILY_CAP || monthlyCount >= MONTHLY_CAP) {
    // 达到上限，不发放，保留 rewardGranted=false，待后续人工或次月处理
    return { activated: true, rewarded: false };
  }

  await addCredits({
    userId: relation.referrerId!,
    amount: refCfg.inviterCredits,
    type: CREDIT_TRANSACTION_TYPE.REFERRAL_REWARD,
    description: '推荐奖励（推荐人）',
  });
  await addCredits({
    userId,
    amount: refCfg.inviteeCredits,
    type: CREDIT_TRANSACTION_TYPE.REFERRAL_REWARD,
    description: '推荐奖励（被推荐人）',
  });
  await db
    .update(referralRelationships)
    .set({ rewardGranted: true })
    .where(eq(referralRelationships.id, relation.id));

  // Optional: mark an achievement flag so we can prevent reprocessing by other systems
  const existsAch = await db
    .select({ id: achievements.id })
    .from(achievements)
    .where(
      and(
        eq(achievements.userId, userId),
        eq(achievements.achievementId, 'activation_rewarded')
      )
    )
    .limit(1);
  if (existsAch.length === 0) {
    await db.insert(achievements).values({
      userId,
      achievementId: 'activation_rewarded',
      achievementName: 'activation_rewarded',
      rewardAmount: 0,
    });
  }

  return { activated: true, rewarded: true };
}

/**
 * Record one chat round and attempt activation.
 */
export async function recordChatRoundAndTryActivate(userId: string) {
  await incrementTaskProgress({
    userId,
    taskId: 'ai_chat_rounds',
    target: 3,
    delta: 1,
  });
  return tryMarkActivation(userId);
}
