"use server";

import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

export async function endChatSessionAction(sessionId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "请先登录" };
  }

  try {
    const [chatSession] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));

    if (!chatSession) {
      return { success: false, error: "会话不存在" };
    }

    if (chatSession.userId !== session.user.id) {
      return { success: false, error: "无权操作" };
    }

    await db
      .update(chatSessions)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(chatSessions.id, sessionId));

    return { success: true };
  } catch (error: any) {
    console.error("End chat session error:", error);
    return { success: false, error: error.message || "结束会话失败" };
  }
}
