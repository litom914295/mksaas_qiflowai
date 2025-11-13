'use server';

import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { db } from '@/db';
import { chatSessions } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { creditsManager } from '@/lib/credits/manager';
import { eq } from 'drizzle-orm';

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 分钟
const RENEWAL_COST = 40; // 积分

export async function renewChatSessionAction(sessionId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: '请先登录' };
  }

  const db = await getDb();

  try {
    // 1. 获取会话
    const [chatSession] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));

    if (!chatSession) {
      return { success: false, error: '会话不存在' };
    }

    if (chatSession.userId !== session.user.id) {
      return { success: false, error: '无权操作' };
    }

    // 2. 检查积分余额
    const balance = await creditsManager.getBalance(session.user.id);
    if (balance < RENEWAL_COST) {
      return {
        success: false,
        error: '积分不足',
        errorCode: 'INSUFFICIENT_CREDITS',
        required: RENEWAL_COST,
        current: balance,
      };
    }

    // 3. 扣除积分
    await creditsManager.deduct(session.user.id, RENEWAL_COST, {
      type: CREDIT_TRANSACTION_TYPE.CHAT_SESSION_RENEW,
      description: '续费 AI 对话会话',
      metadata: { sessionId },
    });

    // 4. 延长会话时间
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

    await db
      .update(chatSessions)
      .set({
        expiresAt: newExpiresAt,
        creditsUsed: chatSession.creditsUsed + RENEWAL_COST,
        status: 'active',
        metadata: {
          ...(chatSession.metadata as any),
          renewalCount: ((chatSession.metadata as any)?.renewalCount || 0) + 1,
        },
        updatedAt: now,
      })
      .where(eq(chatSessions.id, sessionId));

    return {
      success: true,
      data: {
        expiresAt: newExpiresAt,
        remainingMs: SESSION_DURATION_MS,
      },
    };
  } catch (error: any) {
    console.error('Renew chat session error:', error);
    return { success: false, error: error.message || '续费失败' };
  }
}
