'use server';

import { getDb } from '@/db';
import { chatSessions } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

export async function getChatSessionStatusAction(sessionId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: '请先登录' };
  }

  try {
    const db = await getDb();
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

    const now = new Date();
    const remainingMs = Math.max(
      0,
      chatSession.expiresAt.getTime() - now.getTime()
    );
    const isExpired = remainingMs === 0 && chatSession.status === 'active';

    // 如果已过期，自动更新状态
    if (isExpired) {
      await db
        .update(chatSessions)
        .set({ status: 'expired', updatedAt: now })
        .where(eq(chatSessions.id, sessionId));
    }

    return {
      success: true,
      data: {
        sessionId: chatSession.id,
        status: isExpired ? 'expired' : chatSession.status,
        expiresAt: chatSession.expiresAt,
        remainingMs,
        messageCount: chatSession.messageCount,
        creditsUsed: chatSession.creditsUsed,
      },
    };
  } catch (error: any) {
    console.error('Get chat session status error:', error);
    return { success: false, error: error.message || '获取会话状态失败' };
  }
}
