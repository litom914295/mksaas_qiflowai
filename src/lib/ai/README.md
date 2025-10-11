# AI 集成模块

本模块实现了多供应商 AI 服务集成，支持成本控制、容灾切换和智能路由。

## 功能特性

- **多供应商支持**: OpenAI, Anthropic Claude, Google Gemini, DeepSeek
- **智能路由**: 自动故障转移和负载均衡
- **成本控制**: 四层处理策略 (缓存→模板→精简LLM→完整LLM)
- **数据去敏化**: 自动移除敏感信息
- **模板引擎**: 预定义提示模板
- **健康检查**: 实时监控供应商状态

## 快速开始

### 1. 环境配置

复制 `env.example` 到 `.env.local` 并配置 API 密钥：

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Gemini
GEMINI_API_KEY=AI...

# DeepSeek
DEEPSEEK_API_KEY=sk-...
```

### 2. 基础使用

```typescript
import { createRouter, templateEngine, sanitizeForAI } from '@/lib/ai';

// 创建路由器
const router = createRouter({
  order: ['openai', 'anthropic', 'gemini', 'deepseek'],
  allowFallback: true,
});

// 发送请求
const response = await router.chat({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'user', content: '你好，请帮我分析一下风水' }
  ],
  userId: 'user123',
});
```

### 3. 使用模板

```typescript
import { templateEngine } from '@/lib/ai';

const prompt = templateEngine.render('fengshui.analysis', {
  flyingStars: { /* 飞星数据 */ },
  houseLayout: { /* 户型数据 */ }
});
```

### 4. API 路由使用

```typescript
// POST /api/ai/chat
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: '你好' }],
    templateName: 'fengshui.analysis',
    metadata: { /* 分析数据 */ }
  }),
});
```

## 四层处理策略

1. **缓存层**: 检查内存缓存，避免重复请求
2. **模板层**: 使用预定义模板生成响应
3. **精简层**: 使用低成本模型 (gpt-4o-mini, claude-3-haiku)
4. **完整层**: 使用高质量模型 (gpt-4o, claude-3.5-sonnet)

## 成本控制

- 自动估算每次请求的成本
- 支持用户级别的预算限制
- 记录使用统计和成本分析

## 供应商配置

### OpenAI
- 支持官方 API 和兼容接口
- 模型: gpt-4o, gpt-4o-mini, gpt-4-turbo

### Anthropic
- Claude 3.5 Sonnet, Claude 3 Haiku
- 支持最新模型版本

### Google Gemini
- Gemini 1.5 Pro, Gemini 1.5 Flash
- 高性价比选择

### DeepSeek
- DeepSeek Chat, DeepSeek Reasoner
- 国内访问友好

## 扩展开发

### 添加新供应商

1. 在 `src/lib/ai/providers/` 创建客户端
2. 在 `router.ts` 中注册
3. 在 `pricing.ts` 中添加价格信息

### 自定义模板

在 `templates.ts` 中添加新模板：

```typescript
const templates: Record<TemplateName, string> = {
  'your.template': `你的模板内容 {{json}}`,
  // ...
};
```

## 监控和调试

- 健康检查: `GET /api/ai/chat`
- 成本统计: 查看 `recordUsage` 记录
- 错误日志: 检查控制台输出

## 最佳实践

1. **优先使用模板**: 减少 AI 调用成本
2. **合理设置预算**: 避免意外费用
3. **监控使用量**: 定期检查成本统计
4. **测试容灾**: 确保供应商切换正常
