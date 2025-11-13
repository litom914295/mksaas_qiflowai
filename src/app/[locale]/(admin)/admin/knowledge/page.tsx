import { KnowledgeBaseManager } from '@/components/admin/knowledge-base-manager';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: '知识库管理 | Admin',
  description: '管理RAG知识库文档和向量索引',
};

export default function KnowledgeBasePage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">知识库管理</h1>
        <p className="text-muted-foreground mt-2">
          上传和管理RAG知识库文档，支持文本分块和向量索引
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <KnowledgeBaseManager />
      </Suspense>
    </div>
  );
}
