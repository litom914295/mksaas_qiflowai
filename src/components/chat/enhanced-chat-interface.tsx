'use client';

import type { ConversationMessage } from '@/lib/ai/types/conversation';
import { cn } from '@/lib/utils';
import { useCallback, useMemo } from 'react';
import { AITypingIndicator } from './ai-typing-indicator';
import { ConversationContextPanel } from './context-panel';
import { ExportDialogueButton } from './export-dialogue-button';
import { ConversationInput } from './message-input';
import { ConversationMessageList } from './message-list';
import {
  RecommendationCard,
  type RecommendationAction,
} from './recommendation-card';
import { useChatSession } from './use-chat-session';

interface EnhancedChatInterfaceProps {
  sessionId: string;
  userId: string;
  className?: string;
}

const toConversationMessage = (payload: {
  id: string;
  content: string;
  timestamp: Date;
  role: 'user';
}): ConversationMessage => ({
  id: payload.id,
  role: payload.role,
  content: payload.content,
  timestamp: payload.timestamp.toISOString(),
});

export const EnhancedChatInterface = ({
  sessionId,
  userId,
  className,
}: EnhancedChatInterfaceProps) => {
  const {
    messages,
    isTyping,
    recommendations,
    favoriteMessageIds,
    context,
    sendMessage,
    sendAttachments,
    toggleFavorite,
  } = useChatSession({ sessionId, userId });

  const fengshuiPanelData = useMemo(() => {
    if (!context?.fengshui) {
      return undefined;
    }

    const { degrees, mountain, facing, cardinal, updatedAt } = context.fengshui;
    const formattedTime = new Date(updatedAt).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      方位角度: `${degrees.toFixed(1)}°`,
      当前坐山: mountain,
      当前朝向: facing,
      方位: cardinal,
      更新时间: formattedTime,
    };
  }, [context?.fengshui]);
  const recommendationActions = useMemo<RecommendationAction[]>(
    () =>
      recommendations.map(label => {
        let type: RecommendationAction['type'] = 'custom';
        if (label.includes('预约')) type = 'book_expert';
        else if (label.includes('报告')) type = 'generate_report';
        else if (label.includes('分享')) type = 'share_report';
        else if (label.includes('详细分析结果')) type = 'view_analysis' as any;
        else if (label.includes('与AI大师深入对话')) type = 'ai_chat' as any;
        return { label, type };
      }),
    [recommendations]
  );

  const handleRecommendationAction = useCallback(
    (action: RecommendationAction) => {
      switch (action.type) {
        case 'book_expert':
          sendMessage({
            id: `user-action-${Math.random().toString(36).slice(2)}`,
            role: 'user',
            content: '我想预约人工专家进一步诊断。',
            timestamp: new Date().toISOString(),
          });
          break;
        case 'generate_report':
          sendMessage({
            id: `user-action-${Math.random().toString(36).slice(2)}`,
            role: 'user',
            content: '请帮我生成风水调理建议报告。',
            timestamp: new Date().toISOString(),
          });
          break;
        case 'share_report':
          sendMessage({
            id: `user-action-${Math.random().toString(36).slice(2)}`,
            role: 'user',
            content: '希望分享当前分析结果。',
            timestamp: new Date().toISOString(),
          });
          break;
        case 'view_analysis' as any:
          // 查找最新的重定向信息
          const latestMessage = messages[messages.length - 1];
          if ((latestMessage?.metadata as any)?.redirectTo) {
            const { path, params } = (latestMessage.metadata as any).redirectTo;
            const queryString = new URLSearchParams(params).toString();
            window.open(`${path}?${queryString}`, '_blank');
          }
          break;
        case 'ai_chat' as any:
          sendMessage({
            id: `user-action-${Math.random().toString(36).slice(2)}`,
            role: 'user',
            content: '我想与AI大师进行更深入的对话。',
            timestamp: new Date().toISOString(),
          });
          break;
        default:
          sendMessage({
            id: `user-action-${Math.random().toString(36).slice(2)}`,
            role: 'user',
            content: action.label,
            timestamp: new Date().toISOString(),
          });
      }
    },
    [sendMessage, messages]
  );

  return (
    <div
      className={cn(
        'grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_320px]',
        className
      )}
    >
      <div className='flex h-full flex-col rounded-2xl border bg-card shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3'>
          <div>
            <h2 className='text-base font-semibold'>AI 八字风水大师</h2>
            <p className='text-xs text-muted-foreground'>
              输入你的出生信息或房屋情况，获取个性化建议
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <ExportDialogueButton
              messages={messages as any}
              sessionId={sessionId}
              disabled={messages.length === 0}
            />
            <AITypingIndicator visible={isTyping} />
          </div>
        </div>
        <ConversationMessageList
          messages={messages}
          favoriteMessageIds={favoriteMessageIds}
          onToggleFavorite={toggleFavorite}
          className='max-h-[50vh] lg:max-h-none'
        />
        <div className='border-t px-4 py-3'>
          <ConversationInput
            onSend={payload => sendMessage(toConversationMessage(payload))}
            onUpload={sendAttachments}
            disabled={isTyping}
          />
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <RecommendationCard
          title='快速操作'
          description='根据当前会话，您可以选择以下操作继续深入分析。'
          actions={recommendationActions}
          onAction={handleRecommendationAction}
        />
        <ConversationContextPanel
          className='hidden lg:block'
          bazi={context.bazi}
          fengshui={fengshuiPanelData}
        />
      </div>
    </div>
  );
};
