/**
 * @jest-environment node
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { KnowledgeGraphService } from '../knowledge/knowledge-service';

// Mock the Supabase client
const mockSupabaseClient = {
  rpc: jest.fn(),
  auth: { persistSession: false },
} as unknown as SupabaseClient;

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Mock environment variables
const originalEnv = process.env;

describe('KnowledgeGraphService', () => {
  let knowledgeService: KnowledgeGraphService;
  let mockRpc: jest.MockedFunction<typeof mockSupabaseClient.rpc>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc = mockSupabaseClient.rpc as jest.MockedFunction<
      typeof mockSupabaseClient.rpc
    >;

    // Set up environment variables
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should create service with provided client', () => {
      const customClient = { test: 'client' } as unknown as SupabaseClient;
      const service = new KnowledgeGraphService(customClient);
      expect(service).toBeInstanceOf(KnowledgeGraphService);
    });

    it('should create service with default client when env vars are available', () => {
      const service = new KnowledgeGraphService();
      expect(service).toBeInstanceOf(KnowledgeGraphService);
    });

    describe('Environment variable validation', () => {
      beforeEach(() => {
        // 临时保存原始环境变量
        process.env = { ...originalEnv };
      });

      afterEach(() => {
        // 恢复环境变量
        process.env = {
          ...originalEnv,
          NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
        };
      });

      it('should throw error when environment variables are missing', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
        process.env.SUPABASE_SERVICE_ROLE_KEY = undefined;

        expect(() => new KnowledgeGraphService()).toThrow(
          '[KnowledgeGraphService] 缺少 Supabase 配置，无法初始化。'
        );
      });

      it('should throw error when SUPABASE_URL is missing', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = undefined;
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

        expect(() => new KnowledgeGraphService()).toThrow(
          '[KnowledgeGraphService] 缺少 Supabase 配置，无法初始化。'
        );
      });

      it('should throw error when SERVICE_ROLE_KEY is missing', () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.SUPABASE_SERVICE_ROLE_KEY = undefined;

        expect(() => new KnowledgeGraphService()).toThrow(
          '[KnowledgeGraphService] 缺少 Supabase 配置，无法初始化。'
        );
      });
    });
  });

  describe('searchSimilarConcepts', () => {
    beforeEach(() => {
      knowledgeService = new KnowledgeGraphService(mockSupabaseClient);
    });

    it('should return knowledge results when database call succeeds', async () => {
      const mockDbResponse = [
        {
          id: 'node-1',
          node_type: 'concept',
          node_data: {
            name: 'Five Elements',
            description: 'Traditional Chinese five elements theory',
          },
          similarity: 0.95,
          tags: ['traditional', 'theory'],
          metadata: { source: 'classical_text', confidence: 0.9 },
        },
        {
          id: 'node-2',
          node_type: 'principle',
          node_data: { name: 'Yin Yang', principle: 'Balance of opposites' },
          similarity: 0.87,
          tags: ['fundamental', 'balance'],
          metadata: { source: 'ancient_wisdom', confidence: 0.85 },
        },
      ];

      mockRpc.mockResolvedValueOnce({
        data: mockDbResponse,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      const results = await knowledgeService.searchSimilarConcepts(
        embedding,
        5
      );

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: embedding,
        match_count: 5,
      });

      expect(results).toEqual([
        {
          id: 'node-1',
          nodeType: 'concept',
          nodeData: {
            name: 'Five Elements',
            description: 'Traditional Chinese five elements theory',
          },
          confidence: 0.95,
          tags: ['traditional', 'theory'],
          metadata: { source: 'classical_text', confidence: 0.9 },
        },
        {
          id: 'node-2',
          nodeType: 'principle',
          nodeData: { name: 'Yin Yang', principle: 'Balance of opposites' },
          confidence: 0.87,
          tags: ['fundamental', 'balance'],
          metadata: { source: 'ancient_wisdom', confidence: 0.85 },
        },
      ]);
    });

    it('should return empty array when database call fails', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: {
          message: 'Database connection failed',
          code: 'DB_ERROR',
        } as any,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[KnowledgeGraphService] searchSimilarConcepts error',
        { message: 'Database connection failed', code: 'DB_ERROR' }
      );

      consoleSpy.mockRestore();
    });

    it('should return empty array when data is null', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toEqual([]);
    });

    it('should return empty array when data is undefined', async () => {
      mockRpc.mockResolvedValueOnce({
        data: undefined,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toEqual([]);
    });

    it('should return empty array for empty embedding', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const results = await knowledgeService.searchSimilarConcepts([]);

      expect(results).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[KnowledgeGraphService] 提供的 embedding 为空，返回空结果。'
      );
      expect(mockRpc).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return empty array for non-array embedding', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const results = await knowledgeService.searchSimilarConcepts(null as any);

      expect(results).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[KnowledgeGraphService] 提供的 embedding 为空，返回空结果。'
      );
      expect(mockRpc).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should use default topK value of 5', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const embedding = [0.1, 0.2, 0.3];
      await knowledgeService.searchSimilarConcepts(embedding);

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: embedding,
        match_count: 5,
      });
    });

    it('should use custom topK value', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const embedding = [0.1, 0.2, 0.3];
      await knowledgeService.searchSimilarConcepts(embedding, 10);

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: embedding,
        match_count: 10,
      });
    });

    it('should handle missing tags in database response', async () => {
      const mockDbResponse = [
        {
          id: 'node-1',
          node_type: 'concept',
          node_data: { name: 'Test Concept' },
          similarity: 0.8,
          // tags missing
          metadata: { source: 'test' },
        },
      ];

      mockRpc.mockResolvedValueOnce({
        data: mockDbResponse,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toEqual([
        {
          id: 'node-1',
          nodeType: 'concept',
          nodeData: { name: 'Test Concept' },
          confidence: 0.8,
          tags: [], // Should default to empty array
          metadata: { source: 'test' },
        },
      ]);
    });

    it('should handle missing metadata in database response', async () => {
      const mockDbResponse = [
        {
          id: 'node-1',
          node_type: 'concept',
          node_data: { name: 'Test Concept' },
          similarity: 0.8,
          tags: ['test'],
          // metadata missing
        },
      ];

      mockRpc.mockResolvedValueOnce({
        data: mockDbResponse,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toEqual([
        {
          id: 'node-1',
          nodeType: 'concept',
          nodeData: { name: 'Test Concept' },
          confidence: 0.8,
          tags: ['test'],
          metadata: undefined, // Should preserve undefined
        },
      ]);
    });

    it('should handle large embedding arrays', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const largeEmbedding = Array.from({ length: 1536 }, (_, i) => i / 1536);
      await knowledgeService.searchSimilarConcepts(largeEmbedding);

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: largeEmbedding,
        match_count: 5,
      });
    });

    it('should handle database timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      mockRpc.mockRejectedValueOnce(timeoutError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const embedding = [0.1, 0.2, 0.3];

      // The service should handle the error and return empty array
      await expect(
        knowledgeService.searchSimilarConcepts(embedding)
      ).rejects.toThrow('Request timeout');

      consoleSpy.mockRestore();
    });

    it('should preserve all database response fields', async () => {
      const mockDbResponse = [
        {
          id: 'comprehensive-node',
          node_type: 'feng_shui_principle',
          node_data: {
            name: 'Flying Stars',
            description: 'Xuankong Flying Stars method',
            category: 'geomancy',
            difficulty: 'advanced',
            applications: ['residential', 'commercial'],
          },
          similarity: 0.92,
          tags: ['xuankong', 'flying_stars', 'traditional', 'advanced'],
          metadata: {
            source: 'classical_manual',
            author: 'Master Zhang',
            confidence: 0.95,
            verification_status: 'verified',
            last_updated: '2024-01-15',
          },
        },
      ];

      mockRpc.mockResolvedValueOnce({
        data: mockDbResponse,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toEqual([
        {
          id: 'comprehensive-node',
          nodeType: 'feng_shui_principle',
          nodeData: {
            name: 'Flying Stars',
            description: 'Xuankong Flying Stars method',
            category: 'geomancy',
            difficulty: 'advanced',
            applications: ['residential', 'commercial'],
          },
          confidence: 0.92,
          tags: ['xuankong', 'flying_stars', 'traditional', 'advanced'],
          metadata: {
            source: 'classical_manual',
            author: 'Master Zhang',
            confidence: 0.95,
            verification_status: 'verified',
            last_updated: '2024-01-15',
          },
        },
      ]);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      knowledgeService = new KnowledgeGraphService(mockSupabaseClient);
    });

    it('should handle malformed database responses', async () => {
      const malformedResponse = [
        {
          // Missing required fields
          node_data: { name: 'Test' },
          similarity: 0.8,
        },
        {
          id: 'valid-node',
          node_type: 'concept',
          node_data: { name: 'Valid Node' },
          similarity: 0.7,
          tags: ['valid'],
        },
      ];

      mockRpc.mockResolvedValueOnce({
        data: malformedResponse,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      // Should handle malformed data gracefully
      expect(results).toHaveLength(2);
      expect(results[1]).toEqual({
        id: 'valid-node',
        nodeType: 'concept',
        nodeData: { name: 'Valid Node' },
        confidence: 0.7,
        tags: ['valid'],
        metadata: undefined,
      });
    });

    it('should handle network connectivity issues', async () => {
      const networkError = new Error('NETWORK_ERROR: No internet connection');
      mockRpc.mockRejectedValueOnce(networkError);

      const embedding = [0.1, 0.2, 0.3];

      await expect(
        knowledgeService.searchSimilarConcepts(embedding)
      ).rejects.toThrow('NETWORK_ERROR: No internet connection');
    });

    it('should handle very high topK values', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const embedding = [0.1, 0.2, 0.3];
      await knowledgeService.searchSimilarConcepts(embedding, 10000);

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: embedding,
        match_count: 10000,
      });
    });

    it('should handle zero topK value', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const embedding = [0.1, 0.2, 0.3];
      await knowledgeService.searchSimilarConcepts(embedding, 0);

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: embedding,
        match_count: 0,
      });
    });

    it('should handle negative topK value', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const embedding = [0.1, 0.2, 0.3];
      await knowledgeService.searchSimilarConcepts(embedding, -5);

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: embedding,
        match_count: -5,
      });
    });
  });

  describe('Performance and Stress Testing', () => {
    beforeEach(() => {
      knowledgeService = new KnowledgeGraphService(mockSupabaseClient);
    });

    it('should handle concurrent requests', async () => {
      const mockResponse = {
        data: [
          {
            id: 'concurrent-node',
            node_type: 'test',
            node_data: { name: 'Concurrent Test' },
            similarity: 0.8,
            tags: ['test'],
          },
        ],
        error: null,
        count: 1,
        status: 200,
        statusText: 'OK',
      };

      mockRpc.mockResolvedValue(mockResponse);

      const embedding = [0.1, 0.2, 0.3];
      const promises = Array.from({ length: 10 }, () =>
        knowledgeService.searchSimilarConcepts(embedding)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('concurrent-node');
      });
      expect(mockRpc).toHaveBeenCalledTimes(10);
    });

    it('should complete searches within reasonable time', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const embedding = Array.from({ length: 1000 }, (_, i) => i / 1000);

      const startTime = Date.now();
      await knowledgeService.searchSimilarConcepts(embedding);
      const endTime = Date.now();

      // Should complete within reasonable time (adjust as needed for your environment)
      expect(endTime - startTime).toBeLessThan(1000); // 1 second
    });

    it('should handle empty result sets efficiently', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toEqual([]);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Data Validation', () => {
    beforeEach(() => {
      knowledgeService = new KnowledgeGraphService(mockSupabaseClient);
    });

    it('should validate embedding parameter types', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Test various invalid inputs
      const invalidInputs = [
        undefined,
        null,
        'string',
        123,
        { not: 'array' },
        true,
      ];

      for (const invalidInput of invalidInputs) {
        const results = await knowledgeService.searchSimilarConcepts(
          invalidInput as any
        );
        expect(results).toEqual([]);
      }

      expect(consoleSpy).toHaveBeenCalledTimes(invalidInputs.length);
      consoleSpy.mockRestore();
    });

    it('should handle embeddings with special float values', async () => {
      mockRpc.mockResolvedValueOnce({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      });

      const specialEmbedding = [
        0.1,
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        0.5,
      ];
      await knowledgeService.searchSimilarConcepts(specialEmbedding);

      expect(mockRpc).toHaveBeenCalledWith('match_knowledge_nodes', {
        query_embedding: specialEmbedding,
        match_count: 5,
      });
    });

    it('should preserve exact similarity scores from database', async () => {
      const preciseScores = [
        0.9999999, 0.1234567890123456, 0.0000001, 0.5555555,
      ];

      const mockDbResponse = preciseScores.map((score, index) => ({
        id: `node-${index}`,
        node_type: 'test',
        node_data: { name: `Node ${index}` },
        similarity: score,
        tags: [],
      }));

      mockRpc.mockResolvedValueOnce({
        data: mockDbResponse,
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK',
      } as any);

      const embedding = [0.1, 0.2, 0.3];
      const results = await knowledgeService.searchSimilarConcepts(embedding);

      expect(results).toHaveLength(4);
      results.forEach((result, index) => {
        expect(result.confidence).toBe(preciseScores[index]);
      });
    });
  });
});
