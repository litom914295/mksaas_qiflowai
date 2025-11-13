#!/usr/bin/env tsx
/**
 * 知识库数据摄取脚本
 *
 * 功能：
 * 1. 读取指定目录的文档文件（.txt, .md, .json）
 * 2. 分块处理文本
 * 3. 生成向量嵌入
 * 4. 存储到数据库的knowledge_documents表
 *
 * 使用方法：
 * pnpm tsx scripts/ingest-knowledge-base.ts --source ./docs/knowledge
 * pnpm tsx scripts/ingest-knowledge-base.ts --source ./docs/knowledge --category bazi
 * pnpm tsx scripts/ingest-knowledge-base.ts --dry-run
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { EmbeddingService } from '../src/lib/rag/embedding-service';
import { TextChunker } from '../src/lib/rag/text-chunker';
import { v4 as uuidv4 } from 'uuid';

// 加载环境变量
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

// 命令行参数解析
const args = process.argv.slice(2);
const getArg = (name: string): string | undefined => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : undefined;
};

const hasFlag = (name: string): boolean => args.includes(`--${name}`);

// 配置
const config = {
  sourceDir: getArg('source') || './docs/knowledge',
  category: getArg('category') || 'general',
  dryRun: hasFlag('dry-run'),
  force: hasFlag('force'),
  chunkSize: Number.parseInt(getArg('chunk-size') || '1000'),
  chunkOverlap: Number.parseInt(getArg('chunk-overlap') || '200'),
};

// 支持的文件扩展名
const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json'];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) =>
    console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`${colors.cyan}▶${colors.reset} ${msg}`),
};

// 数据库客户端
let supabase: ReturnType<typeof createClient> | null = null;

function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  supabase = createClient(supabaseUrl, serviceKey);
  return supabase;
}

// 读取文档文件
async function loadDocuments(
  sourceDir: string
): Promise<{ path: string; content: string; name: string }[]> {
  const documents: { path: string; content: string; name: string }[] = [];

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const filePath = path.join(sourceDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const ext = path.extname(file).toLowerCase();

      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        documents.push({
          path: filePath,
          content,
          name: file,
        });
      }
    } else if (stat.isDirectory()) {
      // 递归处理子目录
      const subDocs = await loadDocuments(filePath);
      documents.push(...subDocs);
    }
  }

  return documents;
}

// 处理JSON文档
function extractTextFromJson(jsonContent: string): string {
  try {
    const data = JSON.parse(jsonContent);
    return JSON.stringify(data, null, 2);
  } catch {
    return jsonContent;
  }
}

// 主摄取流程
async function ingestKnowledgeBase() {
  log.step('开始知识库数据摄取...\n');

  // 显示配置
  console.log('配置信息:');
  console.log(`  源目录: ${colors.bright}${config.sourceDir}${colors.reset}`);
  console.log(`  分类: ${colors.bright}${config.category}${colors.reset}`);
  console.log(`  分块大小: ${colors.bright}${config.chunkSize}${colors.reset}`);
  console.log(
    `  分块重叠: ${colors.bright}${config.chunkOverlap}${colors.reset}`
  );
  console.log(
    `  模式: ${colors.bright}${config.dryRun ? 'Dry Run (不写入数据库)' : 'Production'}${colors.reset}\n`
  );

  // Step 1: 加载文档
  log.step('Step 1: 加载文档文件');
  const documents = await loadDocuments(config.sourceDir);
  log.success(`找到 ${documents.length} 个文档文件\n`);

  if (documents.length === 0) {
    log.warn('没有找到任何文档文件');
    return;
  }

  // Step 2: 文本分块
  log.step('Step 2: 文本分块处理');
  const chunker = new TextChunker({
    maxChunkSize: config.chunkSize,
    overlap: config.chunkOverlap,
  });

  const allChunks: Array<{
    content: string;
    metadata: {
      source: string;
      category: string;
      chunk_index: number;
      total_chunks: number;
    };
  }> = [];

  for (const doc of documents) {
    let content = doc.content;

    // 处理JSON文件
    if (doc.name.endsWith('.json')) {
      content = extractTextFromJson(content);
    }

    const chunks = chunker.chunk(content);

    chunks.forEach((chunk, index) => {
      allChunks.push({
        content: chunk.content,
        metadata: {
          source: doc.name,
          category: config.category,
          chunk_index: index,
          total_chunks: chunks.length,
        },
      });
    });
  }

  log.success(`生成 ${allChunks.length} 个文本块\n`);

  // Step 3: 生成向量嵌入
  log.step('Step 3: 生成向量嵌入（可能需要几分钟）');

  if (config.dryRun) {
    log.info('🔍 Dry Run 模式 - 预览结果：');
    console.log(`\n  文档数: ${documents.length}`);
    console.log(`  文本块数: ${allChunks.length}`);
    console.log(
      `  预估 tokens: ~${(allChunks.reduce((sum, c) => sum + c.content.length, 0) / 3).toFixed(0)}`
    );
    console.log(`  预估成本: ~$0.01 (text-embedding-3-small)`);
    log.success('\n🎉 Dry Run 完成！文本分块正常，可以执行实际摄取。');
    return;
  }

  const apiKey = process.env.EMBEDDING_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('EMBEDDING_API_KEY or OPENAI_API_KEY not found in environment variables');
  }

  const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
  const embeddingDimensions = process.env.EMBEDDING_DIMENSIONS 
    ? Number.parseInt(process.env.EMBEDDING_DIMENSIONS) 
    : 1536;

  const embeddingService = new EmbeddingService(apiKey, {
    model: embeddingModel,
    dimensions: embeddingDimensions,
    batchSize: 100,
  });

  // 估算成本
  const texts = allChunks.map((c) => c.content);
  const estimate = embeddingService.estimateCost(texts);
  log.info(
    `预估: ~${estimate.tokens.toLocaleString()} tokens, 成本约 $${estimate.cost.toFixed(4)}`
  );

  if (config.dryRun) {
    log.warn('Dry Run 模式，跳过实际嵌入生成');
    log.success('\n摄取预览完成！');
    return;
  }

  // 实际生成嵌入
  let result: { embeddings: number[][]; totalTokens: number; costs: number };
  
  // 硅基流动使用原生fetch（OpenAI SDK有兼容问题）
  if (process.env.EMBEDDING_PROVIDER === 'siliconflow' || 
      process.env.EMBEDDING_BASE_URL?.includes('siliconflow')) {
    log.info('使用硅基流动API...');
    
    const baseURL = process.env.EMBEDDING_BASE_URL || 'https://api.siliconflow.cn/v1';
    const embeddings: number[][] = [];
    let totalTokens = 0;
    
    // 分批处理
    for (let i = 0; i < texts.length; i += 100) {
      const batch = texts.slice(i, i + 100);
      
      const response = await fetch(`${baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: embeddingModel,
          input: batch,
        }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Embedding API error: ${response.status} ${text}`);
      }
      
      const data = await response.json();
      data.data.forEach((item: any) => {
        embeddings[i + item.index] = item.embedding;
      });
      totalTokens += data.usage?.total_tokens || 0;
      
      log.info(`  处理进度: ${Math.min(i + 100, texts.length)}/${texts.length}`);
    }
    
    result = { embeddings, totalTokens, costs: 0 }; // 硅基流动免费
  } else {
    // OpenAI或其他代理使用SDK
    result = await embeddingService.embedBatch(texts);
  }
  
  log.success(
    `生成完成！实际使用 ${result.totalTokens.toLocaleString()} tokens, 成本 $${result.costs.toFixed(4)}\n`
  );

  // Step 4: 存储到数据库
  log.step('Step 4: 存储到数据库');

  if (!supabase) {
    supabase = initSupabase();
  }

  // 构造records匹配knowledge_documents schema
  const records = allChunks.map((chunk, index) => ({
    id: uuidv4(),
    title: chunk.metadata.source,
    category: config.category,
    source: chunk.metadata.source,
    content: chunk.content,
    metadata: chunk.metadata,
    embedding: `[${result.embeddings[index].join(',')}]`, // PostgreSQL vector格式
    chunk_index: chunk.metadata.chunk_index,
    parent_doc_id: null,
    view_count: 0,
    reference_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  // 如果force模式，先删除同类别的旧数据
  if (config.force) {
    log.info('Force 模式：删除旧数据...');
    const { error: deleteError } = await supabase
      .from('knowledge_documents')
      .delete()
      .eq('category', config.category);

    if (deleteError) {
      log.error(`删除旧数据失败: ${deleteError.message}`);
    } else {
      log.success('旧数据已删除');
    }
  }

  // 批量插入（每次100条）
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('knowledge_documents').insert(batch);

    if (error) {
      log.error(
        `批次 ${Math.floor(i / batchSize) + 1} 插入失败: ${error.message}`
      );
      throw error;
    }

    inserted += batch.length;
    process.stdout.write(`  已插入: ${inserted}/${records.length}\r`);
  }

  console.log(); // 换行
  log.success(`成功插入 ${inserted} 条记录到数据库\n`);

  // 显示统计
  const stats = embeddingService.getStats();
  console.log('摄取统计:');
  console.log(`  文档数: ${documents.length}`);
  console.log(`  文本块: ${allChunks.length}`);
  console.log(`  向量维度: ${stats.dimensions}`);
  console.log(`  总Token数: ${stats.totalTokens.toLocaleString()}`);
  console.log(`  总成本: $${stats.totalCost.toFixed(4)}`);

  log.success('\n知识库摄取完成！');
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('\n未处理的错误:', error);
  process.exit(1);
});

// 主函数
async function main() {
  try {
    await ingestKnowledgeBase();
  } catch (error: any) {
    log.error(`\n摄取失败: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// 显示帮助信息
if (hasFlag('help') || hasFlag('h')) {
  console.log(`
${colors.bright}知识库数据摄取脚本${colors.reset}

使用方法:
  pnpm tsx scripts/ingest-knowledge-base.ts [选项]

选项:
  --source <path>       源目录路径 (默认: ./docs/knowledge)
  --category <name>     文档分类 (默认: general)
  --chunk-size <num>    文本块大小 (默认: 1000)
  --chunk-overlap <num> 文本块重叠 (默认: 200)
  --dry-run             预览模式，不实际写入数据库
  --force               强制模式，删除已有同类别数据
  --help, -h            显示帮助信息

示例:
  pnpm tsx scripts/ingest-knowledge-base.ts --source ./docs/bazi --category bazi
  pnpm tsx scripts/ingest-knowledge-base.ts --dry-run
  pnpm tsx scripts/ingest-knowledge-base.ts --force --category fengshui
`);
  process.exit(0);
}

// 运行
main();
