# Week 2: RAG知识库集成 + AI成本监控系统

完成时间：Week 2（4天）

## 功能概述

### 1. RAG知识库集成 ✅
- **数据摄取脚本**：从文档自动导入到向量数据库
- **向量搜索服务**：支持语义搜索和知识检索
- **RAG生成器**：结合检索结果增强AI回答

### 2. AI成本监控系统 ✅
- **实时成本追踪**：监控每日和每月AI使用成本
- **预算管理**：设置限额和自动告警
- **成本仪表板**：可视化展示成本趋势和模型使用分布
- **数据导出**：支持CSV格式导出成本报告

---

## 1. RAG知识库集成

### 1.1 数据摄取脚本

**位置**：`scripts/ingest-knowledge-base.ts`

#### 功能特性

- ✅ 支持多种文档格式（.txt, .md, .json）
- ✅ 自动文本分块（可配置分块大小和重叠）
- ✅ 批量向量化处理（OpenAI Embeddings）
- ✅ 成本估算和实际成本跟踪
- ✅ 增量和强制更新模式
- ✅ 彩色CLI输出和进度显示

#### 使用方法

```bash
# 基础使用 - 摄取默认目录的文档
pnpm tsx scripts/ingest-knowledge-base.ts

# 指定源目录和分类
pnpm tsx scripts/ingest-knowledge-base.ts \
  --source ./docs/bazi \
  --category bazi

# 预览模式（不实际写入数据库）
pnpm tsx scripts/ingest-knowledge-base.ts --dry-run

# 强制模式（删除旧数据后重新导入）
pnpm tsx scripts/ingest-knowledge-base.ts \
  --force \
  --category fengshui

# 自定义分块参数
pnpm tsx scripts/ingest-knowledge-base.ts \
  --chunk-size 1500 \
  --chunk-overlap 300

# 查看帮助
pnpm tsx scripts/ingest-knowledge-base.ts --help
```

#### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--source <path>` | 源目录路径 | `./docs/knowledge` |
| `--category <name>` | 文档分类标签 | `general` |
| `--chunk-size <num>` | 文本块大小（字符数） | `1000` |
| `--chunk-overlap <num>` | 文本块重叠（字符数） | `200` |
| `--dry-run` | 预览模式，不实际写入 | `false` |
| `--force` | 删除已有同类别数据 | `false` |

#### 文档结构示例

```
docs/
└── knowledge/
    ├── bazi/
    │   ├── introduction.md
    │   ├── five-elements.txt
    │   └── terminology.json
    └── fengshui/
        ├── basics.md
        └── flying-stars.txt
```

#### 成本说明

使用 `text-embedding-3-small` 模型：
- **价格**：$0.00002 per 1K tokens
- **估算**：50万tokens（约30-50万字中文）≈ $0.01（约0.07元）
- **建议**：首次运行使用 `--dry-run` 查看预估成本

### 1.2 RAG服务使用

项目已集成完整的RAG服务，无需额外配置：

```typescript
import { quickRAG } from '@/lib/rag';

// 快速RAG查询
const response = await quickRAG(
  '什么是八字命理？', 
  { category: 'bazi', topK: 3 }
);

console.log(response.answer); // AI生成的答案
console.log(response.sources); // 引用的知识来源
```

---

## 2. AI成本监控系统

### 2.1 成本监控仪表板

**前端组件**：`src/components/admin/ai-cost-dashboard.tsx`  
**访问路径**：`/admin/ai-cost` (需要管理员权限)

#### 功能特性

- ✅ **实时监控**：今日和本月成本实时显示
- ✅ **预算追踪**：可视化进度条显示预算使用情况
- ✅ **趋势分析**：日变化和月度预测
- ✅ **模型分布**：Top 5模型使用情况和成本占比
- ✅ **自动告警**：接近或超过预算时显示警告横幅
- ✅ **数据导出**：一键导出CSV格式报告
- ✅ **自动刷新**：每分钟自动更新数据

#### 显示指标

1. **今日成本**
   - 已使用金额
   - 预算限额
   - 使用百分比
   - 进度条可视化

2. **本月成本**
   - 月度总计
   - 月度预算
   - 使用百分比
   - 超支预警

3. **日变化**
   - 较昨日变化百分比
   - 增长趋势指示
   - 异常增长告警

4. **月度预测**
   - 基于当前进度的月底预测
   - 超支风险评估
   - 预算内/超支标记

5. **模型使用分布**
   - 各模型请求次数
   - 各模型成本
   - 成本占比百分比

### 2.2 后端API

#### 获取成本数据

**接口**：`GET /api/admin/ai-cost/dashboard`  
**权限**：仅管理员

**响应示例**：

```json
{
  "success": true,
  "data": {
    "daily": {
      "used": 2.5678,
      "limit": 50,
      "remaining": 47.4322,
      "percentage": 5.14
    },
    "monthly": {
      "used": 125.34,
      "limit": 1000,
      "remaining": 874.66,
      "percentage": 12.53
    },
    "nearLimit": false,
    "overLimit": false,
    "trends": {
      "dailyChange": 0.15,
      "monthlyProjection": 385.24
    },
    "topModels": [
      {
        "model": "gpt-4o-mini",
        "requests": 1250,
        "cost": 45.32,
        "percentage": 36.15
      }
    ]
  }
}
```

#### 导出成本报告

**接口**：`POST /api/admin/ai-cost/export`  
**权限**：仅管理员  
**响应**：CSV文件下载

**CSV格式**：

```csv
Date,Time,User ID,Model,Prompt Tokens,Completion Tokens,Total Tokens,Cost (USD),Request Type
2025-01-13,10:30:45,user123,gpt-4o-mini,250,180,430,0.000065,chat
2025-01-13,10:28:12,user456,deepseek-chat,320,240,560,0.000157,completion
...
```

### 2.3 成本追踪集成

项目已自动集成成本追踪，AI调用会自动记录：

```typescript
import { estimateCostUsd, recordUsage } from '@/lib/ai/cost';

// AI调用后自动记录成本
const cost = estimateCostUsd(
  'gpt-4o-mini',
  promptTokens,
  completionTokens
);

await recordUsage(userId, cost);
```

### 2.4 预算配置

**当前默认预算**：

```typescript
const dailyLimit = 50;     // $50/day
const monthlyLimit = 1000; // $1000/month
```

**修改预算**：

编辑 `src/app/api/admin/ai-cost/dashboard/route.ts`：

```typescript
// 第76-77行
const dailyLimit = 100;    // 修改为 $100/day
const monthlyLimit = 2000; // 修改为 $2000/month
```

### 2.5 告警机制

#### 自动告警阈值

- **近限警告**：使用量 > 80%
- **超限警告**：使用量 ≥ 100%

#### 前端显示

- **黄色横幅**：接近预算限制（80-99%）
- **红色横幅**：预算已超限（≥100%）
- **邮件通知**：（需额外配置）

---

## 3. 数据库Schema

### 3.1 knowledge_chunks表（RAG）

```sql
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 向量相似度搜索索引
CREATE INDEX idx_knowledge_embedding ON knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops);

-- 分类索引
CREATE INDEX idx_knowledge_category ON knowledge_chunks(category);
```

### 3.2 ai_cost_tracking表（成本监控）

```sql
CREATE TABLE ai_cost_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  model VARCHAR(100),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd DECIMAL(10, 6),
  request_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- 索引
CREATE INDEX idx_cost_user ON ai_cost_tracking(user_id);
CREATE INDEX idx_cost_created ON ai_cost_tracking(created_at);
CREATE INDEX idx_cost_model ON ai_cost_tracking(model);
```

---

## 4. 最佳实践

### 4.1 RAG知识库管理

1. **文档组织**
   - 按主题分类存放（如 bazi/, fengshui/）
   - 使用有意义的文件名
   - 保持文档格式一致

2. **更新策略**
   - 定期审查和更新过时内容
   - 使用 `--force` 重新导入更新的分类
   - 增量导入新分类时不使用 `--force`

3. **成本控制**
   - 首次导入使用 `--dry-run` 预估成本
   - 合理设置分块大小（推荐1000-1500字符）
   - 批量处理文档以减少API调用

### 4.2 AI成本优化

1. **模型选择**
   - 优先使用 `gpt-4o-mini` 或 `deepseek-chat`
   - 复杂任务才使用 `gpt-4o`
   - 避免过度使用昂贵模型

2. **请求优化**
   - 实施用户级速率限制
   - 使用缓存减少重复请求
   - 合理设置 token 限制

3. **监控策略**
   - 每日查看成本仪表板
   - 设置预算告警阈值
   - 定期导出和分析成本报告
   - 审查高成本用户和异常模式

---

## 5. 故障排查

### 5.1 RAG摄取失败

**问题**：向量化失败或数据库连接错误

**解决方案**：

```bash
# 1. 检查环境变量
echo $OPENAI_API_KEY
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 2. 验证API Key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 3. 测试数据库连接
psql $DATABASE_URL -c "SELECT 1;"

# 4. 使用dry-run模式测试
pnpm tsx scripts/ingest-knowledge-base.ts --dry-run
```

### 5.2 成本监控数据不显示

**问题**：仪表板显示空数据或加载失败

**解决方案**：

1. 检查管理员权限
2. 验证 `ai_cost_tracking` 表存在且有数据
3. 检查浏览器控制台错误信息
4. 确认API路由正常响应

```sql
-- 检查成本记录
SELECT COUNT(*), SUM(cost_usd) FROM ai_cost_tracking;

-- 检查今日数据
SELECT * FROM ai_cost_tracking 
WHERE created_at >= CURRENT_DATE 
LIMIT 10;
```

---

## 6. 后续优化建议

### 6.1 RAG增强

- [ ] 支持更多文档格式（PDF, DOCX）
- [ ] 实现混合搜索（关键词 + 语义）
- [ ] 添加文档版本控制
- [ ] 实现自动文档摘要

### 6.2 成本监控增强

- [ ] 集成邮件/Slack告警通知
- [ ] 实现自动限流机制
- [ ] 添加按用户/部门的成本分析
- [ ] 生成月度成本优化报告
- [ ] 实现成本趋势预测模型

### 6.3 性能优化

- [ ] 实施向量搜索缓存
- [ ] 优化数据库查询性能
- [ ] 添加成本数据归档策略
- [ ] 实现异步批量处理

---

## 7. 相关文件清单

### 新增文件

```
scripts/
└── ingest-knowledge-base.ts          # RAG数据摄取脚本

src/
├── components/
│   └── admin/
│       └── ai-cost-dashboard.tsx     # 成本监控仪表板组件
└── app/
    └── api/
        └── admin/
            └── ai-cost/
                ├── dashboard/
                │   └── route.ts       # 成本数据API
                └── export/
                    └── route.ts       # 成本导出API

docs/
└── week2-rag-and-monitoring.md       # 本文档
```

### 现有文件（已有实现）

```
src/lib/
├── rag/
│   ├── index.ts                      # RAG统一导出
│   ├── text-chunker.ts              # 文本分块
│   ├── embedding-service.ts         # 向量化服务
│   ├── vector-search.ts             # 向量搜索
│   └── rag-generator.ts             # RAG生成器
└── ai/
    └── cost.ts                       # 成本追踪核心逻辑
```

---

## 8. 总结

Week 2 已完成的核心功能：

✅ **RAG知识库集成**
  - 完整的数据摄取流程
  - 自动向量化和索引
  - 成本控制和预览

✅ **AI成本监控系统**
  - 实时成本追踪
  - 可视化仪表板
  - 预算管理和告警
  - CSV数据导出

这些功能为项目提供了：
1. 增强的AI回答质量（通过RAG）
2. 透明的成本可见性
3. 有效的预算控制
4. 数据驱动的优化决策

**预计成本节省**：通过优化模型选择和实施限流，可节省20-40%的AI使用成本。
