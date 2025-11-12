# 全球智能路由 Embedding 配置指南

## 🌍 地区路由策略

### 自动选择逻辑
```
中国大陆 → 硅基流动 (免费) → 阿里灵积 → Jina AI → OpenAI
亚太地区 → Jina AI (便宜) → OpenAI → 硅基流动
欧美地区 → OpenAI (稳定) → Jina AI
```

---

## 📝 环境变量配置

```env
# .env.local

# 可选：指定默认地区（用于服务端渲染）
DEFAULT_REGION=cn  # cn, us, sg, jp, etc.

# OpenAI (必需 - 欧美地区)
OPENAI_API_KEY=sk-...

# 硅基流动 (推荐 - 中国地区)
SILICONFLOW_API_KEY=sk-...

# Jina AI (推荐 - 亚太地区)
JINA_API_KEY=jina_...

# 阿里云灵积 (可选 - 中国企业版)
DASHSCOPE_API_KEY=sk-...
```

---

## 🚀 快速开始

### 1. 基础用法

```typescript
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

// 自动选择提供商
const service = getGlobalEmbeddingService({
  provider: 'auto',
  userRegion: 'cn',  // 可选：手动指定地区
});

const result = await service.embed("八字中的食神");
console.log(result.provider);  // "siliconflow"
console.log(result.embedding.length);  // 1024
```

### 2. 强制使用特定提供商

```typescript
// 强制使用 OpenAI
const service = getGlobalEmbeddingService({
  provider: 'openai',
  forceProvider: true,
});
```

### 3. 在 Next.js API Route 中使用

```typescript
// app/api/embed/route.ts
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

export async function POST(req: Request) {
  const { text } = await req.json();
  
  // 从请求头获取地区
  const region = req.headers.get('cf-ipcountry')?.toLowerCase();
  
  const service = getGlobalEmbeddingService({
    provider: 'auto',
    userRegion: region,
  });
  
  const result = await service.embed(text);
  
  return Response.json({
    embedding: result.embedding,
    provider: result.provider,
  });
}
```

---

## 🌐 地区检测方法

### 方法 1: Vercel 自动检测（推荐）

```typescript
// Vercel 自动提供地区信息
export async function POST(req: Request) {
  const geo = req.headers.get('x-vercel-ip-country');
  
  const service = getGlobalEmbeddingService({
    userRegion: geo?.toLowerCase(),
  });
}
```

### 方法 2: Cloudflare 自动检测

```typescript
// Cloudflare Workers 提供
const region = req.headers.get('cf-ipcountry')?.toLowerCase();
```

### 方法 3: IP 地理位置 API

```typescript
// 使用免费 IP API
async function detectRegion(ip: string) {
  const response = await fetch(`https://ipapi.co/${ip}/country/`);
  const country = await response.text();
  return country.toLowerCase();
}
```

---

## 📊 提供商对比

| 提供商 | 模型 | 维度 | 中文 | 欧美 | 亚太 | 成本 |
|--------|------|------|------|------|------|------|
| OpenAI | text-embedding-3-small | 1536 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $0.02/1M |
| 硅基流动 | BAAI/bge-m3 | 1024 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 免费 |
| Jina AI | jina-embeddings-v2 | 768 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | $0.02/1M |
| 阿里灵积 | text-embedding-v2 | 1536 | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ¥0.0007/1K |

---

## 🔧 迁移指南

### 从原有 EmbeddingService 迁移

```typescript
// 旧代码
import { EmbeddingService } from '@/lib/rag/embedding-service';
const service = new EmbeddingService();

// 新代码（向后兼容）
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';
const service = getGlobalEmbeddingService();

// API 完全兼容，无需修改其他代码
```

---

## 💡 最佳实践

### 1. 按地区配置不同策略

```typescript
// config/embedding-strategy.ts
export const EMBEDDING_STRATEGY = {
  cn: {
    primary: 'siliconflow',  // 免费
    fallback: 'dashscope',   // 稳定
  },
  us: {
    primary: 'openai',
    fallback: 'jina',
  },
  default: {
    primary: 'jina',
    fallback: 'openai',
  },
};
```

### 2. 监控提供商使用情况

```typescript
const service = getGlobalEmbeddingService();

// 定期检查统计
setInterval(() => {
  const stats = service.getStats();
  console.log('Provider usage:', stats.requestsByProvider);
  console.log('Total cost:', stats.totalCost);
}, 60000);
```

### 3. 错误处理和降级

```typescript
try {
  const result = await service.embed(text);
  console.log(`Using ${result.provider}`);
} catch (error) {
  // 所有提供商都失败时的处理
  console.error('All providers failed:', error);
  // 可以返回缓存结果或降级到其他逻辑
}
```

---

## 🎯 推荐配置

### 小型项目（< 10K 查询/月）

```env
# 只需配置免费的
SILICONFLOW_API_KEY=sk-...
JINA_API_KEY=jina_...  # 1M 免费额度
```

### 中型项目（10K - 100K 查询/月）

```env
# 配置所有主要提供商
OPENAI_API_KEY=sk-...
SILICONFLOW_API_KEY=sk-...
JINA_API_KEY=jina_...
```

### 大型项目（> 100K 查询/月）

```env
# 配置所有提供商 + 企业版
OPENAI_API_KEY=sk-...
SILICONFLOW_API_KEY=sk-...
JINA_API_KEY=jina_...
DASHSCOPE_API_KEY=sk-...  # 阿里云企业版
```

---

## 📈 成本优化建议

### 策略 1: 中国用户优先免费

```typescript
// 中国用户全部用硅基流动（免费）
if (userRegion === 'cn') {
  service = getGlobalEmbeddingService({
    provider: 'siliconflow',
    forceProvider: true,
  });
}
```

### 策略 2: 设置每日限额

```typescript
let dailyQuota = 10000;
let dailyUsed = 0;

async function embedWithQuota(text: string) {
  if (dailyUsed > dailyQuota) {
    // 超额后切换到更便宜的提供商
    service = getGlobalEmbeddingService({
      provider: 'siliconflow',  // 免费
    });
  }
  
  const result = await service.embed(text);
  dailyUsed++;
  return result;
}
```

---

## 🐛 故障排查

### 问题 1: 硅基流动在海外很慢

```typescript
// 为海外用户强制不使用硅基流动
if (['us', 'gb', 'de', 'fr'].includes(userRegion)) {
  service = getGlobalEmbeddingService({
    provider: 'openai',  // 直接用 OpenAI
  });
}
```

### 问题 2: 所有提供商都失败

```typescript
// 检查 API Key 配置
const service = getGlobalEmbeddingService();
const stats = service.getStats();
console.log('Available providers:', stats.availableProviders);

// 如果为空，说明没有配置任何 API Key
if (stats.availableProviders.length === 0) {
  console.error('No API keys configured!');
}
```

---

## 📞 获取 API Key

1. **OpenAI**: https://platform.openai.com/api-keys
2. **硅基流动**: https://siliconflow.cn/account/ak
3. **Jina AI**: https://jina.ai/embeddings#pricing
4. **阿里云灵积**: https://dashscope.console.aliyun.com/

---

**更新**: 2025-01-12  
**作者**: Warp AI Agent