'use client';

import type { ConversationMessage } from '@/lib/ai/types/conversation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseChatSessionOptions {
  sessionId: string;
  userId: string;
}

interface SessionContextState {
  fengshui?: {
    degrees: number;
    mountain: string;
    facing: string;
    cardinal: string;
    updatedAt: string;
  };
  bazi?: Record<string, string | number>;
}

interface ChatContextEventDetail {
  sessionId: string;
  updates: SessionContextState;
}

interface UseChatSessionResult {
  messages: ConversationMessage[];
  isTyping: boolean;
  recommendations: string[];
  favoriteMessageIds: string[];
  context: SessionContextState;
  sendMessage: (message: ConversationMessage) => void;
  sendAttachments: (files: FileList) => void;
  toggleFavorite: (messageId: string) => void;
}

const createAssistantReply = (
  userMessage: ConversationMessage,
  sessionId: string,
  context: SessionContextState
): ConversationMessage => {
  const contextHint = context.fengshui
    ? `\n当前罗盘坐山：${context.fengshui.mountain}（${context.fengshui.degrees.toFixed(1)}°，${context.fengshui.cardinal}），我会结合该方位给出建议。`
    : '';

  return {
    id: `assistant-${sessionId}-${Math.random().toString(36).slice(2)}`,
    role: 'assistant',
    content: `收到你的信息了：${userMessage.content}${contextHint}\n我会根据你提供的资料继续分析。`,
    timestamp: new Date().toISOString(),
    metadata: {
      analysisType: 'integrated',
      contextSnapshot: context as any,
    },
  };
};

const defaultRecommendations = ['预约专家进一步诊断', '生成风水调理建议'];

export const useChatSession = ({
  sessionId,
  userId,
}: UseChatSessionOptions): UseChatSessionResult => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>(
    defaultRecommendations
  );
  const [favoriteMessageIds, setFavoriteMessageIds] = useState<string[]>([]);
  const [contextState, setContextState] = useState<SessionContextState>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contextRef = useRef<SessionContextState>({});

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    // 只在首次加载或sessionId真正改变时重置消息
    setMessages((prev) => {
      // 如果已经有消息且sessionId没有改变，保持现有消息
      if (prev.length > 0) {
        return prev;
      }

      // 否则初始化消息
      return [
        {
          id: `system-intro-${sessionId}`,
          role: 'system',
          content: '你好，我是 QiFlow AI 八字风水大师，请告诉我你的需求。',
          timestamp: new Date().toISOString(),
        },
      ];
    });
    setRecommendations(defaultRecommendations);
    setFavoriteMessageIds([]);
    setContextState({});
    contextRef.current = {};
  }, [sessionId, userId]);

  const toggleFavorite = useCallback((messageId: string) => {
    setFavoriteMessageIds((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  const sendMessage = useCallback(
    async (message: ConversationMessage) => {
      const enrichedMessage: ConversationMessage = {
        ...message,
        metadata: {
          ...message.metadata,
          contextSnapshot: contextRef.current as any,
        },
      };

      setMessages((prev) => [...prev, enrichedMessage]);
      setIsTyping(true);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userId,
            message: message.content,
            context: {},
            locale: 'zh-CN',
            traceId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 统一兼容多种返回结构
        // 1) /api/ai/chat: { success: true, data: { response: string, confidence?: number, redirectTo? } }
        // 2) 旧结构: { success: true, data: { reply: string | { content: string } } }
        // 3) 其他: { response: string }
        let replyContent: string | undefined;
        let confidence: number | undefined;
        let redirectTo: any | undefined;

        if (data?.success && typeof data?.data?.response === 'string') {
          replyContent = data.data.response;
          confidence = data.data.confidence;
          redirectTo = data.data.redirectTo;
        } else if (data?.success && data?.data?.reply) {
          if (typeof data.data.reply === 'string')
            replyContent = data.data.reply;
          else if (data.data.reply?.content)
            replyContent = data.data.reply.content;
          confidence = data.data.confidence;
          redirectTo = data.data.redirectTo;
        } else if (typeof data?.response === 'string') {
          replyContent = data.response;
          confidence = data.confidence;
          redirectTo = data.redirectTo;
        }

        if (!replyContent) {
          throw new Error(data?.message || 'Failed to get AI response');
        }

        const assistantReply: ConversationMessage = {
          id: `assistant-${sessionId}-${Math.random().toString(36).slice(2)}`,
          role: 'assistant',
          content: replyContent,
          timestamp: new Date().toISOString(),
          metadata: {
            analysisType: 'ai' as any,
            confidence,
          },
        };
        setMessages((prev) => [...prev, assistantReply]);

        // 如果有重定向信息，显示重定向按钮
        if (redirectTo) {
          setRecommendations([
            '查看详细分析结果',
            '与AI大师深入对话',
            '生成分享报告',
          ]);
        } else {
          setRecommendations([
            '查看八字命局详解',
            '预约线下勘察服务',
            '生成分享报告',
          ]);
        }
      } catch (error) {
        console.error('Chat API error:', error);
        // Fallback to default reply
        const assistantReply = createAssistantReply(
          enrichedMessage,
          sessionId,
          contextRef.current
        );
        setMessages((prev) => [...prev, assistantReply]);
        setRecommendations([
          '查看八字命局详解',
          '预约线下勘察服务',
          '生成分享报告',
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, userId]
  );

  const sendAttachments = useCallback(
    (files: FileList) => {
      Array.from(files).forEach((file) => {
        sendMessage({
          id: `user-upload-${sessionId}-${Math.random().toString(36).slice(2)}`,
          role: 'user',
          content: `上传附件：${file.name}`,
          timestamp: new Date().toISOString(),
          metadata: {
            attachments: [file.name],
          },
        });
      });
    },
    [sendMessage, sessionId]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleContextUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<ChatContextEventDetail>;
      const detail = customEvent.detail;
      if (!detail || detail.sessionId !== sessionId) {
        return;
      }

      setContextState((prev) => {
        const next: SessionContextState = { ...prev };
        if (detail.updates.fengshui) {
          next.fengshui = {
            ...prev.fengshui,
            ...detail.updates.fengshui,
          };
        }
        if (detail.updates.bazi) {
          next.bazi = {
            ...prev.bazi,
            ...detail.updates.bazi,
          };
        }
        contextRef.current = next;
        return next;
      });

      if (detail.updates.fengshui) {
        setRecommendations((prev) => {
          const dynamic = `聚焦${detail.updates.fengshui?.mountain}山向的调理策略`;
          const merged = Array.from(new Set([dynamic, ...prev]));
          return merged.slice(0, 3);
        });
      }
    };

    window.addEventListener(
      'qiflow-chat-context',
      handleContextUpdate as EventListener
    );
    return () =>
      window.removeEventListener(
        'qiflow-chat-context',
        handleContextUpdate as EventListener
      );
  }, [sessionId]);

  return {
    messages,
    isTyping,
    recommendations,
    favoriteMessageIds,
    context: contextState,
    sendMessage,
    sendAttachments,
    toggleFavorite,
  };
};
