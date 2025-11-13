/**
 * RAG (Retrieval-Augmented Generation) Module
 *
 * 统一导出所有 RAG 相关功能
 */

// Text Chunker
export {
  TextChunker,
  chunkText,
  chunkTexts,
  type TextChunk,
  type ChunkOptions,
} from './text-chunker';

// Embedding Service
export {
  EmbeddingService,
  embedText,
  embedTexts,
  getSharedEmbeddingService,
  resetSharedEmbeddingService,
  type EmbeddingResult,
  type BatchEmbeddingResult,
  type EmbeddingOptions,
} from './embedding-service';

// Vector Search
export {
  VectorSearchService,
  quickSearch,
  getSharedVectorSearchService,
  resetSharedVectorSearchService,
  type SearchOptions,
  type SearchResult,
  type SearchByEmbeddingOptions,
  type DocumentCategoryType,
} from './vector-search';

// RAG Generator
export {
  RAGGenerator,
  quickRAG,
  getSharedRAGGenerator,
  resetSharedRAGGenerator,
  type RAGOptions,
  type RAGResponse,
} from './rag-generator';
