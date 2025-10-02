import { NextResponse } from 'next/server';
import { KnowledgeGraphService } from '@/lib/ai/knowledge/knowledge-service';

const knowledgeService = (() => {
  try {
    return new KnowledgeGraphService();
  } catch (error) {
    console.warn('[KnowledgeAPI] 初始化知识图谱失败', error);
    return null;
  }
})();

interface KnowledgeRequestBody {
  query?: string;
  topK?: number;
}

const buildEmbedding = (text: string, dimensions = 16): number[] => {
  if (!text) {
    return [];
  }
  const buffer = new Array(dimensions).fill(0);
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    buffer[index % dimensions] += code / 255;
  }
  return buffer.map(value => Number.parseFloat(value.toFixed(6)));
};

export async function POST(request: Request): Promise<Response> {
  try {
    if (!knowledgeService) {
      return NextResponse.json(
        {
          success: false,
          error: '知识图谱服务未配置',
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as KnowledgeRequestBody;
    const query = body.query?.trim();

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少查询文本',
        },
        { status: 400 }
      );
    }

    const embedding = buildEmbedding(query);
    if (!embedding.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const topK = body.topK && body.topK > 0 ? body.topK : 5;
    const data = await knowledgeService.searchSimilarConcepts(embedding, topK);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[KnowledgeAPI] unexpected error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
