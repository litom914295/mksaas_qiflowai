import type {
  ConversationContext,
  ConversationDomainSnapshot,
  ConversationMessage,
  ConversationMetadata,
  ConversationPreferences,
  ConversationStateType,
  ConversationUserProfile,
} from './types/conversation';

export interface ConversationSessionState {
  sessionId: string;
  userId: string;
  locale?: string;
  currentState: ConversationStateType;
  context: ConversationContext;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMemoryAdapter {
  load(
    sessionId: string,
    userId: string
  ): Promise<ConversationSessionState | null>;
  persist(state: ConversationSessionState): Promise<void>;
  reset(sessionId: string, userId: string): Promise<void>;
}

const DEFAULT_PREFERENCES: ConversationPreferences = {
  language: 'zh-CN',
  responseStyle: 'concise',
  culturalBackground: 'mainland',
};

const DEFAULT_USER_PROFILE: ConversationUserProfile = {
  expertise: 'beginner',
  preferences: DEFAULT_PREFERENCES,
};

const buildInitialMetadata = (timestamp: string): ConversationMetadata => ({
  totalMessages: 0,
  sessionDuration: 0,
  lastActivity: timestamp,
  analysisCount: 0,
});

export const createEmptyConversationContext = (params: {
  sessionId: string;
  userId?: string;
  locale?: string;
  initialTopic?: string;
  userProfile?: ConversationUserProfile;
}): ConversationContext => {
  const timestamp = new Date().toISOString();

  return {
    sessionId: params.sessionId,
    userId: params.userId,
    messages: [],
    currentTopic: params.initialTopic ?? 'general',
    userProfile: params.userProfile ?? DEFAULT_USER_PROFILE,
    contextStack: [],
    metadata: buildInitialMetadata(timestamp),
    topicTags: [],
  };
};

export const createEmptySessionState = (params: {
  sessionId: string;
  userId: string;
  locale?: string;
  initialState: ConversationStateType;
  context?: ConversationContext;
}): ConversationSessionState => {
  const context =
    params.context ??
    createEmptyConversationContext({
      sessionId: params.sessionId,
      userId: params.userId,
      locale: params.locale,
    });

  const timestamp = new Date().toISOString();

  return {
    sessionId: params.sessionId,
    userId: params.userId,
    locale: params.locale,
    currentState: params.initialState,
    context,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const appendMessageToContext = (
  context: ConversationContext,
  message: ConversationMessage
): ConversationContext => {
  const messages = [...context.messages, message];
  const firstTimestamp = messages[0]?.timestamp ?? message.timestamp;
  const sessionDuration = Math.max(
    context.metadata.sessionDuration,
    Math.floor(
      (new Date(message.timestamp).getTime() -
        new Date(firstTimestamp).getTime()) /
        1000
    )
  );

  return {
    ...context,
    messages,
    metadata: {
      ...context.metadata,
      totalMessages: messages.length,
      lastActivity: message.timestamp,
      sessionDuration: Number.isFinite(sessionDuration)
        ? sessionDuration
        : context.metadata.sessionDuration,
      analysisCount:
        message.metadata?.analysisType === 'bazi' ||
        message.metadata?.analysisType === 'fengshui'
          ? context.metadata.analysisCount + 1
          : context.metadata.analysisCount,
      traceId: message.metadata?.traceId ?? context.metadata.traceId,
    },
  };
};

export const upsertDomainSnapshot = (
  current: ConversationDomainSnapshot | undefined,
  updates: Partial<ConversationDomainSnapshot>
): ConversationDomainSnapshot => ({
  ...current,
  ...updates,
  lastUpdatedAt: updates.lastUpdatedAt ?? new Date().toISOString(),
});

export const mergeTopicTags = (
  current: string[] | undefined,
  next: string[] | undefined
): string[] | undefined => {
  if (!next || next.length === 0) {
    return current;
  }
  const combined = new Set<string>(current ?? []);
  next.forEach(tag => combined.add(tag));
  return Array.from(combined);
};

class InMemoryConversationMemory implements ConversationMemoryAdapter {
  private readonly store = new Map<string, ConversationSessionState>();

  async load(
    sessionId: string,
    userId: string
  ): Promise<ConversationSessionState | null> {
    const key = this.buildKey(sessionId, userId);
    const state = this.store.get(key);
    return state ? this.cloneState(state) : null;
  }

  async persist(state: ConversationSessionState): Promise<void> {
    const key = this.buildKey(state.sessionId, state.userId);
    this.store.set(
      key,
      this.cloneState({ ...state, updatedAt: new Date().toISOString() })
    );
  }

  async reset(sessionId: string, userId: string): Promise<void> {
    const key = this.buildKey(sessionId, userId);
    this.store.delete(key);
  }

  private buildKey(sessionId: string, userId: string): string {
    return `${sessionId}::${userId}`;
  }

  private cloneState(
    state: ConversationSessionState
  ): ConversationSessionState {
    return {
      ...state,
      context: {
        ...state.context,
        messages: state.context.messages.map(message => ({
          ...message,
          metadata: message.metadata ? { ...message.metadata } : undefined,
        })),
        contextStack: state.context.contextStack.map(entry => ({ ...entry })),
        metadata: { ...state.context.metadata },
        domainSnapshot: state.context.domainSnapshot
          ? { ...state.context.domainSnapshot }
          : undefined,
        topicTags: state.context.topicTags
          ? [...state.context.topicTags]
          : undefined,
        userProfile: {
          ...state.context.userProfile,
          preferences: { ...state.context.userProfile.preferences },
          baziData: state.context.userProfile.baziData
            ? { ...state.context.userProfile.baziData }
            : undefined,
          fengshuiData: state.context.userProfile.fengshuiData
            ? { ...state.context.userProfile.fengshuiData }
            : undefined,
        },
      },
    };
  }
}

export { InMemoryConversationMemory };
