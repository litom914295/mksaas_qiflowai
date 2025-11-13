#!/usr/bin/env tsx
/**
 * RAG 检索测试脚本
 * 测试知识库向量搜索功能
 */

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { VectorSearchService } from '../src/lib/rag/vector-search';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

const log = {
  info: (msg: string) => console.log(`\x1b[34mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
};

async function testRagSearch() {
  log.info('🔍 测试 RAG 知识库检索...\n');

  const vectorSearch = new VectorSearchService();

  // 测试查询
  const queries = [
    '八字是什么？',
    '如何计算生辰八字？',
    '风水有什么作用？',
  ];

  for (const query of queries) {
    console.log(`\n${'='.repeat(80)}`);
    log.info(`查询: "${query}"`);
    console.log('='.repeat(80));

    try {
      const results = await vectorSearch.search({
        query,
        topK: 3,
        threshold: 0.5,
        minSimilarity: 0.5,
      });

      if (results.length === 0) {
        log.error('未找到相关文档');
        continue;
      }

      log.success(`找到 ${results.length} 个相关文档:\n`);

      results.forEach((doc, idx) => {
        console.log(`\x1b[36m[${idx + 1}]\x1b[0m 相似度: \x1b[33m${(doc.similarity * 100).toFixed(1)}%\x1b[0m`);
        console.log(`    来源: ${doc.source}`);
        console.log(`    分类: ${doc.category}`);
        console.log(`    内容: ${doc.content.substring(0, 150)}...\n`);
      });
    } catch (error: any) {
      log.error(`检索失败: ${error.message}`);
      console.error(error);
    }
  }

  log.success('\n✅ RAG 检索测试完成！');
}

testRagSearch();
