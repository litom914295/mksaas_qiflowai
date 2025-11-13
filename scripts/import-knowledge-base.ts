#!/usr/bin/env tsx
/**
 * 知识库导入脚本
 *
 * 功能：批量导入文档到向量数据库
 * 使用：npx tsx scripts/import-knowledge-base.ts --source ./knowledge/bazi --category bazi
 */

import { promises as fs } from 'fs';
import path from 'path';
import { db } from '@/db';
import { knowledgeDocuments } from '@/db/schema-knowledge';
import {
  type DocumentCategoryType,
  EmbeddingService,
  type TextChunk,
  TextChunker,
} from '@/lib/rag';
import chalk from 'chalk';
import { program } from 'commander';
import { glob } from 'glob';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';

interface ImportOptions {
  source: string; // 源文件夹路径
  category: DocumentCategoryType; // 文档类别
  chunkSize?: number; // 分块大小
  overlap?: number; // 重叠大小
  batchSize?: number; // 批量处理大小
  dryRun?: boolean; // 干运行（不写入数据库）
  verbose?: boolean; // 详细输出
}

interface DocumentMetadata {
  title: string;
  author?: string;
  source?: string;
  tags?: string[];
  date?: string;
}

class KnowledgeImporter {
  private chunker: TextChunker;
  private embeddingService: EmbeddingService;
  private stats = {
    filesProcessed: 0,
    chunksCreated: 0,
    tokensUsed: 0,
    errors: 0,
    startTime: Date.now(),
  };

  constructor(private options: ImportOptions) {
    this.chunker = new TextChunker({
      maxChunkSize: options.chunkSize || 1000,
      overlap: options.overlap || 200,
    });

    this.embeddingService = new EmbeddingService();
  }

  /**
   * 主入口：执行导入
   */
  async import(): Promise<void> {
    const spinner = ora('Initializing...').start();

    try {
      // 1. 查找所有文档文件
      spinner.text = 'Finding documents...';
      const files = await this.findDocumentFiles();

      if (files.length === 0) {
        spinner.fail('No documents found');
        return;
      }

      spinner.succeed(`Found ${files.length} document(s)`);

      // 2. 处理每个文件
      for (const file of files) {
        await this.processFile(file);
      }

      // 3. 显示统计
      this.printStats();
    } catch (error) {
      spinner.fail(`Import failed: ${error}`);
      process.exit(1);
    }
  }

  /**
   * 查找文档文件
   */
  private async findDocumentFiles(): Promise<string[]> {
    const patterns = ['**/*.txt', '**/*.md', '**/*.markdown'];

    const files: string[] = [];

    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: this.options.source,
        absolute: true,
        nodir: true,
      });
      files.push(...matches);
    }

    return files;
  }

  /**
   * 处理单个文件
   */
  private async processFile(filePath: string): Promise<void> {
    const spinner = ora(`Processing ${path.basename(filePath)}...`).start();

    try {
      // 1. 读取文件
      const content = await fs.readFile(filePath, 'utf-8');

      // 2. 解析元数据
      const { metadata, bodyContent } = this.parseDocument(content);

      // 3. 设置默认元数据
      if (!metadata.title) {
        metadata.title = path.basename(filePath, path.extname(filePath));
      }
      if (!metadata.source) {
        metadata.source = path.relative(this.options.source, filePath);
      }

      // 4. 分块
      spinner.text = `Chunking ${metadata.title}...`;
      const chunks = this.chunker.chunk(bodyContent);

      if (this.options.verbose) {
        console.log(chalk.gray(`  → Created ${chunks.length} chunk(s)`));
      }

      // 5. 向量化
      spinner.text = `Vectorizing ${metadata.title}...`;
      const embeddings = await this.vectorizeChunks(chunks);

      // 6. 保存到数据库
      if (!this.options.dryRun) {
        spinner.text = `Saving ${metadata.title}...`;
        await this.saveToDatabase(metadata, chunks, embeddings);
      }

      // 7. 更新统计
      this.stats.filesProcessed++;
      this.stats.chunksCreated += chunks.length;

      spinner.succeed(`✓ ${metadata.title} (${chunks.length} chunks)`);
    } catch (error) {
      this.stats.errors++;
      spinner.fail(`Failed to process ${path.basename(filePath)}: ${error}`);

      if (this.options.verbose) {
        console.error(error);
      }
    }
  }

  /**
   * 解析文档（支持 Front Matter）
   */
  private parseDocument(content: string): {
    metadata: DocumentMetadata;
    bodyContent: string;
  } {
    const metadata: DocumentMetadata = { title: '' };
    let bodyContent = content;

    // 检查是否有 Front Matter (---开头的 YAML)
    if (content.startsWith('---')) {
      const endIndex = content.indexOf('\n---', 4);

      if (endIndex !== -1) {
        const frontMatter = content.substring(4, endIndex);
        bodyContent = content.substring(endIndex + 4).trim();

        // 解析 Front Matter
        const lines = frontMatter.split('\n');
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();

            switch (key) {
              case 'title':
                metadata.title = value;
                break;
              case 'author':
                metadata.author = value;
                break;
              case 'source':
                metadata.source = value;
                break;
              case 'tags':
                metadata.tags = value.split(',').map((t) => t.trim());
                break;
              case 'date':
                metadata.date = value;
                break;
            }
          }
        }
      }
    }

    // 或者检查 Markdown 标题
    if (!metadata.title && bodyContent.startsWith('#')) {
      const firstLine = bodyContent.split('\n')[0];
      metadata.title = firstLine.replace(/^#+\s*/, '').trim();
    }

    return { metadata, bodyContent };
  }

  /**
   * 批量向量化分块
   */
  private async vectorizeChunks(chunks: TextChunk[]): Promise<number[][]> {
    const texts = chunks.map((c) => c.content);
    const batchSize = this.options.batchSize || 100;
    const embeddings: number[][] = [];

    // 分批处理
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      if (this.options.verbose) {
        console.log(
          chalk.gray(
            `    Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`
          )
        );
      }

      const result = await this.embeddingService.embedBatch(batch);
      embeddings.push(...result.embeddings);
      this.stats.tokensUsed += result.totalTokens;
    }

    return embeddings;
  }

  /**
   * 保存到数据库
   */
  private async saveToDatabase(
    metadata: DocumentMetadata,
    chunks: TextChunk[],
    embeddings: number[][]
  ): Promise<void> {
    const parentDocId = uuidv4();
    const documents = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];

      documents.push({
        id: uuidv4(),
        title: metadata.title,
        content: chunk.content,
        category: this.options.category,
        source: metadata.source || 'unknown',
        metadata: {
          author: metadata.author,
          tags: metadata.tags,
          date: metadata.date,
          chunkIndex: chunk.index,
          totalChunks: chunks.length,
          startChar: chunk.startChar,
          endChar: chunk.endChar,
          tokens: chunk.tokens,
        },
        embedding: JSON.stringify(embedding), // 存储为 JSON 字符串
        chunkIndex: chunk.index,
        parentDocId: i === 0 ? null : parentDocId,
        viewCount: 0,
        referenceCount: 0,
        avgSimilarity: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // 批量插入
    if (documents.length > 0) {
      await db.insert(knowledgeDocuments).values(documents);
    }
  }

  /**
   * 打印统计信息
   */
  private printStats(): void {
    const duration = Date.now() - this.stats.startTime;
    const seconds = Math.floor(duration / 1000);
    const cost = (this.stats.tokensUsed / 1000) * 0.00002;

    console.log('\n' + chalk.bold('Import Summary:'));
    console.log(
      chalk.green(`  ✓ Files processed: ${this.stats.filesProcessed}`)
    );
    console.log(chalk.green(`  ✓ Chunks created: ${this.stats.chunksCreated}`));
    console.log(
      chalk.blue(`  → Tokens used: ${this.stats.tokensUsed.toLocaleString()}`)
    );
    console.log(chalk.blue(`  → Estimated cost: $${cost.toFixed(4)}`));

    if (this.stats.errors > 0) {
      console.log(chalk.red(`  ✗ Errors: ${this.stats.errors}`));
    }

    console.log(chalk.gray(`  ⏱ Duration: ${seconds}s`));

    if (this.options.dryRun) {
      console.log(
        chalk.yellow('\n⚠ Dry run mode - no data was written to database')
      );
    }
  }
}

/**
 * CLI 配置
 */
program
  .name('import-knowledge-base')
  .description('Import documents into the RAG knowledge base')
  .version('1.0.0')
  .requiredOption(
    '-s, --source <path>',
    'Source directory containing documents'
  )
  .requiredOption(
    '-c, --category <type>',
    'Document category (bazi|fengshui|faq|case)'
  )
  .option('--chunk-size <number>', 'Maximum chunk size in characters', '1000')
  .option('--overlap <number>', 'Overlap size between chunks', '200')
  .option('--batch-size <number>', 'Batch size for embedding', '100')
  .option('-d, --dry-run', 'Simulate import without writing to database')
  .option('-v, --verbose', 'Show detailed output')
  .example('$0 -s ./knowledge/bazi -c bazi', 'Import BaZi knowledge documents')
  .example('$0 -s ./docs/faq -c faq --dry-run', 'Dry run FAQ import');

program.parse(process.argv);

const options = program.opts() as ImportOptions;

// 验证类别
const validCategories: DocumentCategoryType[] = [
  'bazi',
  'fengshui',
  'faq',
  'case',
];
if (!validCategories.includes(options.category)) {
  console.error(chalk.red(`Invalid category: ${options.category}`));
  console.error(chalk.gray(`Valid categories: ${validCategories.join(', ')}`));
  process.exit(1);
}

// 验证源路径
if (!options.source) {
  console.error(chalk.red('Source directory is required'));
  process.exit(1);
}

// 转换为绝对路径
if (!path.isAbsolute(options.source)) {
  options.source = path.resolve(process.cwd(), options.source);
}

// 检查源路径是否存在
fs.access(options.source)
  .then(() => {
    // 执行导入
    console.log(chalk.bold('\n📚 Knowledge Base Import\n'));
    console.log(`Source: ${chalk.cyan(options.source)}`);
    console.log(`Category: ${chalk.cyan(options.category)}`);
    console.log(`Chunk size: ${chalk.cyan(options.chunkSize || 1000)}`);
    console.log(`Overlap: ${chalk.cyan(options.overlap || 200)}`);

    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠ DRY RUN MODE - No data will be saved\n'));
    }

    const importer = new KnowledgeImporter(options);
    return importer.import();
  })
  .catch(() => {
    console.error(chalk.red(`Source directory not found: ${options.source}`));
    process.exit(1);
  });
