# AI增强分析功能文档

## 概述

AI增强分析是 QiFlowAI 项目中的高级功能，使用 AI SDK (OpenAI) 为八字命理分析提供更深入、更个性化的解读。

## 架构

### 1. 服务层 (Service Layer)

#### `ai-enhanced-analysis.ts`
位置: `src/lib/services/ai-enhanced-analysis.ts`

主要功能:
- **generateAIEnhancedAnalysis()**: 生成完整的AI增强分析（包括性格、事业、财运、感情、健康）
- **generateQuickAIAnalysis()**: 生成快速概览分析
- 各个维度的独立分析函数

配置:
```typescript
const AI_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1500,
  systemPrompt: '...' // 专业命理大师的系统提示词
};
```

### 2. API路由 (API Routes)

#### `/api/analysis/ai-enhanced`
位置: `src/app/api/analysis/ai-enhanced/route.ts`

**POST** - 生成AI增强分析
```typescript
// 请求
{
  birthDate: "1990-01-01",
  birthTime: "12:30",
  gender: "male",
  isQuickAnalysis: false,  // 可选
  userId: "user123"         // 可选
}

// 响应
{
  success: true,
  data: {
    baziResult: { ... },
    aiAnalysis: {
      personality: "...",
      career: "...",
      wealth: "...",
      relationship: "...",
      health: "...",
      summary: "...",
      generatedAt: "2024-01-01T12:00:00Z"
    },
    isQuickAnalysis: false
  }
}
```

**GET** - 检查服务状态
```typescript
// 响应
{
  success: true,
  data: {
    available: true,
    message: "AI增强分析服务可用"
  }
}
```

### 3. 客户端Hooks (Client Hooks)

#### `useAIEnhancedAnalysis`
位置: `src/hooks/useAIEnhancedAnalysis.ts`

用法:
```typescript
import { useAIEnhancedAnalysis } from '@/hooks/useAIEnhancedAnalysis';

function MyComponent() {
  const { 
    isLoading, 
    error, 
    aiAnalysis, 
    baziResult,
    generateAnalysis,
    reset 
  } = useAIEnhancedAnalysis();

  const handleAnalyze = async () => {
    await generateAnalysis({
      birthDate: '1990-01-01',
      birthTime: '12:30',
      gender: 'male',
      isQuickAnalysis: false,
      userId: 'optional-user-id'
    });
  };

  if (isLoading) return <div>生成中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!aiAnalysis) return <button onClick={handleAnalyze}>开始分析</button>;

  return <AIEnhancedResults analysis={aiAnalysis} />;
}
```

#### `useAIServiceStatus`
用于检查AI服务是否可用:
```typescript
const { available, message, checkStatus } = useAIServiceStatus();

useEffect(() => {
  checkStatus();
}, []);
```

### 4. UI组件 (UI Components)

#### `AIEnhancedResults`
位置: `src/components/analysis/AIEnhancedResults.tsx`

功能:
- 展示完整的AI分析结果
- 支持快速分析和完整分析两种模式
- 使用标签页组织不同维度的分析
- 响应式设计，支持移动端

用法:
```typescript
import { AIEnhancedResults } from '@/components/analysis/AIEnhancedResults';

<AIEnhancedResults 
  analysis={aiAnalysis}
  isQuickAnalysis={false}
  locale="zh-CN"
/>
```

#### `AIEnhancedResultsSkeleton`
加载骨架屏:
```typescript
import { AIEnhancedResultsSkeleton } from '@/components/analysis/AIEnhancedResults';

{isLoading && <AIEnhancedResultsSkeleton />}
```

## 集成到现有页面

### 示例：集成到 guest-analysis 页面

```typescript
'use client';

import { useState } from 'react';
import { useAIEnhancedAnalysis } from '@/hooks/useAIEnhancedAnalysis';
import { AIEnhancedResults, AIEnhancedResultsSkeleton } from '@/components/analysis/AIEnhancedResults';
import { Button } from '@/components/ui/button';

export default function GuestAnalysisPage() {
  const [birthData, setBirthData] = useState({
    birthDate: '',
    birthTime: '',
    gender: 'male' as const
  });

  const { 
    isLoading, 
    error, 
    aiAnalysis,
    generateAnalysis 
  } = useAIEnhancedAnalysis();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateAnalysis({
      ...birthData,
      isQuickAnalysis: false
    });
  };

  return (
    <div className="container mx-auto p-6">
      <form onSubmit={handleSubmit}>
        {/* 表单输入 */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '分析中...' : '开始AI增强分析'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && <AIEnhancedResultsSkeleton />}

      {aiAnalysis && (
        <AIEnhancedResults 
          analysis={aiAnalysis}
          locale="zh-CN"
        />
      )}
    </div>
  );
}
```

## 环境配置

### 必需的环境变量

在 `.env.local` 中添加:

```bash
# OpenAI API配置
OPENAI_API_KEY=sk-your-api-key-here

# 可选: 自定义API端点
OPENAI_API_BASE_URL=https://api.openai.com/v1
```

### 安装依赖

```bash
npm install ai @ai-sdk/openai
```

## 性能优化

### 1. 并行处理
所有分析维度（性格、事业、财运等）并行生成，减少总耗时。

### 2. 错误降级
当AI服务不可用时，自动回退到基础分析:
```typescript
try {
  aiAnalysis = await generateAIEnhancedAnalysis(baziResult);
} catch (error) {
  // 返回基础分析
  return {
    personality: '性格温和稳重',
    career: baziResult.careerGuidance,
    // ...
  };
}
```

### 3. 请求缓存
建议在前端实现结果缓存:
```typescript
const cacheKey = `ai-analysis-${birthDate}-${birthTime}-${gender}`;
const cached = localStorage.getItem(cacheKey);
if (cached) {
  return JSON.parse(cached);
}
```

## 成本控制

### Token使用估算
每次完整分析约消耗:
- 输入: ~300 tokens
- 输出: ~1500 tokens × 6 (5个维度 + 总结)
- 总计: ~9300 tokens ≈ $0.28 (GPT-4定价)

### 优化建议
1. **使用快速分析模式**
   - 仅生成概要，减少至约2000 tokens
   
2. **限制频率**
   - 实现速率限制（如每用户每日3次）
   
3. **使用更经济的模型**
   ```typescript
   model: 'gpt-3.5-turbo' // 成本降低90%
   ```

4. **缓存结果**
   - 相同输入使用缓存结果

## 测试

### 单元测试
```bash
npm run test -- ai-enhanced-analysis
```

### API测试
```bash
curl -X POST http://localhost:3000/api/analysis/ai-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:30",
    "gender": "male",
    "isQuickAnalysis": true
  }'
```

### 服务状态检查
```bash
curl http://localhost:3000/api/analysis/ai-enhanced
```

## 监控与日志

### 关键指标
- AI API响应时间
- 成功率
- Token消耗
- 用户满意度

### 日志记录
所有AI调用都有错误日志:
```typescript
console.error('AI增强分析生成失败:', error);
```

建议在生产环境集成:
- Sentry (错误追踪)
- Datadog (性能监控)
- OpenAI Dashboard (token使用)

## 安全考虑

1. **API密钥保护**
   - 仅在服务器端使用
   - 使用环境变量，不提交到版本控制

2. **输入验证**
   - 使用Zod验证所有输入
   - 防止注入攻击

3. **速率限制**
   - 防止滥用
   - 保护API配额

4. **用户隐私**
   - 不记录敏感信息到日志
   - 符合GDPR/数据保护法规

## 故障排查

### 常见问题

**1. "AI服务未配置"**
- 检查 `OPENAI_API_KEY` 环境变量
- 确保重启了开发服务器

**2. "AI服务暂时不可用"**
- 检查OpenAI API状态
- 验证API密钥有效性
- 检查账户余额

**3. 响应太慢**
- 考虑使用 `isQuickAnalysis: true`
- 实现客户端超时
- 使用更快的模型

**4. 返回内容不理想**
- 调整 `systemPrompt`
- 修改 `temperature` (0.7 更均衡，1.0 更创意)
- 优化prompt细节

## 未来改进

1. **多模型支持**
   - Claude, Gemini等
   - 自动选择最佳模型

2. **流式输出**
   - 使用 `streamText()` API
   - 实时展示生成内容

3. **多语言支持**
   - 根据 locale 调整prompt
   - 支持英文、日文等

4. **个性化调优**
   - 基于用户反馈优化
   - A/B测试不同prompt

## 相关文件

- 服务: `src/lib/services/ai-enhanced-analysis.ts`
- API: `src/app/api/analysis/ai-enhanced/route.ts`
- Hook: `src/hooks/useAIEnhancedAnalysis.ts`
- 组件: `src/components/analysis/AIEnhancedResults.tsx`
- 类型: `src/lib/services/bazi-calculator-service.ts` (BaziAnalysisResult)

## 许可与致谢

基于 Vercel AI SDK 构建
- 文档: https://sdk.vercel.ai/docs
- GitHub: https://github.com/vercel/ai
