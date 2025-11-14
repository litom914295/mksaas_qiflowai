import { auth } from '@/lib/auth';
import { EmbeddingService } from '@/lib/rag/embedding-service';
import { TextChunker } from '@/lib/rag/text-chunker';
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import * as pdfParse from 'pdf-parse';

function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not found');
  }

  return createClient(supabaseUrl, serviceKey);
}

/**
 * 根据文件类型提取文本内容
 */
async function extractTextContent(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // PDF文件
  if (fileName.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await (pdfParse as any).default(buffer);
    return data.text;
  }

  // DOCX文件
  if (fileName.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // DOC文件（旧格式，mammoth也支持但效果可能不如DOCX）
  if (fileName.endsWith('.doc')) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // JSON文件
  if (fileName.endsWith('.json')) {
    const content = await file.text();
    try {
      const json = JSON.parse(content);
      // 将JSON转换为可读文本
      return JSON.stringify(json, null, 2);
    } catch {
      // 如果解析失败，返回原始文本
      return content;
    }
  }

  // 默认：文本文件（.txt, .md等）
  return await file.text();
}

/**
 * POST /api/admin/knowledge/upload
 * 上传知识库文档并生成向量索引
 */
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const category = formData.get('category') as string;
    const files = formData.getAll('files') as File[];

    if (!category || files.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供分类和文件' },
        { status: 400 }
      );
    }

    const supabase = initSupabase();
    const processedFiles: string[] = [];

    // 处理每个文件
    for (const file of files) {
      try {
        // 验证文件格式
        const fileName = file.name.toLowerCase();
        const supportedExtensions = [
          '.txt',
          '.md',
          '.json',
          '.pdf',
          '.docx',
          '.doc',
        ];
        const isSupported = supportedExtensions.some((ext) =>
          fileName.endsWith(ext)
        );

        if (!isSupported) {
          console.warn(`Skipping unsupported file: ${file.name}`);
          continue;
        }

        // 提取文件内容
        const content = await extractTextContent(file);

        // 创建文档记录
        const { data: doc, error: docError } = await supabase
          .from('knowledge_documents')
          .insert({
            category,
            file_name: file.name,
            file_size: file.size,
            status: 'processing',
          })
          .select()
          .single();

        if (docError) throw docError;

        // 文本分块
        const chunker = new TextChunker({
          maxChunkSize: 1000,
        });

        const chunks = chunker.chunk(content);

        // 生成向量嵌入
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY not configured');
        }

        const embeddingService = new EmbeddingService(
          process.env.OPENAI_API_KEY,
          {
            model: 'text-embedding-3-small',
            dimensions: 1536,
          }
        );

        const texts = chunks.map((c: any) => c.content);
        const result = await embeddingService.embedBatch(texts);

        // 存储文本块和向量
        const chunkRecords = chunks.map((chunk: any, index: number) => ({
          content: chunk.content,
          embedding: result.embeddings[index],
          metadata: {
            source: file.name,
            category,
            chunk_index: index,
            total_chunks: chunks.length,
            document_id: doc.id,
          },
          category,
          created_at: new Date().toISOString(),
        }));

        // 批量插入
        const { error: chunkError } = await supabase
          .from('knowledge_chunks')
          .insert(chunkRecords);

        if (chunkError) throw chunkError;

        // 更新文档状态
        await supabase
          .from('knowledge_documents')
          .update({
            status: 'completed',
            chunk_count: chunks.length,
          })
          .eq('id', doc.id);

        processedFiles.push(file.name);
      } catch (error: any) {
        console.error(`Failed to process file ${file.name}:`, error);
        // 继续处理其他文件
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedFiles.length,
      files: processedFiles,
    });
  } catch (error: any) {
    console.error('Knowledge upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Upload failed',
      },
      { status: 500 }
    );
  }
}
