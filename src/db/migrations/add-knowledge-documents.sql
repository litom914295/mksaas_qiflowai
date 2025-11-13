-- 知识库文档表
-- 用于跟踪上传的文档及其处理状态

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  chunk_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category ON knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_status ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_created ON knowledge_documents(created_at);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_knowledge_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_knowledge_documents_updated_at
  BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_documents_updated_at();

-- 注释
COMMENT ON TABLE knowledge_documents IS 'RAG知识库文档管理表';
COMMENT ON COLUMN knowledge_documents.id IS '文档唯一标识';
COMMENT ON COLUMN knowledge_documents.category IS '文档分类（如 bazi, fengshui, general）';
COMMENT ON COLUMN knowledge_documents.file_name IS '原始文件名';
COMMENT ON COLUMN knowledge_documents.file_size IS '文件大小（字节）';
COMMENT ON COLUMN knowledge_documents.chunk_count IS '文本块数量';
COMMENT ON COLUMN knowledge_documents.status IS '处理状态：pending-等待, processing-处理中, completed-完成, error-错误';
COMMENT ON COLUMN knowledge_documents.error_message IS '错误信息（如果有）';
