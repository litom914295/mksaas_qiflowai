# PRD v5.0 架构/交付评审（gpt‑5‑high）

> 角色：资深架构师 + 交付经理
> 范围：仅评审 docs/PRD_v5.0.md（不引入外部假设）；所有结论引用 PRD 原文短句为 evidence。

---

## 1) 概览结论（⚠️）

在 Next.js 15 / Drizzle / Better Auth / Stripe / 多模型编排的目标栈下，v5.0 的功能描述已具备骨架，但要在“2 个版本内稳定落地”，仍需补齐若干工程化要件：
- Orchestrator 的容错/回退/限流/毒性拦截未成文（PRD仅表述“AI Orchestrator多模型编排”与代码示例“retrieveFromVectorDB/streamText”）。
- 罗盘“四通道+置信度+降级”有条目但缺少前后端链路定义与指标（PRD列“DeviceOrientation/WMM/SunCalc/地图对齐”“实时置信度评分/iOS权限优雅降级”）。
- RAG 仅明确“向量化/语义搜索/动态更新”，缺少数据来源、清洗、引用展示与反幻觉策略。
- 计费与权限：动作级别有示例（订阅/积分），但未统一到各入口（含导出）。
- 性能与成本：有 SLO 目标与“智能路由+缓存”意图，但未沉淀“统一错误码、限流、观测项与缓存策略”。

因此结论为：可在 2 个版本内达成，但需在 PRD 增补“可执行的工程约束与策略小节”。

---

## 2) Top 10 问题（影响度排序）

1. Orchestrator 缺少容错/回退/限流/毒性拦截（blocker）
   - Evidence：
     - “AI Orchestrator多模型编排” （1.3 核心价值主张）
     - 代码示例仅含“retrieveFromVectorDB”“streamText”（3.2.1）
     - 未出现“重试/回退/限流/毒性”字样
   - 影响面：AI对话、深度解读、成本与SLO稳定性
   - Owner：architect + backend
   - ETA：5 天
   - 建议：在PRD新增“Orchestrator容错策略”小节（重试策略、fallback顺序、请求级速率限制、输出安全/毒性拦截、统一错误码）。

2. 罗盘“四通道融合”缺少前后端链路、指标与存证（high）
   - Evidence：
     - “DeviceOrientation/WMM2020/SunCalc/地图建筑对齐”（3.3.1）
     - “卡尔曼滤波降噪/8字形校准/实时置信度评分/iOS权限优雅降级”（3.3.2）
   - 影响面：测量稳定性、兼容性、可解释性与回溯
   - Owner：frontend + architect
   - ETA：5 天
   - 建议：补“前端测量→服务端归一化→存储→分析”的链路说明、置信度计算公式与阈值、降级矩阵、异常标签与审计日志。

3. RAG 缺少数据来源、清洗、引用展示与反幻觉策略（high）
   - Evidence：
     - “传统命理典籍向量化存储/语义搜索与上下文注入/动态知识更新机制”（3.2.2）
   - 影响面：准确性、可信度、法务与复现能力
   - Owner：data + architect
   - ETA：5 天
   - 建议：新增“数据源白名单、切片与去噪、embedding策略、检索阈值、引用卡片展示、低相关度/无结果时降级”为PRD条款。

4. 计费与权限未在所有入口统一约束（high）
   - Evidence：
     - 动作级：八字计算“检查积分余额/consumeCredits”（3.1.1），玄空“订阅优先，否则积分”（3.1.2）
     - “PDF报告导出: 5积分”（3.4.2）但未见入口层鉴权示例
   - 影响面：一致性、风控、漏计费风险
   - Owner：backend + product
   - ETA：3 天
   - 建议：PRD增加“统一守卫层”描述：Better Auth + 订阅/积分校验 + Feature Flag，适用入口清单（八字/玄空/AI对话/PDF导出）。

5. 统一错误码/错误结构与观测维度缺失（high）
   - Evidence：
     - 有“OpenPanel + Vercel Analytics”（1.4）与SLO目标（8.1），但未定义错误码与trace字段
   - 影响面：可观测性、告警准确度、跨模块排障效率
   - Owner：backend
   - ETA：3 天
   - 建议：PRD加入“统一错误结构（code/message/traceId）与核心日志字段（userId/route/modelProvider/costMs/tokens）”。

6. 限流策略缺失（high）
   - Evidence：
     - 仅有“next-safe-action”等最佳实践（1.4），未见“限流/配额”条款
   - 影响面：滥用控制、成本上限、SLA稳定性
   - Owner：backend + architect
   - ETA：3 天
   - 建议：加入“入口限流/用户配额/模型调用QPS上限/突发桶”策略与默认阈值。

7. 性能与成本的缓存/失效策略缺少规范（medium）
   - Evidence：
     - “页面加载/INP/API响应/SLA”目标（8.1），风险处提到“智能路由+缓存/索引优化+缓存”（10.1）
   - 影响面：冷启动、重复计算、API成本
   - Owner：architect
   - ETA：4 天
   - 建议：补充“revalidateTag/按路由与实体的缓存键、RAG检索结果TTL、AI结果持久化缓存”与失效触发。

8. 导出能力（PDF）仅列出积分消耗，缺少流水与合规（medium）
   - Evidence：
     - “PDF报告导出: 5积分”（3.4.2）
   - 影响面：计费一致性、审计、对账
   - Owner：backend
   - ETA：2 天
   - 建议：PRD要求“导出触发计费、生成交易流水、失败回滚、导出访问权限与CSP策略”。

9. i18n 对“四柱表现形态”的适配未明确（medium）
   - Evidence：
     - “快速支持6语言”（1.3），“messages/zh.json 扩展（四柱命名）”（6.2）
   - 影响面：非中文用户体验与理解
   - Owner：frontend + product
   - ETA：3 天
   - 建议：PRD加入“非中文环境可切换横排/卡片式四柱展示、单位与时区文案规范”。

10. 安全条目较高层，缺少执行细则（medium）
    - Evidence：
      - “HTTPS/Better Auth/RLS/敏感信息加密/PCI DSS/不存储支付信息/Webhook验证”（7.1/7.3）
    - 影响面：上线合规性与渗透测试通过率
    - Owner：architect + backend
    - ETA：3 天
    - 建议：PRD增加“CSP白名单、Security Headers矩阵、公共入口Captcha策略与速率限制”。

---

## 3) Quick Wins（1 周可落地）
- 新增“统一错误结构与错误码”小节（含 traceId）并在所有 Server Actions 适用。
- 写明“Orchestrator fallback 顺序 + 重试/退避 + 请求速率限制 + 毒性拦截”策略。
- 罗盘链路追加一句：前端测量→服务端归一化→落库；失败则“手动输入角度 + 低置信度提示”。
- RAG 增加“引用展示（SourceCards）与低相关度降级”为必选项。
- 计费与权限：声明“统一守卫层”适配“八字/玄空/AI对话/PDF导出”。

---

## 4) Blockers（立项前必须解决）
- Orchestrator：容错/回退/限流/毒性拦截未成文（见问题#1）。
- 统一计费与权限：缺少入口级统一约束（见问题#4）。
- 罗盘：缺少前后端链路与置信度指标的工程约束（见问题#2）。

---

## 5) Open Questions（需产品/业务拍板）
- RAG 数据源与授权：传统典籍与现代资料的版权与更新周期如何界定？（关联3.2.2）
- 模型成本上限：免费与Pro在AI调用次数/日或Tokens是否有明确配额？（关联3.4/8.2）
- PDF 导出范围：哪些内容属于付费导出？是否支持水印/只读链接？（关联3.4.2）
- i18n 表现：非中文环境是否默认横排四柱？是否提供术语注释？（关联6.2）

---

## 6) prd_patch（可直接替换/追加到 PRD 的 Markdown 片段）

```markdown
### 3.5 Orchestrator 容错与限流策略
- 重试与退避：指数退避 2s/4s/8s，最大 3 次；可配置。
- 回退顺序：gpt-4o → deepseek → gemini（按成本/时延/可用性动态切换）。
- 速率限制：按用户与路由设定 QPS 与突发桶（默认 3 QPS / 10 burst，可配置）。
- 输出安全：接入毒性/不当内容拦截，命中则回退到更保守提示词与模型。
- 统一错误码：{ code, message, traceId }，code 枚举含 VALIDATION_ERROR / PERMISSION_DENIED / RATE_LIMITED / PROVIDER_ERROR / TIMEOUT。

### 3.6 统一鉴权与计费守卫
- 守卫构成：Better Auth + 订阅/积分校验 + Feature Flag。
- 适用入口：八字分析 / 玄空分析 / AI 对话 / PDF 导出。
- 失败回滚：计费失败需回滚积分扣减；对外提示安全文案。

### 3.7 罗盘前后端链路与降级
- 链路：前端（DeviceOrientation/WMM/SunCalc/地图对齐）→ 服务端归一化与打点 → 存储（角度/置信度/环境标签）。
- 置信度：依据数据一致性、噪声与校准覆盖度计算，阈值：高≥0.85；中 0.5–0.85；低＜0.5。
- 降级：权限拒绝或干扰过大时，提供“手动输入角度 + 低置信度提示 + 校准引导”。

### 3.8 RAG 引用与反幻觉
- 数据源：列出白名单来源并记录版本与更新时间；分片策略与去噪流程说明。
- 引用展示：对生成答案附“引用卡片（标题/链接/片段）”；低相关度或无结果时给出“未检索到充分依据”的降级回答。
- 检索阈值：默认相似度阈值 0.75（可按任务调整）。

### 8.3 性能与成本控制
- SLO：LCP < 2s、INP < 100ms、API p95 < 500ms；AI 调用超时 15s。
- 缓存：Next.js fetch + revalidateTag（对实体与分析结果设定标签）；RAG 检索结果 TTL 10 分钟；AI 结果持久化缓存 24 小时（可失效）。
- 成本：为免费/Pro 设定日配额与月度上限；达阈值触发限流与温和降级提示。
```

---

（完）
