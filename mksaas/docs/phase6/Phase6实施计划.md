# Phase 6 实施计划 - Chat 会话制改造

**目标**: 将 Chat 从无限对话改为 15 分钟会话制 (40 积分/次)  
**预计耗时**: 8 小时  
**优先级**: 高

---

## 🎯 改造目标

### 1. 15 分钟会话机制
- ✅ Schema 已存在 (`chatSessions` 表)
- ⏳ 会话创建与初始化
- ⏳ 倒计时显示
- ⏳ 自动过期检查
- ⏳ 续费功能

### 2. 积分计费
- ⏳ 会话创建时扣除 40 积分
- ⏳ 续费时扣除额外 40 积分
- ⏳ 余额不足提示
- ⏳ 积分交易记录

### 3. 会话状态管理
- ⏳ `active` - 活跃中 (可发送消息)
- ⏳ `expired` - 已过期 (需续费)
- ⏳ `completed` - 主动结束
- ⏳ `renewed` - 已续费

### 4. 用户体验优化
- ⏳ 倒计时提醒 (5 分钟、1 分钟)
- ⏳ 过期后消息禁止发送
- ⏳ 续费/结束会话按钮
- ⏳ 会话历史查看

---

## 📋 实施步骤

### Step 1: 会话管理 Action (2 小时)

#### 1.1 创建会话 Action
**文件**: `src/actions/chat/create-chat-session.ts`

```typescript
"use server";

import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { creditsManager } from "@/credits/manager";
import { getCurrentUser } from "@/lib/session";

const SESSION_DURATION_MS = 15 * 60 * 1000; // 15 分钟
const SESSION_COST = 40; // 积分

export async function createChatSessionAction() {
  const session = await getCurrentUser();
  if (!session?.user) {
    return { success: false, error: "请先登录" };
  }

  try {
    // 1. 检查积分余额
    const balance = await creditsManager.getBalance(session.user.id);
    if (balance < SESSION_COST) {
      return {
        success: false,
        error: "积分不足",
        errorCode: "INSUFFICIENT_CREDITS",
        required: SESSION_COST,
        current: balance,
      };
    }

    // 2. 扣除积分
    await creditsManager.deduct(session.user.id, SESSION_COST, {
      type: "CHAT_SESSION_START",
      description: "开启 AI 对话会话",
      metadata: {
        duration: "15分钟",
      },
    });

    // 3. 创建会话记录
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + SESSION_DURATION_MS);

    const [chatSession] = await db
      .insert(chatSessions)
      .values({
        userId: session.user.id,
        startedAt,
        expiresAt,
        messageCount: 0,
        creditsUsed: SESSION_COST,
        status: "active",
        metadata: {
          aiModel: "deepseek-chat",
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
    console.error("Create chat session error:", error);
    return {
      success: false,
      error: error.message || "创建会话失败",
    };
  }
}
```

#### 1.2 续费会话 Action
**文件**: `src/actions/chat/renew-chat-session.ts`

```typescript
"use server";

import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { creditsManager } from "@/credits/manager";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";

const SESSION_DURATION_MS = 15 * 60 * 1000;
const RENEWAL_COST = 40;

export async function renewChatSessionAction(sessionId: string) {
  const session = await getCurrentUser();
  if (!session?.user) {
    return { success: false, error: "请先登录" };
  }

  try {
    // 1. 获取会话
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

    // 2. 检查积分余额
    const balance = await creditsManager.getBalance(session.user.id);
    if (balance < RENEWAL_COST) {
      return {
        success: false,
        error: "积分不足",
        errorCode: "INSUFFICIENT_CREDITS",
      };
    }

    // 3. 扣除积分
    await creditsManager.deduct(session.user.id, RENEWAL_COST, {
      type: "CHAT_SESSION_RENEW",
      description: "续费 AI 对话会话",
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
        status: "active",
        metadata: {
          ...chatSession.metadata,
          renewalCount: (chatSession.metadata?.renewalCount || 0) + 1,
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
    console.error("Renew chat session error:", error);
    return { success: false, error: error.message || "续费失败" };
  }
}
```

#### 1.3 结束会话 Action
**文件**: `src/actions/chat/end-chat-session.ts`

```typescript
"use server";

import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function endChatSessionAction(sessionId: string) {
  const session = await getCurrentUser();
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
```

#### 1.4 获取会话状态 Action
**文件**: `src/actions/chat/get-chat-session-status.ts`

```typescript
"use server";

import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { getCurrentUser } from "@/lib/session";
import { eq } from "drizzle-orm";

export async function getChatSessionStatusAction(sessionId: string) {
  const session = await getCurrentUser();
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

    const now = new Date();
    const remainingMs = Math.max(0, chatSession.expiresAt.getTime() - now.getTime());
    const isExpired = remainingMs === 0 && chatSession.status === "active";

    // 如果已过期，自动更新状态
    if (isExpired) {
      await db
        .update(chatSessions)
        .set({ status: "expired", updatedAt: now })
        .where(eq(chatSessions.id, sessionId));
    }

    return {
      success: true,
      data: {
        sessionId: chatSession.id,
        status: isExpired ? "expired" : chatSession.status,
        expiresAt: chatSession.expiresAt,
        remainingMs,
        messageCount: chatSession.messageCount,
        creditsUsed: chatSession.creditsUsed,
      },
    };
  } catch (error: any) {
    console.error("Get chat session status error:", error);
    return { success: false, error: error.message || "获取会话状态失败" };
  }
}
```

---

### Step 2: 会话倒计时组件 (2 小时)

#### 2.1 倒计时组件
**文件**: `src/components/chat/session-timer.tsx`

```typescript
"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type SessionTimerProps = {
  expiresAt: Date;
  onExpire: () => void;
  onRenew: () => void;
  isRenewing?: boolean;
};

export function SessionTimer({
  expiresAt,
  onExpire,
  onRenew,
  isRenewing = false,
}: SessionTimerProps) {
  const { toast } = useToast();
  const [remainingMs, setRemainingMs] = useState(0);
  const [hasNotified5Min, setHasNotified5Min] = useState(false);
  const [hasNotified1Min, setHasNotified1Min] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const expiresMs = new Date(expiresAt).getTime();
      const remaining = Math.max(0, expiresMs - now);
      setRemainingMs(remaining);

      // 过期检查
      if (remaining === 0) {
        onExpire();
        return;
      }

      // 5 分钟提醒
      if (remaining <= 5 * 60 * 1000 && remaining > 4 * 60 * 1000 && !hasNotified5Min) {
        toast({
          title: "会话即将到期",
          description: "您的会话将在 5 分钟后到期，请及时续费",
        });
        setHasNotified5Min(true);
      }

      // 1 分钟提醒
      if (remaining <= 1 * 60 * 1000 && remaining > 59 * 1000 && !hasNotified1Min) {
        toast({
          title: "会话即将到期",
          description: "您的会话将在 1 分钟后到期",
          variant: "destructive",
        });
        setHasNotified1Min(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, hasNotified5Min, hasNotified1Min, onExpire, toast]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  const isWarning = remainingMs <= 5 * 60 * 1000 && remainingMs > 1 * 60 * 1000;
  const isDanger = remainingMs <= 1 * 60 * 1000 && remainingMs > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <Badge
          variant={isDanger ? "destructive" : isWarning ? "secondary" : "default"}
          className="font-mono"
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </Badge>
      </div>

      {isWarning && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>会话即将到期</span>
            <Button
              size="sm"
              onClick={onRenew}
              disabled={isRenewing}
            >
              {isRenewing ? "续费中..." : "续费 (40 积分)"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isDanger && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>会话即将到期！</span>
            <Button
              size="sm"
              variant="destructive"
              onClick={onRenew}
              disabled={isRenewing}
            >
              {isRenewing ? "续费中..." : "立即续费"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

---

### Step 3: 集成到 Chat Interface (2 小时)

修改 `src/components/chat/enhanced-chat-interface.tsx`:

1. 添加会话状态检查
2. 集成倒计时组件
3. 过期后禁用输入
4. 续费功能集成

---

### Step 4: 会话创建流程 (2 小时)

#### 4.1 Chat 入口页面
**文件**: `app/(routes)/chat/page.tsx`

```typescript
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ChatSessionStarter } from "@/components/chat/chat-session-starter";

export default async function ChatPage() {
  const session = await getCurrentUser();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container py-8">
      <ChatSessionStarter userId={session.user.id} />
    </div>
  );
}
```

#### 4.2 会话启动组件
**文件**: `src/components/chat/chat-session-starter.tsx`

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles } from "lucide-react";
import { createChatSessionAction } from "@/actions/chat/create-chat-session";
import { useToast } from "@/hooks/use-toast";

export function ChatSessionStarter({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  async function handleStartSession() {
    setIsCreating(true);

    try {
      const result = await createChatSessionAction();

      if (!result.success) {
        if (result.errorCode === "INSUFFICIENT_CREDITS") {
          toast({
            title: "积分不足",
            description: "您的积分余额不足，请先充值",
            variant: "destructive",
          });
          router.push("/credits/buy");
          return;
        }

        toast({
          title: "创建会话失败",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "会话已创建",
        description: "开始与 AI 大师对话吧",
      });

      router.push(`/chat/${result.data.sessionId}`);
    } catch (error) {
      console.error("Start session error:", error);
      toast({
        title: "系统错误",
        description: "创建会话失败，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          开启 AI 八字风水对话
        </CardTitle>
        <CardDescription>
          与 AI 大师进行深度对话，获取个性化命理分析与建议
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>会话时长：15 分钟</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>费用：40 积分/次</span>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• 15 分钟内无限次对话</li>
          <li>• 可随时续费延长时间</li>
          <li>• 支持上传图片与文件</li>
          <li>• 获得个性化分析建议</li>
        </ul>

        <Button
          onClick={handleStartSession}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? "创建中..." : "开始对话 (40 积分)"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 📊 验收标准

| 标准 | 检查项 |
|------|--------|
| ✅ 会话创建 | 扣除 40 积分，创建会话记录 |
| ✅ 倒计时显示 | 实时显示剩余时间 |
| ✅ 过期提醒 | 5 分钟、1 分钟提醒 |
| ✅ 自动过期 | 15 分钟后自动过期 |
| ✅ 续费功能 | 支付 40 积分延长 15 分钟 |
| ✅ 消息禁用 | 过期后禁止发送消息 |
| ✅ 会话结束 | 主动结束会话 |
| ✅ 交易记录 | 记录积分扣除 |

---

## 🔄 下一步 (Phase 7)

- RAG 知识库集成
- 向量化与检索
- 知识引用展示

---

**文档生成时间**: 2025-01-12 02:00 UTC+8  
**Phase 6 状态**: ⏳ 待开始  
**预计耗时**: 8 小时
