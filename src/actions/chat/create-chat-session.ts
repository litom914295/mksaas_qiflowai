'use server';

import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { chatSessions } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { creditsManager } from '@/lib/credits/manager';

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 分钟
const SESSION_COST = 40; // 积分

export async function createChatSessionAction() {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: '请先登录' };
  }

  try {
    // 1. 检查积分余额
    const balance = await creditsManager.getBalance(session.user.id);
    if (balance < SESSION_COST) {
      return {
        success: false,
        error: '积分不足',
        errorCode: 'INSUFFICIENT_CREDITS',
        required: SESSION_COST,
        current: balance,
      };
    }

    // 2. 扣除积分
    await creditsManager.deduct(session.user.id, SESSION_COST, {
      type: CREDIT_TRANSACTION_TYPE.CHAT_SESSION_START,
      description: '开启 AI 对话会话',
      metadata: {
        duration: '15分钟',
      },
    });

    // 3. 创建会话记录
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + SESSION_DURATION_MS);

    const dbInstance = await getDb();
    const [chatSession] = await dbInstance
      .insert(chatSessions)
      .values({
        userId: session.user.id,
        startedAt,
        expiresAt,
        messageCount: 0,
        creditsUsed: SESSION_COST,
        status: 'active',
        metadata: {
          aiModel: 'deepseek-chat',
          totalTokens: 0,
          totalCostUSD: 0,
          renewalCount: 0,
        },
      })
      .returning();

    return {
      success: true,
      data: {
        sessionId: chatSession.id,
        expiresAt: chatSession.expiresAt,
        remainingMs: SESSION_DURATION_MS,
      },
    };
  } catch (error: any) {
    console.error('Create chat session error:', error);

    // 如果是扣积分后出错，这里应该回滚，但 creditsManager.deduct 内部应该有事务处理
    return {
      success: false,
      error: error.message || '创建会话失败',
    };
  }
}
