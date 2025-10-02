import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface KnowledgeResult {
  id: string;
  nodeType: string;
  nodeData: Record<string, unknown>;
  confidence: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

interface MatchKnowledgeNodesResponse {
  id: string;
  node_type: string;
  node_data: Record<string, unknown>;
  similarity: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

const resolveClient = (() => {
  let client: SupabaseClient | null = null;

  return () => {
    if (client) {
      return client;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      throw new Error(
        '[KnowledgeGraphService] 缺少 Supabase 配置，无法初始化。'
      );
    }

    client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    return client;
  };
})();

export class KnowledgeGraphService {
  private readonly client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    if (client) {
      this.client = client;
    } else {
      // 验证环境变量
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        throw new Error(
          '[KnowledgeGraphService] 缺少 Supabase 配置，无法初始化。'
        );
      }

      this.client = resolveClient();
    }
  }

  async searchSimilarConcepts(
    embedding: number[],
    topK = 5
  ): Promise<KnowledgeResult[]> {
    if (!Array.isArray(embedding) || embedding.length === 0) {
      console.warn(
        '[KnowledgeGraphService] 提供的 embedding 为空，返回空结果。'
      );
      return [];
    }

    const { data, error } = (await this.client.rpc('match_knowledge_nodes', {
      query_embedding: embedding,
      match_count: topK,
    })) as { data: MatchKnowledgeNodesResponse[] | null; error: any };

    if (error) {
      console.error(
        '[KnowledgeGraphService] searchSimilarConcepts error',
        error
      );
      return [];
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      nodeType: row.node_type,
      nodeData: row.node_data,
      confidence: row.similarity,
      tags: row.tags ?? [],
      metadata: row.metadata,
    }));
  }
}
