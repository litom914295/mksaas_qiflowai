CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE knowledge_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_type VARCHAR(50) NOT NULL,
  node_data JSONB NOT NULL,
  embeddings vector(1536),
  relationships JSONB DEFAULT '[]'::jsonb,
  confidence FLOAT DEFAULT 1.0,
  language VARCHAR(5) DEFAULT 'zh-CN',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_graph_type ON knowledge_graph(node_type);
CREATE INDEX idx_knowledge_graph_language ON knowledge_graph(language);
CREATE INDEX idx_knowledge_graph_embeddings ON knowledge_graph USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);
