# AI 流式传输 - 使用指南

## 概述

本项目的 AI Chat 功能已升级为**流式传输**（Streaming），参考 mksaas 模板的最佳实践，使用 **Vercel AI SDK** 实现。

### 主要优势

- ✅ **快速响应**：首字节时间 (TTFB) < 1s
- ✅ **逐字显示**：实时流式输出，无白屏等待
- ✅ **多云支持**：OpenAI、DeepSeek、Gemini 自动回退
- ✅ **上下文增强**：智能感知用户八字/风水数据
- ✅ **Edge Runtime**：使用 Vercel Edge Functions 部署

---

## 架构

### 后端

```
/api/ai/chat (流式传输入口)
    ↓
handleStreamChat (核心处理器)
    ↓
Provider 管理 (OpenAI/DeepSeek/Gemini)
    ↓
Vercel AI SDK streamText
    ↓
Data Stream Response (SSE)
```

**关键文件**：
- `src/server/ai/providers.ts` - Provider 配置
- `src/server/ai/stream-chat.ts` - 流式处理核心
- `src/app/api/ai/chat/route.ts` - API 路由 (Edge Runtime)

### 前端

```
ai-chat-with-context.tsx (悬浮球组件)
    ↓
streamChat (工具函数)
    ↓
readStreamResponse (流式读取)
    ↓
onUpdate (逐块更新 UI)
```

**关键文件**：
- `src/utils/chat-stream.ts` - 前端流式读取工具
- `src/components/qiflow/ai-chat-with-context.tsx` - 悬浮球组件

---

## 环境变量配置

### 必需配置（至少一个）

```bash
# OpenAI (推荐)
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选

# DeepSeek (推荐，性价比高)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1  # 可选

# Google Gemini
GOOGLE_API_KEY=AIza...
# 或
GEMINI_API_KEY=AIza...
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta  # 可选
```

### 可选配置

```bash
# 应急开关：禁用流式传输（回退到旧逻辑）
AI_STREAMING_ENABLED=true  # 默认为 true
```

---

## API 使用

### 请求格式

**端点**: `POST /api/ai/chat`

**请求体**:
```json
{
  "messages": [
    { "role": "user", "content": "我的财运如何？" }
  ],
  "context": "用户八字：癸水日主，五行分析...",
  "enableContext": true,
  "provider": "deepseek",  // 可选：openai | deepseek | gemini
  "temperature": 0.7,      // 可选：0-2
  "includeReasoning": false  // 可选：是否包含推理过程
}
```

### 响应格式 (Data Stream)

Vercel AI SDK Data Stream 格式：
```
0:"你"
0:"好"
0:"！"
0:"根据"
0:"你的"
0:"八字"
...
```

前端使用 `readStreamResponse` 自动解析并拼接。

---

## 前端集成示例

### 基础用法

```typescript
import { streamChat } from '@/utils/chat-stream';

await streamChat(
  [{ role: 'user', content: '我的财运如何？' }],
  contextSummary,  // 上下文字符串
  {
    onStart: () => console.log('开始接收'),
    onUpdate: (content) => console.log('当前内容:', content),
    onFinish: () => console.log('接收完成'),
    onError: (error) => console.error('错误:', error),
  }
);
```

### 在 React 组件中使用

```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);

const handleSend = async (userInput: string) => {
  // 1. 添加用户消息
  const userMsg = { id: '1', role: 'user', content: userInput };
  setMessages(prev => [...prev, userMsg]);

  // 2. 创建 AI 占位消息
  const aiMsg = { id: '2', role: 'assistant', content: '', isThinking: true };
  setMessages(prev => [...prev, aiMsg]);
  setIsLoading(true);

  // 3. 流式接收 AI 响应
  await streamChat(
    [{ role: 'user', content: userInput }],
    undefined,
    {
      onStart: () => {
        setMessages(prev =>
          prev.map(m => m.id === '2' ? { ...m, isThinking: false } : m)
        );
      },
      onUpdate: (content) => {
        setMessages(prev =>
          prev.map(m => m.id === '2' ? { ...m, content } : m)
        );
      },
      onFinish: () => setIsLoading(false),
    }
  );
};
```

---

## Provider 优先级与回退

系统会按以下顺序尝试 Provider：

1. **用户指定的 Provider**（如果在请求中指定且可用）
2. **默认优先级**：DeepSeek → OpenAI → Gemini
3. **自动回退**：如果首选 Provider 失败，自动切换到下一个可用 Provider

### 成本优化建议

- **DeepSeek**：性价比最高，适合大量请求
- **OpenAI gpt-4o-mini**：质量与成本平衡
- **Gemini**：Google 生态，速度快

---

## 性能指标

### 开发环境 (本地)
- **TTFB**: 200-600ms
- **首字显示**: < 1s
- **完整响应**: 取决于回答长度

### 生产环境 (Vercel Edge)
- **TTFB**: 100-400ms
- **首字显示**: < 500ms
- **全球分发**: Vercel Edge Network

---

## 故障排查

### 问题 1: 所有 Provider 都不可用

**错误信息**: `No AI provider available`

**解决方案**:
```bash
# 检查环境变量
echo $DEEPSEEK_API_KEY
echo $OPENAI_API_KEY
echo $GOOGLE_API_KEY

# 确保至少配置一个
```

### 问题 2: 流式传输中断

**可能原因**:
- 网络超时
- Provider API 限流
- Edge Runtime 超时 (30s)

**解决方案**:
- 检查网络连接
- 降低 `temperature` 值
- 缩短输入内容

### 问题 3: 前端不显示逐字效果

**检查项**:
1. 确认后端返回 Data Stream 格式
2. 前端是否正确使用 `readStreamResponse`
3. 浏览器控制台是否有错误

---

## 开发与调试

### 启用详细日志

在 `src/server/ai/stream-chat.ts` 中：
```typescript
console.log(`[Stream Chat] Using provider: ${provider}`);
console.log(`[Stream Chat] Context length: ${contextSummary.length}`);
```

### 测试 API

```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好"}],
    "enableContext": false
  }'
```

---

## 安全与最佳实践

### ✅ 安全措施

1. **API Key 保护**：所有密钥仅在服务端访问
2. **输入验证**：使用 Zod 验证所有请求
3. **错误处理**：不泄露内部错误详情
4. **速率限制**：建议配置 Vercel 速率限制

### ✅ 最佳实践

1. **缓存策略**：对相同问题缓存响应
2. **流量控制**：高峰期自动降级到更便宜的 Provider
3. **监控告警**：配置 Vercel Analytics 监控 TTFB
4. **成本控制**：设置每月 API 调用上限

---

## 参考资料

- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [Next.js Edge Runtime](https://nextjs.org/docs/api-reference/edge-runtime)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [OpenAI API 文档](https://platform.openai.com/docs)

---

## 更新日志

### v1.0.0 (2025-01-04)
- ✅ 实现流式传输
- ✅ 支持多 Provider 自动回退
- ✅ 上下文增强
- ✅ Edge Runtime 部署
- ✅ 前端逐字显示动画
