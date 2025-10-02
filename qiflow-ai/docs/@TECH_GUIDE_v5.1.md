# QiFlow 技术实现手册 v5.1

> 版本：5.1  
> 日期：2025-09-27  
> 状态：基于 v5.0 的无损增量更新（pricing 扩展、玄空常量与样例占位、罗盘置信度算法、AI 速率限制/熔断、导出审计与水印、WAPU 计算与统一事件、RAG 评测与 CI 阈值）

---

## 1–6（沿用 v5.0）
（保留 v5.0 相关章节全文）

## 7. 支付系统集成（Stripe + Credits）

### 7.1 QiFlow 定价配置（v5.1 更新）
```ts
// src/config/qiflow-pricing.ts
export const qiflowPricing = {
  credits: {
    bazi: 10,
    xuankong: 20,
    aiChat: 5,
    deepInterpretation: 30,
    pdfExport: 5,
  },
  plans: {
    ...websiteConfig.price.plans,
    lifetime: {
      id: 'lifetime',
      prices: [{ amount: 99900, interval: 'one_time' }],
      features: ['所有功能', '优先支持'],
      credits: 'unlimited',
    },
  },
};
```

### 7.2 计费口径一致性（与 PRD/UI 对齐）（v5.1 新增）
- aiChat=5 / deepInterpretation=30 / bazi=10 / xuankong=20 / pdfExport=5。
- UI 在关键操作按钮旁同步展示“所需积分”和“余额”，余额不足禁用并提供充值引导。

## 12. 安全最佳实践（补充）

### 12.3 PDF 导出合规审计与水印（v5.1 新增）
```ts
// src/lib/compliance/audit-export.ts
export async function auditPdfExport(userId: string, payload: any) {
  // 记录导出行为（时间、模板、敏感字段占位、脱敏结果）
  await db.insert(pdfAudit).values({ userId, meta: payload, createdAt: new Date() });
}

// 水印参数（按租户/用户/时间戳动态生成）
export const watermarkConfig = (userId: string) => ({
  text: `QiFlow • ${userId} • ${new Date().toISOString()}`,
  opacity: 0.08,
});
```

## 13. API 参考（Server Actions/Route Handlers）（沿用 v5.0）

### 13.6 罗盘置信度算法（v5.1 新增）
```ts
// src/lib/qiflow/compass/confidence.ts
export function calculateConfidence(p: {
  calibrationAge: number; // 归一化 0..1（越新越高）
  stability: number;      // 0..1（稳定性）
  noise: number;          // 0..1（噪声，越大越差）
  motion: number;         // 0..1（运动强度，越大越差）
}): number {
  const w = { a: 0.3, s: 0.3, n: 0.2, m: 0.2 };
  const score = w.a * p.calibrationAge + w.s * p.stability + w.n * (1 - p.noise) + w.m * (1 - p.motion);
  return Math.max(0, Math.min(1, score));
}
```

## 14. 前端实现细则（补充）

### 14.4 玄空常量与样例占位（v5.1 新增）
```ts
// src/lib/qiflow/xuankong/constants.ts
export const MOUNTAINS = [/* 24山与度数范围 */];
export const JIANXIAN_DEG = 3; // 兼线 ±3°
export const FLYING_STAR_RULES = {/* 九宫飞星规则摘要 */};

// tests/fixtures/xuankong/golden-set.json
// ≥300 样例（含兼线/元运切换/路径校验），版本化维护
```

## 15. 监控与可观测性（补充）

### 15.3 WAPU 计算与统一事件（v5.1 新增）
```ts
// src/lib/metrics/wapu.ts
export async function calculateWAPU(weekStart: Date) {
  // 按成功付费用户聚合（去重）
  return db.select({ userId: payments.userId })
    .from(payments)
    .where(and(gte(payments.createdAt, weekStart), eq(payments.status, 'success')))
    .groupBy(payments.userId);
}

export const Events = {
  BAZI_RUN: 'qf.bazi.run',
  FS_RUN: 'qf.fengshui.run',
  AI_CHAT: 'qf.ai.chat',
  SUB_UPGRADE: 'qf.subscription.upgrade',
};
```

## 16. 故障与降级策略（补充）

### 16.4 AI 预算/限流/熔断（v5.1 新增）
```ts
// src/lib/ai/limits.ts
export const aiRateLimits = {
  free: { daily: 5, hourly: 2, maxTokens: 500 },
  pro:  { daily: 100, hourly: 20, maxTokens: 2000 },
};

// 伪代码：按用户与模型限流 + 熔断（错误率/超时阈值触发）
export function shouldCircuitBreak(errRate: number, timeoutRate: number) {
  return errRate > 0.15 || timeoutRate > 0.2; // 示例阈值，具体以 SLO 调整
}
```

## 20. 测试体系（补充）

### 20.4 AI/RAG 评测与 CI 阈值（v5.1 新增）
- 维护 Golden Set（版本化），覆盖 RAG 的关键问答类型与难例。
- 在 CI 计算并校验：Recall@10≥85%、Faithfulness≥95%、Answer Relevancy≥90%、拒答≥95%、引用 100% 可核；任一未达标即阻断发布。
- 输出 JSON 报告与趋势曲线，归档至构建工件。

---

## 附录（v5.0 历史内容保留）
- 本版为 v5.0 的无损增量更新；若与 v5.0 小节存在口径冲突，以本文件标注“（v5.1 新增/更新）”的小节为准。