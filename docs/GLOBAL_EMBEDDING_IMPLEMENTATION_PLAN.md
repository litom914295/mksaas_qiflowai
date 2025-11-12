# 全球智能路由实施计划

## 📋 实施目标

将 QiFlow AI 的 Embedding 系统升级为**全球智能路由架构**，实现：
- 🌍 全球用户低延迟访问（< 200ms）
- 💰 成本优化（中国用户免费，总体降低 40%）
- 🔒 数据安全（中国数据在境内处理）
- 🛡️ 高可用性（多提供商自动故障转移）

---

## 🎯 分步实施计划

### Phase 1: 准备阶段（1-2 天）

#### 步骤 1.1: 注册 API Keys
```bash
# 必需的提供商
✅ OpenAI: https://platform.openai.com/api-keys
✅ 硅基流动: https://siliconflow.cn/account/ak (免费)

# 推荐的提供商
⭐ Jina AI: https://jina.ai/embeddings#pricing (1M 免费)

# 可选的提供商（企业版）
🏢 阿里云灵积: https://dashscope.console.aliyun.com/
```

#### 步骤 1.2: 配置环境变量
```env
# .env.local
OPENAI_API_KEY=sk-...
SILICONFLOW_API_KEY=sk-...
JINA_API_KEY=jina_...
DEFAULT_REGION=cn
```

#### 步骤 1.3: 验证依赖包
```bash
# 检查现有依赖
npm list | grep openai

# 如果需要，安装 Jina SDK
npm install @jina-ai/jina
```

---

### Phase 2: 核心迁移（2-3 天）

#### 步骤 2.1: 更新 RAG 核心库

**文件**: `src/lib/rag/rag-generator.ts`

```typescript
// 修改前
import { EmbeddingService } from './embedding-service';

// 修改后
import { getGlobalEmbeddingService } from './embedding-service-global';

export class RAGGenerator {
  private embeddingService: GlobalEmbeddingService;
  
  constructor(config?: RAGGeneratorConfig) {
    this.embeddingService = getGlobalEmbeddingService({
      provider: config?.embeddingProvider || 'auto',
      userRegion: config?.userRegion,
    });
  }
}
```

#### 步骤 2.2: 更新 CLI 导入工具

**文件**: `scripts/import-knowledge-base.ts`

```typescript
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

// 添加命令行参数
const provider = process.argv.includes('--provider')
  ? process.argv[process.argv.indexOf('--provider') + 1]
  : 'auto';

const embeddingService = getGlobalEmbeddingService({
  provider: provider as 'auto' | 'openai' | 'siliconflow' | 'jina',
  userRegion: process.env.DEFAULT_REGION,
});
```

#### 步骤 2.3: 更新 Server Actions

**文件**: `src/actions/rag-actions.ts`

```typescript
import { headers } from 'next/headers';
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

export async function chatWithRAG(input: ChatWithRAGInput) {
  // 从请求头获取地区
  const headersList = await headers();
  const region = headersList.get('x-vercel-ip-country')?.toLowerCase()
    || process.env.DEFAULT_REGION;
  
  const ragGenerator = new RAGGenerator({
    embeddingProvider: 'auto',
    userRegion: region,
  });
  
  // ... 其余代码
}
```

---

### Phase 3: 地区检测（1 天）

#### 步骤 3.1: 添加 Middleware 地区检测

**创建**: `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Vercel 自动提供
  const region = request.headers.get('x-vercel-ip-country')?.toLowerCase()
    || request.headers.get('cf-ipcountry')?.toLowerCase()  // Cloudflare
    || process.env.DEFAULT_REGION
    || 'default';
  
  // 添加到响应头，供后续使用
  response.headers.set('x-user-region', region);
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

#### 步骤 3.2: 创建地区检测 Utility

**创建**: `src/lib/utils/region-detection.ts`

```typescript
import { headers } from 'next/headers';

export async function getUserRegion(): Promise<string> {
  const headersList = await headers();
  
  return (
    headersList.get('x-user-region') ||
    headersList.get('x-vercel-ip-country')?.toLowerCase() ||
    headersList.get('cf-ipcountry')?.toLowerCase() ||
    process.env.DEFAULT_REGION ||
    'default'
  );
}
```

---

### Phase 4: 向量维度迁移（3-5 天）⚠️

**注意**: 这是可选步骤，仅当要从 OpenAI (1536维) 迁移到 bge-m3 (1024维) 时需要。

#### 步骤 4.1: 创建新的向量列

```sql
-- drizzle/migrations/0005_bge_m3_migration.sql
ALTER TABLE knowledge_documents 
ADD COLUMN embedding_1024 vector(1024);

CREATE INDEX idx_knowledge_documents_embedding_1024 
ON knowledge_documents 
USING hnsw (embedding_1024 vector_cosine_ops);
```

#### 步骤 4.2: 批量重新生成向量

```typescript
// scripts/migrate-embeddings-to-bge-m3.ts
import { db } from '@/db';
import { knowledgeDocuments } from '@/db/schema-knowledge';
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

async function migrateEmbeddings() {
  const service = getGlobalEmbeddingService({
    provider: 'siliconflow',  // 使用 bge-m3
  });
  
  const documents = await db.select().from(knowledgeDocuments);
  
  for (const doc of documents) {
    const result = await service.embed(doc.content);
    
    await db.update(knowledgeDocuments)
      .set({ embedding_1024: result.embedding })
      .where(eq(knowledgeDocuments.id, doc.id));
    
    console.log(`Migrated ${doc.id}`);
  }
}

migrateEmbeddings();
```

#### 步骤 4.3: 切换查询逻辑

```typescript
// src/lib/rag/vector-search.ts
export class VectorSearchService {
  async search(queryEmbedding: number[], options?: SearchOptions) {
    const embeddingColumn = queryEmbedding.length === 1024
      ? 'embedding_1024'
      : 'embedding';
    
    // 使用对应维度的列进行查询
  }
}
```

---

### Phase 5: 监控与优化（持续）

#### 步骤 5.1: 添加监控仪表盘

**创建**: `src/app/admin/embedding-stats/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function EmbeddingStatsPage() {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch('/api/admin/embedding-stats')
      .then((res) => res.json())
      .then(setStats);
  }, []);
  
  return (
    <div>
      <h1>Embedding 提供商统计</h1>
      <table>
        <thead>
          <tr>
            <th>提供商</th>
            <th>请求数</th>
            <th>总成本</th>
            <th>平均延迟</th>
          </tr>
        </thead>
        <tbody>
          {stats?.requestsByProvider.map((p) => (
            <tr key={p.provider}>
              <td>{p.provider}</td>
              <td>{p.count}</td>
              <td>${p.cost.toFixed(4)}</td>
              <td>{p.avgLatency}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### 步骤 5.2: 添加性能监控

**创建**: `src/lib/monitoring/embedding-monitor.ts`

```typescript
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

export class EmbeddingMonitor {
  private static instance: EmbeddingMonitor;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new EmbeddingMonitor();
    }
    return this.instance;
  }
  
  async getStats() {
    const service = getGlobalEmbeddingService();
    return service.getStats();
  }
  
  async checkHealth() {
    const service = getGlobalEmbeddingService();
    const testText = "健康检查";
    
    try {
      const result = await service.embed(testText);
      return {
        healthy: true,
        provider: result.provider,
        latency: result.latency,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }
}
```

---

## 📊 验收标准

### Phase 1: 准备阶段 ✅
- [ ] 已获取所有必需的 API Keys
- [ ] 环境变量配置正确
- [ ] 本地测试成功调用各提供商 API

### Phase 2: 核心迁移 ✅
- [ ] RAG 核心库已更新
- [ ] CLI 工具支持新服务
- [ ] Server Actions 集成地区检测
- [ ] 所有现有功能正常工作

### Phase 3: 地区检测 ✅
- [ ] Middleware 正确识别用户地区
- [ ] 不同地区自动选择最优提供商
- [ ] 中国用户使用硅基流动
- [ ] 欧美用户使用 OpenAI/Jina

### Phase 4: 向量迁移 ✅（可选）
- [ ] 数据库支持双维度向量
- [ ] 批量迁移脚本运行成功
- [ ] 查询逻辑支持双维度
- [ ] 性能测试通过

### Phase 5: 监控优化 ✅
- [ ] 监控仪表盘可访问
- [ ] 统计数据准确记录
- [ ] 告警机制正常工作
- [ ] 成本控制在预算内

---

## 🎯 性能目标

| 指标 | 当前值 | 目标值 | 改进 |
|------|--------|--------|------|
| **延迟 (中国)** | 150ms | < 100ms | 33% ⬆️ |
| **延迟 (欧美)** | 150ms | < 200ms | 稳定 ✅ |
| **延迟 (亚太)** | 150ms | < 150ms | 稳定 ✅ |
| **成本** | $0.005/查询 | $0.003/查询 | 40% ⬇️ |
| **可用性** | 99.5% | 99.9% | 0.4% ⬆️ |

---

## 💰 成本估算

### 当前成本（全部使用 OpenAI）
```
月查询量: 100K
单次成本: $0.005
月总成本: $500
```

### 迁移后成本（智能路由）
```
中国用户 (60%): 60K × $0 (硅基流动) = $0
亚太用户 (20%): 20K × $0.002 (Jina) = $40
欧美用户 (20%): 20K × $0.005 (OpenAI) = $100
------------------------------------------
月总成本: $140  (节省 72% 💰)
```

---

## ⚠️ 风险与应对

### 风险 1: 硅基流动免费额度用完
**应对**: 自动切换到阿里云灵积（成本仅 $0.0001/1K tokens）

### 风险 2: 某个提供商服务中断
**应对**: 自动 fallback 到备用提供商，用户无感知

### 风险 3: 向量维度迁移失败
**应对**: 保留原有 1536 维列，双维度并存过渡

### 风险 4: 地区检测不准确
**应对**: 允许用户手动选择地区，记住偏好设置

---

## 📅 时间线

```
Week 1:
- Day 1-2: Phase 1 准备阶段
- Day 3-5: Phase 2 核心迁移
- Day 6-7: Phase 3 地区检测

Week 2:
- Day 1-3: 测试和调优
- Day 4-5: Phase 4 向量迁移（可选）
- Day 6-7: Phase 5 监控搭建

Week 3:
- Day 1-7: 灰度发布和观察
```

---

## 🚀 下一步

1. **立即开始**: 注册硅基流动和 Jina AI 账号
2. **本周完成**: Phase 1-3 的实施
3. **下周评估**: 是否需要进行 Phase 4 向量维度迁移
4. **持续优化**: 根据监控数据调整路由策略

---

**创建时间**: 2025-01-12  
**预计完工**: 2025-01-26  
**负责人**: 开发团队