import { getDb } from '@/db';
import { taskProgress, user, baziCalculations, shareRecords } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { addCredits } from '@/credits/credits';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';

// 新手任务定义
export const NEWBIE_MISSIONS = [
  {
    id: 'complete_profile',
    title: '完善个人资料',
    description: '设置头像和昵称',
    reward: 20,
    target: 1,
    taskType: 'ONETIME', // 一次性任务
    checkProgress: async (userId: string) => {
      const db = await getDb();
      const userInfo = await db
        .select({ name: user.name, image: user.image })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      if (userInfo.length === 0) return 0;
      
      const hasName = !!userInfo[0].name && userInfo[0].name !== '用户';
      const hasAvatar = !!userInfo[0].image;
      
      return hasName && hasAvatar ? 1 : 0;
    },
  },
  {
    id: 'first_bazi_analysis',
    title: '首次八字分析',
    description: '完成第一次八字命理分析',
    reward: 30,
    target: 1,
    taskType: 'ONETIME',
    checkProgress: async (userId: string) => {
      const db = await getDb();
      const result = await db
        .select({ count: count() })
        .from(baziCalculations)
        .where(eq(baziCalculations.userId, userId));
      
      return Math.min(result[0]?.count || 0, 1);
    },
  },
  {
    id: 'bind_social_account',
    title: '绑定社交账号',
    description: '绑定微信或其他社交账号',
    reward: 15,
    target: 1,
    taskType: 'ONETIME',
    checkProgress: async (userId: string) => {
      const db = await getDb();
      // 检查 account 表是否有社交登录记录
      const { account } = await import('@/db/schema');
      const socialAccounts = await db
        .select({ providerId: account.providerId })
        .from(account)
        .where(
          and(
            eq(account.userId, userId),
            // 排除 credential（邮箱密码登录）
            // 社交登录的 providerId 通常是 google, github 等
          )
        );
      
      // 如果有除了 credential 之外的账号，说明绑定了社交账号
      const hasSocialAccount = socialAccounts.some(
        (acc) => acc.providerId !== 'credential'
      );
      
      return hasSocialAccount ? 1 : 0;
    },
  },
  {
    id: 'invite_friend',
    title: '邀请好友注册',
    description: '邀请1位好友成功注册',
    reward: 50,
    target: 1,
    taskType: 'ONETIME',
    checkProgress: async (userId: string) => {
      const db = await getDb();
      const { referralRelationships } = await import('@/db/schema');
      const referrals = await db
        .select({ count: count() })
        .from(referralRelationships)
        .where(
          and(
            eq(referralRelationships.referrerId, userId),
            eq(referralRelationships.status, 'activated')
          )
        );
      
      return Math.min(referrals[0]?.count || 0, 1);
    },
  },
  {
    id: 'share_analysis',
    title: '分享分析结果',
    description: '分享一次分析结果到社交平台',
    reward: 15,
    target: 1,
    taskType: 'ONETIME',
    checkProgress: async (userId: string) => {
      const db = await getDb();
      const shares = await db
        .select({ count: count() })
        .from(shareRecords)
        .where(eq(shareRecords.userId, userId));
      
      return Math.min(shares[0]?.count || 0, 1);
    },
  },
] as const;

/**
 * 获取用户的新手任务进度
 */
export async function getUserNewbieMissions(userId: string) {
  'use server';
  const db = await getDb();
  
  // 获取数据库中已存在的任务进度
  const existingProgress = await db
    .select()
    .from(taskProgress)
    .where(
      and(
        eq(taskProgress.userId, userId),
        eq(taskProgress.taskType, 'NEWBIE')
      )
    );
  
  const progressMap = new Map(
    existingProgress.map((p) => [p.taskId, p])
  );
  
  // 检查所有任务的实际进度
  const missions = await Promise.all(
    NEWBIE_MISSIONS.map(async (mission) => {
      let dbProgress = progressMap.get(mission.id);
      
      // 检查实际进度
      const actualProgress = await mission.checkProgress(userId);
      
      // 如果数据库没有记录，创建一个
      if (!dbProgress && actualProgress > 0) {
        const [newProgress] = await db
          .insert(taskProgress)
          .values({
            userId,
            taskId: mission.id,
            taskType: 'NEWBIE',
            progress: actualProgress,
            target: mission.target,
            completed: actualProgress >= mission.target,
            completedAt: actualProgress >= mission.target ? new Date() : null,
          })
          .returning();
        
        dbProgress = newProgress;
      }
      
      // 如果进度有更新，更新数据库
      if (dbProgress && actualProgress > dbProgress.progress) {
        const completed = actualProgress >= mission.target;
        
        await db
          .update(taskProgress)
          .set({
            progress: actualProgress,
            completed,
            completedAt: completed ? new Date() : dbProgress.completedAt,
            updatedAt: new Date(),
          })
          .where(eq(taskProgress.id, dbProgress.id));
        
        dbProgress.progress = actualProgress;
        dbProgress.completed = completed;
      }
      
      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        reward: mission.reward,
        progress: dbProgress?.progress || actualProgress,
        target: mission.target,
        completed: dbProgress?.completed || actualProgress >= mission.target,
        rewardClaimed: dbProgress?.rewardClaimed || false,
      };
    })
  );
  
  const completed = missions.filter((m) => m.completed).length;
  const total = missions.length;
  const progressPercentage = Math.round((completed / total) * 100);
  
  return {
    missions,
    completed,
    total,
    progress: progressPercentage,
  };
}

/**
 * 领取任务奖励
 */
export async function claimMissionReward(userId: string, missionId: string) {
  'use server';
  const db = await getDb();
  
  // 查找任务配置
  const missionConfig = NEWBIE_MISSIONS.find((m) => m.id === missionId);
  if (!missionConfig) {
    return { success: false, error: '任务不存在' };
  }
  
  // 查找任务进度
  const [progress] = await db
    .select()
    .from(taskProgress)
    .where(
      and(
        eq(taskProgress.userId, userId),
        eq(taskProgress.taskId, missionId),
        eq(taskProgress.taskType, 'NEWBIE')
      )
    )
    .limit(1);
  
  if (!progress) {
    return { success: false, error: '任务未完成' };
  }
  
  if (!progress.completed) {
    return { success: false, error: '任务未完成' };
  }
  
  if (progress.rewardClaimed) {
    return { success: false, error: '奖励已领取' };
  }
  
  // 发放奖励
  await addCredits({
    userId,
    amount: missionConfig.reward,
    type: CREDIT_TRANSACTION_TYPE.TASK_REWARD,
    description: `新手任务奖励：${missionConfig.title}`,
  });
  
  // 标记为已领取
  await db
    .update(taskProgress)
    .set({
      rewardClaimed: true,
      updatedAt: new Date(),
    })
    .where(eq(taskProgress.id, progress.id));
  
  return {
    success: true,
    reward: missionConfig.reward,
    message: `恭喜获得 ${missionConfig.reward} 积分！`,
  };
}
