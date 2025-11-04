'use client';

import './message-list.css';

import type { ConversationMessage } from '@/lib/ai/types/conversation';
import { cn } from '@/lib/utils';

interface ConversationMessageListProps {
  messages: ConversationMessage[];
  className?: string;
  favoriteMessageIds?: string[];
  onToggleFavorite?: (messageId: string) => void;
}

const formatTimestamp = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ConversationMessageList = ({
  messages,
  className,
  favoriteMessageIds,
  onToggleFavorite,
}: ConversationMessageListProps) => {
  // 确保 messages 是数组且每个元素都是有效的 ConversationMessage
  const validMessages = Array.isArray(messages)
    ? messages.filter(
        (msg): msg is ConversationMessage =>
          msg &&
          typeof msg === 'object' &&
          typeof msg.id === 'string' &&
          typeof msg.role === 'string' &&
          typeof msg.content === 'string' &&
          typeof msg.timestamp === 'string'
      )
    : [];

  return (
    <div className={cn('flex-1 overflow-y-auto space-y-3 p-4', className)}>
      {validMessages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p>还没有对话，试着告诉 AI 大师你的八字或房屋信息吧。</p>
        </div>
      ) : (
        validMessages.map((message) => {
          const isAssistant = message.role === 'assistant';
          const isFavorite = favoriteMessageIds?.includes(message.id);

          return (
            <div
              key={message.id}
              className={cn(
                'chat-message flex flex-col gap-1 rounded-xl border p-3 shadow-sm transition',
                isAssistant
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-muted bg-card'
              )}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {isAssistant || message.role === 'system' ? 'AI 大师' : '我'}
                </span>
                <div className="flex items-center gap-3">
                  <time>{formatTimestamp(message.timestamp)}</time>
                  {onToggleFavorite && (
                    <button
                      type="button"
                      aria-label={isFavorite ? '取消收藏' : '收藏消息'}
                      className={cn(
                        'transition-colors',
                        isFavorite
                          ? 'text-yellow-500'
                          : 'text-muted-foreground hover:text-yellow-500'
                      )}
                      onClick={() => onToggleFavorite(message.id)}
                    >
                      {isFavorite ? '★' : '☆'}
                    </button>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {message.content}
              </p>
              {message.metadata?.attachments &&
                message.metadata.attachments.length > 0 && (
                  <div className="text-xs text-primary">
                    附件：{message.metadata.attachments.join('、')}
                  </div>
                )}
              {message.metadata?.analysisType && (
                <span className="self-start rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {message.metadata.analysisType === 'bazi'
                    ? '八字分析'
                    : message.metadata.analysisType === 'fengshui'
                      ? '风水分析'
                      : '综合建议'}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
