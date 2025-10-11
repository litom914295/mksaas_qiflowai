import { SessionStorageService } from '../../redis/session-storage';
import type {
  ConversationMemoryAdapter,
  ConversationSessionState,
} from '../conversation-memory';

export class DualLayerMemoryCoordinator {
  constructor(
    private readonly redis,
    private readonly primary: ConversationMemoryAdapter
  ) {}

  async load(
    sessionId: string,
    userId: string
  ): Promise<ConversationSessionState | null> {
    const cacheKey = this.buildCacheKey(sessionId, userId);
    const cached = (await this.redis.getSession(
      cacheKey
    )) as ConversationSessionState | null;

    if (cached) {
      return cached;
    }

    const state = await this.primary.load(sessionId, userId);
    if (state) {
      await this.redis.saveSession(
        cacheKey,
        state as unknown as Record<string, unknown>
      );
    }

    return state;
  }

  async persist(state: ConversationSessionState): Promise<void> {
    const cacheKey = this.buildCacheKey(state.sessionId, state.userId);

    await this.primary.persist(state);
    await this.redis.saveSession(
      cacheKey,
      state as unknown as Record<string, unknown>
    );
  }

  async reset(sessionId: string, userId: string): Promise<void> {
    const cacheKey = this.buildCacheKey(sessionId, userId);

    await this.primary.reset(sessionId, userId);
    await this.redis.deleteSession(cacheKey);
  }

  private buildCacheKey(sessionId: string, userId: string): string {
    return `${sessionId}:${userId}`;
  }
}
