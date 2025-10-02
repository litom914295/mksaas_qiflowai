CREATE TABLE ai_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  trace_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_session ON ai_usage_metrics(session_id);
CREATE INDEX idx_ai_usage_user ON ai_usage_metrics(user_id);
CREATE INDEX idx_ai_usage_provider ON ai_usage_metrics(provider);
CREATE INDEX idx_ai_usage_model ON ai_usage_metrics(model);
CREATE INDEX idx_ai_usage_created_at ON ai_usage_metrics(created_at);
CREATE INDEX idx_ai_usage_success ON ai_usage_metrics(success);
CREATE INDEX idx_ai_usage_cost ON ai_usage_metrics(cost_usd);

-- 复合索引用于常见查询
CREATE INDEX idx_ai_usage_user_date ON ai_usage_metrics(user_id, created_at);
CREATE INDEX idx_ai_usage_provider_date ON ai_usage_metrics(provider, created_at);
CREATE INDEX idx_ai_usage_model_date ON ai_usage_metrics(model, created_at);
