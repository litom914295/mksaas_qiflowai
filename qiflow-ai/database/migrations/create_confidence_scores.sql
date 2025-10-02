CREATE TABLE confidence_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID,
  conversation_id UUID REFERENCES conversation_states(id) ON DELETE CASCADE,
  overall_score FLOAT NOT NULL CHECK (overall_score >= 0 AND overall_score <= 1),
  dimension_scores JSONB NOT NULL,
  explanation TEXT,
  factors JSONB,
  requires_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_confidence_scores_conversation ON confidence_scores(conversation_id);
CREATE INDEX idx_confidence_scores_score ON confidence_scores(overall_score);
