import { type SupabaseClient, createClient } from '@supabase/supabase-js';

export interface UsageRecord {
  sessionId: string;
  userId?: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  responseTimeMs: number;
  success: boolean;
  errorMessage?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

const resolveClient = (() => {
  let client: SupabaseClient | null = null;

  return (): SupabaseClient | null => {
    if (client) return client;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn(
        '[UsageTracker] Supabase credentials missing, records will not be persisted.'
      );
      return null;
    }

    client = createClient(url, serviceKey, { auth: { persistSession: false } });
    return client;
  };
})();

export class UsageTracker {
  private readonly client: SupabaseClient | null;

  constructor(client?: SupabaseClient | null) {
    this.client = typeof client === 'undefined' ? resolveClient() : client;
  }

  async record(record: UsageRecord): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const { error } = await this.client.from('ai_usage_metrics').insert({
        session_id: record.sessionId,
        user_id: record.userId ?? null,
        provider: record.provider,
        model: record.model,
        prompt_tokens: record.promptTokens,
        completion_tokens: record.completionTokens,
        total_tokens: record.totalTokens,
        cost_usd: record.costUsd,
        response_time_ms: record.responseTimeMs,
        success: record.success,
        error_message: record.errorMessage ?? null,
        metadata: record.metadata ?? null,
        trace_id: record.traceId ?? null,
      });

      if (error) {
        console.error('[UsageTracker] failed to insert usage record', error);
      }
    } catch (error) {
      console.error(
        '[UsageTracker] unexpected error while recording usage',
        error
      );
    }
  }
}
