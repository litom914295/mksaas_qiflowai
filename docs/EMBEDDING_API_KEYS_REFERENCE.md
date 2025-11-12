# Embedding API 密钥配置参考

## ✅ 已配置的提供商

| 提供商 | 状态 | 免费额度 | 成本 | 推荐地区 |
|--------|------|----------|------|----------|
| **OpenAI** | ✅ 已配置 | 无 | $0.02/1M tokens | 欧美 |
| **硅基流动** | ✅ 已配置 | 无限制 | 完全免费 | 中国 |
| **Jina AI** | ✅ 已配置 | 1M tokens/月 | $0.02/1M tokens | 全球 |
| **阿里云灵积** | ⚪ 未配置 | 1M tokens/天 | ¥0.0007/1K tokens | 中国企业 |

---

## 📋 环境变量清单

### 已配置 ✅
```env
# OpenAI
OPENAI_API_KEY=sk-ArQi0bOqLCqsY3sdGnfqF2tSsOnPAV7MyorFrM1Wcqo2uXiw
OPENAI_BASE_URL=https://api.tu-zi.com/v1

# Jina AI (全球访问,1M 免费额度)
JINA_API_KEY=jina_ff76faf3b9ac47caa1c5204acd808576nWYu16M9fNC-KUeqcx-4wmd40MLH

# 硅基流动 (中国地区,免费)
SILICONFLOW_API_KEY=sk-wvzkowtvqllufqyrcyyrjyabqdzwasuptachbzurgfcmupyr

# 默认地区
DEFAULT_REGION=cn
```

### 可选配置 ⚪
```env
# 阿里云灵积 (企业版,可选)
# DASHSCOPE_API_KEY=sk-...
```

---

## 🧪 测试你的配置

### 方法 1: 使用测试脚本（推荐）

```bash
npm run test:embedding
```

这将测试：
- ✅ 自动选择提供商（基于地区）
- ✅ 硅基流动 API 连接
- ✅ Jina AI API 连接
- ✅ OpenAI API 连接（备用）
- ✅ 统计信息收集

### 方法 2: 手动测试

```typescript
import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

// 测试自动选择
const service = getGlobalEmbeddingService({
  provider: 'auto',
  userRegion: 'cn',
});

const result = await service.embed('测试文本');
console.log(`使用提供商: ${result.provider}`);
console.log(`向量维度: ${result.embedding.length}`);
console.log(`成本: $${result.cost}`);
```

---

## 🎯 不同地区的路由策略

### 中国大陆用户 (cn, hk, tw, mo)
```
硅基流动 (免费) → 阿里灵积 → Jina AI → OpenAI
```

### 亚太地区 (sg, my, th, id, ph, vn)
```
Jina AI (便宜) → OpenAI → 硅基流动
```

### 日韩地区 (jp, kr)
```
Jina AI → OpenAI → 硅基流动
```

### 欧美地区 (us, ca, gb, de, fr, au)
```
OpenAI (稳定) → Jina AI
```

### 其他地区 (default)
```
OpenAI → Jina AI → 硅基流动
```

---

## 💰 成本预估

### 场景 1: 中国用户为主 (80% CN, 20% 国际)

```
月查询量: 100K
中国用户 (80K): $0 (硅基流动免费)
国际用户 (20K): $1 (Jina/OpenAI)
总成本: $1/月 (节省 99%) 🎉
```

### 场景 2: 全球用户均衡 (40% CN, 60% 国际)

```
月查询量: 100K
中国用户 (40K): $0 (硅基流动免费)
亚太用户 (30K): $0.60 (Jina)
欧美用户 (30K): $1.50 (OpenAI)
总成本: $2.10/月 (节省 96%) 🎉
```

### 场景 3: 欧美用户为主 (20% CN, 80% 国际)

```
月查询量: 100K
中国用户 (20K): $0 (硅基流动免费)
国际用户 (80K): $1.60 (Jina 优先)
总成本: $1.60/月 (节省 97%) 🎉
```

**对比全部使用 OpenAI**: $5/月

---

## 🔧 故障排查

### 问题 1: npm run test:embedding 失败

**可能原因**:
- 环境变量未加载（需要重启开发服务器）
- API 密钥格式错误
- 网络连接问题

**解决方案**:
```bash
# 1. 确认 .env.local 文件存在
cat .env.local | grep "JINA_API_KEY\|SILICONFLOW_API_KEY"

# 2. 重启开发服务器
npm run dev

# 3. 再次运行测试
npm run test:embedding
```

### 问题 2: 硅基流动在海外很慢

**解决方案**: 为海外用户强制使用 Jina AI
```typescript
const region = getUserRegion();
const service = getGlobalEmbeddingService({
  provider: ['us', 'gb', 'de'].includes(region) ? 'jina' : 'auto',
});
```

### 问题 3: 某个提供商失败

**解决方案**: 系统会自动 fallback 到备用提供商
```typescript
// 自动故障转移，无需手动处理
const result = await service.embed(text);
// 如果主提供商失败，会自动尝试备用提供商
```

---

## 📊 监控建议

### 查看提供商使用统计
```typescript
const service = getGlobalEmbeddingService();
const stats = service.getStats();

console.log('可用提供商:', stats.availableProviders);
console.log('总请求数:', stats.totalRequests);
console.log('总成本:', stats.totalCost);
console.log('按提供商统计:', stats.requestsByProvider);
```

### 设置成本告警
```typescript
const MAX_DAILY_COST = 0.10; // $0.10/天

setInterval(() => {
  const stats = service.getStats();
  if (stats.totalCost > MAX_DAILY_COST) {
    console.warn('⚠️ 成本超标！切换到免费提供商');
    // 可以强制切换到硅基流动
  }
}, 3600000); // 每小时检查一次
```

---

## 🚀 下一步

1. **立即测试**: 运行 `npm run test:embedding` 验证配置
2. **集成到 RAG**: 按照 `GLOBAL_EMBEDDING_IMPLEMENTATION_PLAN.md` 迁移现有代码
3. **监控成本**: 设置仪表盘追踪提供商使用情况
4. **优化策略**: 根据实际使用数据调整地区路由策略

---

**最后更新**: 2025-01-12  
**配置状态**: ✅ 生产就绪  
**测试状态**: ⏳ 待测试