import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import type { IntegratedResponse } from '../algorithm-integration-service';

export interface ConfidenceBreakdown {
  overall: number;
  dimensions: Record<string, number>;
  requiresReview: boolean;
}

export interface ConfidenceRecord {
  sessionId: string;
  analysisId?: string;
  overall: number;
  dimensions: Record<string, number>;
  requiresReview: boolean;
  explanation?: string;
  factors?: Record<string, unknown>;
  traceId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const evaluateConfidence = (
  result: IntegratedResponse
): ConfidenceBreakdown => {
  const base = result.confidence ?? 0.6;
  const completeness = result.analysis?.length ? 0.2 : -0.1;
  const cultural = result.metadata?.culturalAccuracy ?? 0.1;
  const overall = clamp(
    base + completeness + (typeof cultural === 'number' ? cultural : 0.1)
  );

  return {
    overall,
    dimensions: {
      data_quality: clamp(base),
      completeness: clamp(0.5 + completeness),
      cultural_accuracy: clamp(
        0.5 + (typeof cultural === 'number' ? cultural : 0.1)
      ),
    },
    requiresReview: overall < 0.5,
  };
};

const resolveClient = (() => {
  let client: SupabaseClient | null = null;

  return (): SupabaseClient | null => {
    if (client) {
      return client;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return null;
    }

    client = createClient(url, serviceKey, { auth: { persistSession: false } });
    return client;
  };
})();

export class ConfidenceRepository {
  private readonly client: SupabaseClient | null;

  constructor(client?: SupabaseClient | null) {
    this.client = typeof client === 'undefined' ? resolveClient() : client;
  }

  async upsert(record: ConfidenceRecord): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    if (!this.client) {
      return;
    }

    const payload = {
      conversation_id: record.sessionId,
      analysis_id: record.analysisId ?? null,
      overall_score: record.overall,
      dimension_scores: record.dimensions,
      explanation: record.explanation ?? null,
      factors: record.factors ?? null,
      requires_review: record.requiresReview,
      trace_id: record.traceId ?? null,
      metadata: record.metadata ?? null,
    };

    try {
      const { error } = await this.client
        .from('confidence_scores')
        .upsert(payload, { onConflict: 'conversation_id' });

      if (error) {
        console.error('[ConfidenceRepository] upsert failed', error);
      }
    } catch (error) {
      console.error('[ConfidenceRepository] unexpected error', error);
    }
  }

  async getLatest(sessionId: string): Promise<ConfidenceRecord | null> {
    if (process.env.NODE_ENV === 'test') {
      return null;
    }
    if (!this.client) {
      return null;
    }

    try {
      const { data, error } = await this.client
        .from('confidence_scores')
        .select(
          'conversation_id, analysis_id, overall_score, dimension_scores, requires_review, explanation, factors, trace_id, metadata, created_at'
        )
        .eq('conversation_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[ConfidenceRepository] getLatest failed', error);
        return null;
      }

      const row = data?.[0];
      if (!row) {
        return null;
      }

      return {
        sessionId: row.conversation_id,
        analysisId: row.analysis_id ?? undefined,
        overall: row.overall_score,
        dimensions: row.dimension_scores ?? {},
        requiresReview: row.requires_review ?? false,
        explanation: row.explanation ?? undefined,
        factors: row.factors ?? undefined,
        traceId: row.trace_id ?? undefined,
        metadata: row.metadata ?? undefined,
        createdAt: row.created_at ?? undefined,
      };
    } catch (error) {
      console.error('[ConfidenceRepository] unexpected error', error);
      return null;
    }
  }
}

export const confidenceRepository = new ConfidenceRepository();
