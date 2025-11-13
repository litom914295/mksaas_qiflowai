# 知识库Web管理界面

## 概述

Web界面的知识库管理系统，集成到超级管理后台，提供便捷的文档上传和管理功能。

## 访问路径

**URL**: `/admin/knowledge`  
**权限**: 仅限超级管理员

## 功能特性

### 1. 文档上传 📤

- ✅ **多文件上传**: 一次可选择多个文件上传
- ✅ **格式支持**: .txt, .md, .json
- ✅ **分类管理**: 预设分类 + 自定义分类
- ✅ **自动处理**: 上传后自动分块和向量化
- ✅ **实时反馈**: 显示上传进度和处理状态

#### 预设分类

| 分类值 | 中文名称 | 说明 |
|--------|---------|------|
| `bazi` | 八字命理 | 八字排盘、命理解读相关 |
| `fengshui` | 风水玄学 | 传统风水知识 |
| `xuankong` | 玄空风水 | 玄空飞星专项知识 |
| `general` | 通用知识 | 默认分类 |
| `custom` | 自定义 | 可输入任意分类名 |

#### 上传流程

```
1. 选择文件（可多选）
   └─> 支持 .txt, .md, .json 格式
   
2. 选择分类
   └─> 预设分类 或 自定义输入
   
3. 点击"开始上传"
   └─> 文件上传到服务器
   
4. 自动处理
   ├─> 文本分块（1000字符/块，200字符重叠）
   ├─> 生成向量嵌入（OpenAI Embeddings）
   └─> 存储到数据库（带向量索引）
   
5. 完成
   └─> 状态变更为"已完成"
```

### 2. 文档列表 📋

#### 显示信息

- **文件名**: 原始文件名和图标
- **分类**: 文档所属分类
- **大小**: 文件大小（自动格式化）
- **块数**: 分块后的文本块数量
- **状态**: 处理状态（等待中/处理中/已完成/错误）
- **上传时间**: 创建时间戳

#### 状态说明

| 状态 | 徽章颜色 | 说明 |
|------|---------|------|
| 等待中 | 灰色 | 已上传，等待处理 |
| 处理中 | 蓝色 | 正在分块和向量化 |
| 已完成 | 绿色 | 处理完成，可供查询 |
| 错误 | 红色 | 处理失败 |

### 3. 文档删除 🗑️

- **确认对话框**: 防止误删除
- **级联删除**: 自动删除相关的所有文本块和向量
- **不可恢复**: 删除后无法找回

### 4. 统计信息 📊

实时显示三个关键指标：

1. **总文档数**: 已上传的文档总数
2. **总块数**: 所有文档的文本块总和
3. **已完成**: 成功处理的文档数量

## 使用示例

### 示例1: 上传八字命理文档

```
1. 准备文件: bazi-basics.txt（包含八字基础知识）
2. 访问: /admin/knowledge
3. 选择文件: bazi-basics.txt
4. 选择分类: 八字命理 (bazi)
5. 点击: 开始上传
6. 等待: 约1-2分钟（取决于文件大小）
7. 完成: 状态显示"已完成"，块数显示为N
```

### 示例2: 批量上传自定义分类

```
1. 准备文件: doc1.md, doc2.md, doc3.txt
2. 访问: /admin/knowledge
3. 选择文件: 多选3个文件
4. 选择分类: 自定义
5. 输入分类名: "my-custom-category"
6. 点击: 开始上传
7. 完成: 3个文档全部处理完成
```

## 与CLI脚本的对比

| 特性 | Web界面 | CLI脚本 |
|------|---------|---------|
| 使用方式 | 浏览器点击操作 | 命令行执行 |
| 适用场景 | 单次少量文档 | 批量导入大量文档 |
| 技术要求 | 无需技术背景 | 需要终端操作经验 |
| 成本预览 | ❌ 不支持 | ✅ `--dry-run` 模式 |
| 批量能力 | 有限（浏览器限制） | 无限制 |
| 权限 | 需要登录管理后台 | 需要环境变量配置 |
| 实时反馈 | ✅ 实时状态更新 | ✅ CLI进度显示 |

**推荐使用场景**：

- **Web界面**: 日常维护，增量更新，少量文档（< 10个）
- **CLI脚本**: 初次导入，批量更新，大量文档（> 10个）

## API端点

### 1. 上传文档

```http
POST /api/admin/knowledge/upload
Content-Type: multipart/form-data

Body:
- category: string (分类名)
- files: File[] (文件列表)

Response:
{
  "success": true,
  "processed": 3,
  "files": ["file1.txt", "file2.md", "file3.json"]
}
```

### 2. 获取文档列表

```http
GET /api/admin/knowledge/list

Response:
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "category": "bazi",
      "file_name": "bazi-basics.txt",
      "file_size": 15000,
      "chunk_count": 15,
      "status": "completed",
      "created_at": "2025-01-13T10:00:00Z"
    }
  ]
}
```

### 3. 删除文档

```http
POST /api/admin/knowledge/delete
Content-Type: application/json

Body:
{
  "documentId": "uuid"
}

Response:
{
  "success": true,
  "message": "文档及其所有块已删除"
}
```

## 数据库Schema

### knowledge_documents 表

```sql
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  chunk_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 与 knowledge_chunks 的关系

- `knowledge_documents`: 存储文档元数据
- `knowledge_chunks`: 存储实际的文本块和向量
- 关联: `chunks.metadata.document_id = documents.id`

## 成本估算

使用 OpenAI `text-embedding-3-small` 模型：

| 文件大小 | 预估Tokens | 预估成本 |
|---------|-----------|---------|
| 10 KB | ~6,000 | $0.0001 |
| 100 KB | ~60,000 | $0.001 |
| 1 MB | ~600,000 | $0.01 |

**建议**：
- 单个文件建议 < 500KB
- 批量上传建议 < 10个文件/次
- 总成本应 < $0.50（约50万tokens）

## 故障排查

### 问题1: 上传后状态一直显示"处理中"

**可能原因**：
- OpenAI API配额不足
- API Key未配置或无效
- 网络问题

**解决方案**：
```sql
-- 查看错误信息
SELECT id, file_name, status, error_message 
FROM knowledge_documents 
WHERE status = 'processing' 
AND created_at < NOW() - INTERVAL '10 minutes';

-- 检查环境变量
echo $OPENAI_API_KEY
```

### 问题2: 文档上传失败

**可能原因**：
- 文件格式不支持
- 文件编码问题
- 文件大小超限

**解决方案**：
1. 确认文件格式为 .txt, .md, .json
2. 确认文件编码为 UTF-8
3. 减小文件大小（< 1MB）

### 问题3: 删除文档后仍在知识库中

**可能原因**：
- 文本块未完全删除
- 向量索引未更新

**解决方案**：
```sql
-- 手动清理孤立的文本块
DELETE FROM knowledge_chunks 
WHERE metadata->>'document_id' NOT IN (
  SELECT id FROM knowledge_documents
);
```

## 最佳实践

### 1. 文档命名

✅ **推荐**：
- `bazi-basics.txt`
- `fengshui-guide-2024.md`
- `xuankong-flying-stars.json`

❌ **不推荐**：
- `doc1.txt`
- `untitled.md`
- `新建文本文档.txt`

### 2. 文档组织

按分类整理文档：
```
docs/
├── bazi/
│   ├── basics.txt
│   ├── advanced.md
│   └── terminology.json
├── fengshui/
│   ├── intro.txt
│   └── principles.md
└── xuankong/
    └── flying-stars.txt
```

### 3. 更新策略

- **增量更新**: 添加新文档时直接上传
- **全量更新**: 先删除旧分类的所有文档，再重新上传
- **版本控制**: 在文件名中包含版本号（如 `basics-v2.txt`）

### 4. 安全建议

- ✅ 定期备份 `knowledge_documents` 表
- ✅ 限制管理员账号数量
- ✅ 记录文档上传日志
- ❌ 不要上传敏感或私密信息

## 集成到管理后台

### 添加导航菜单

编辑管理后台导航配置，添加知识库入口：

```tsx
// src/config/admin-nav.ts
export const adminNav = [
  // ... 其他菜单项
  {
    title: '知识库管理',
    href: '/admin/knowledge',
    icon: Database,
    description: '管理RAG知识库文档',
  },
  {
    title: 'AI成本监控',
    href: '/admin/ai-cost',
    icon: DollarSign,
    description: '监控AI使用成本',
  },
  // ...
];
```

## 总结

Web界面管理系统为知识库提供了：

✅ **易用性**: 点击操作，无需命令行  
✅ **实时性**: 即时查看处理状态  
✅ **安全性**: 管理员权限控制  
✅ **可视化**: 统计信息一目了然  

同时保留CLI脚本用于批量操作和自动化场景。

---

**相关文档**：
- [Week 2 RAG和监控系统](./week2-rag-and-monitoring.md)
- [CLI脚本使用](../scripts/ingest-knowledge-base.ts)
