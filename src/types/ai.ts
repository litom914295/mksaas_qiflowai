/**
 * AI 相关类型定义
 */

import type { ProviderKey } from '@/server/ai/providers';

/**
 * 聊天请求类型
 */
export interface ChatRequest {
  provider?: ProviderKey;
  model?: string;
  temperature?: number;
  messages: ChatMessage[];
  context?: Record<string, any>;
  enableContext?: boolean;
  includeReasoning?: boolean;
}

/**
 * 聊天消息类型
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * 前端消息类型（扩展版）
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  meta?: {
    reasoning?: string;
    sources?: any[];
  };
}

/**
 * 流式事件类型
 */
export type StreamEvent =
  | {
      type: 'text-delta';
      delta: string;
    }
  | {
      type: 'reasoning';
      text: string;
    }
  | {
      type: 'source' | 'tool-call';
      data: any;
    }
  | {
      type: 'error';
      message: string;
    }
  | {
      type: 'done';
    };
