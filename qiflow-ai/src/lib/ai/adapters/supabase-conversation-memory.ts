import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  ConversationMemoryAdapter,
  ConversationSessionState,
} from '../conversation-memory';

interface ConversationStateRow {
  session_id: string;
  user_id: string;
  current_state: string;
  context_stack: unknown;
  topic_graph: unknown;
  metadata: unknown;
  payload: ConversationSessionState;
  updated_at: string;
}

const TABLE_NAME = 'conversation_states';

let cachedClient: SupabaseClient | null = null;

const getClient = (): SupabaseClient => {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      '[SupabaseConversationMemory] 缺少 Supabase 配置，无法初始化。'
    );
  }

  cachedClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  return cachedClient;
};

export class SupabaseConversationMemory implements ConversationMemoryAdapter {
  private resolveClient(): SupabaseClient {
    return getClient();
  }

  async load(
    sessionId: string,
    userId: string
  ): Promise<ConversationSessionState | null> {
    const client = this.resolveClient();
    const { data, error } = await client
      .from(TABLE_NAME)
      .select('payload')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single<Pick<ConversationStateRow, 'payload'>>();

    if (error) {
      console.error('[SupabaseConversationMemory] load error', error);
      return null;
    }

    return data?.payload ?? null;
  }

  async persist(state: ConversationSessionState): Promise<void> {
    const client = this.resolveClient();
    const now = new Date().toISOString();

    const { error } = await client.from(TABLE_NAME).upsert(
      {
        session_id: state.sessionId,
        user_id: state.userId,
        current_state: state.currentState,
        context_stack: state.context.contextStack,
        topic_graph: state.context.topicTags ?? [],
        metadata: state.context.metadata,
        payload: state,
        updated_at: now,
      },
      {
        onConflict: 'session_id,user_id',
      }
    );

    if (error) {
      console.error('[SupabaseConversationMemory] persist error', error);
    }
  }

  async reset(sessionId: string, userId: string): Promise<void> {
    const client = this.resolveClient();
    const { error } = await client
      .from(TABLE_NAME)
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.error('[SupabaseConversationMemory] reset error', error);
    }
  }
}
