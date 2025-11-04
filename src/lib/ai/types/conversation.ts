import type { AlgorithmExecutionResult } from '../algorithm-integration-service';

export type ConversationRole = 'user' | 'assistant' | 'system';

export type AnalysisType = 'bazi' | 'fengshui' | 'integrated';

export interface ConversationMessageMetadata {
  analysisType?: AnalysisType;
  confidence?: number;
  sources?: string[];
  tokens?: number;
  cost?: number;
  provider?: string;
  model?: string;
  traceId?: string;
  attachments?: string[];
  contextSnapshot?: Record<string, unknown>;
}

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
  metadata?: ConversationMessageMetadata;
}

export interface ConversationPreferences {
  language: string;
  responseStyle: 'concise' | 'detailed' | 'educational';
  culturalBackground: 'mainland' | 'hongkong' | 'taiwan' | 'western';
}

export interface ConversationUserProfile {
  expertise: 'beginner' | 'intermediate' | 'expert';
  preferences: ConversationPreferences;
  baziData?: Record<string, unknown>;
  fengshuiData?: Record<string, unknown>;
}

export interface ConversationContextEntry {
  topic: string;
  timestamp: string;
  summary: string;
}

export interface ConversationMetadata {
  totalMessages: number;
  sessionDuration: number;
  lastActivity: string;
  analysisCount: number;
  traceId?: string;
}

export interface ConversationDomainSnapshot {
  bazi?: AlgorithmExecutionResult;
  fengshui?: AlgorithmExecutionResult;
  lastUpdatedAt: string;
}

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  messages: ConversationMessage[];
  currentTopic: string;
  userProfile: ConversationUserProfile;
  contextStack: ConversationContextEntry[];
  metadata: ConversationMetadata;
  domainSnapshot?: ConversationDomainSnapshot;
  topicTags?: string[];
}

export type ConversationStateType =
  | 'greeting'
  | 'collecting_info'
  | 'analyzing'
  | 'explaining'
  | 'recommending'
  | 'deepdive'
  | 'closure'
  | 'expert_handoff'
  | 'error';
