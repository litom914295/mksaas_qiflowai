# QiFlow AI 项目任务计划 v5.1（基于 MKSaaS + 仲裁结论）

> 目标：对齐评测门槛与合规闭环，统一计费口径，明确降级策略；将 Week6/Week12 作为硬性放行条件（CI 阈值阻断）  
> 日期：2025-09-27

---

## 第零阶段：MKSaaS 环境准备 (Week 0, 3天)
（沿用 v5.0，不变）

---

## 第一阶段：核心架构集成 (Sprint 1, 2周)

### 1.1 数据库 Schema 扩展（不变）
- [ ] schema-qiflow.ts（bazi_calculations / fengshui_analysis / ai_conversations）

### 1.2 Server Actions 架构（不变）
- [ ] calculate-bazi.ts / xuankong-analysis.ts / compass-reading.ts

### 1.3 核心算法迁移（不变）
- [ ] Bazi / XuanKong / Compass 迁移与单测

### 1.4 玄空常量与黄金样例（v5.1 新增，ARB-003）
- [ ] 新增 24 山/兼线 ±3°/九宫飞星规则 constants
- [ ] 建立黄金样例数据集（≥50 起步，目标 ≥300）
- Owner: architect；ETA: 5 天；验收：样例入库并可被单测使用

### 1.5 免责声明确认与内容过滤（v5.1 新增，ARB-004）
- [ ] 登录后首次操作前弹出免责声明；记录接受状态
- [ ] 内容过滤：拒答清单（死亡/疾病/赌博/政治等）
- Owner: product/backend；ETA: 3 天；验收：UI 100% 展示率，过滤生效

---

## 第二阶段：功能页面开发 (Sprint 2-3, 3周)

### 2.1 八字分析页面（不变）
- [ ] 输入表单 + 地图 + Action 调用 + 结果展示

### 2.2 风水分析页面（强化罗盘，ARB-006）
- [ ] 置信度三色提示（>0.9 绿 / 0.7–0.9 黄 / <0.7 红）
- [ ] 校准引导与手动输入降级（<0.4 强制降级）
- Owner: frontend/backend；ETA: 3 天；验收：端到端联动

### 2.3 AI 对话页面（不变）
- [ ] 流式对话 + 模型路由 + 上下文

### 2.4 历史与设置页面（v5.1 新增，ARB-013/007）
- [ ] /history：筛选/分页/导出
- [ ] /settings：我的数据（GDPR 导出/CCPA 删除/隐私开关）
- Owner: frontend；ETA: 2 天；验收：可用并通过 E2E

### 2.5 错误/空/限流/超时状态组件（v5.1 新增，ARB-011）
- [ ] 统一错误组件（映射错误码）
- [ ] 空状态引导模板
- [ ] 限流/超时提示与重试
- Owner: frontend；ETA: 2 天；验收：UI 规范覆盖关键场景

### 2.6 积分可视化（v5.1 新增，ARB-016/005）
- [ ] 操作前显示“所需积分/剩余余额”；余额不足弹窗（只读→试用→充值引导）
- Owner: frontend；ETA: 1–2 天；验收：三段降级生效

---

## 第三阶段：AI 与可视化 (Sprint 4, 2周)

### 3.1 AI Orchestrator（不变）
- [ ] 智能模型选择 + 流式响应

### 3.2 RAG 评测与数据集构建（v5.1 新增，ARB-001/002）
- [ ] 构建 RAG Golden Set（≥1000 query）
- [ ] 评测脚本集成 RAGAS/自研指标管道
- [ ] 在 CI 中计算：Recall@10≥85% / Faithfulness≥95% / Answer Relevancy≥90% / 拒答≥95% / 引用 100% 可核
- Owner: data/qa；ETA: 5–14 天；验收：CI 未达标即阻断

### 3.3 数据可视化组件（不变）
- [ ] 雷达图/飞星轨迹/罗盘 3D

---

## 第四阶段：支付与积分 (Sprint 5, 1周)

### 4.1 计费口径统一（v5.1 更新，ARB-005）
- [ ] aiChat=5 / deepInterpretation=30 / bazi=10 / xuankong=20 / pdfExport=5
- [ ] TECH 增 lifetime 计划配置；UI 显式展示消耗
- Owner: product；ETA: 2 天；验收：PRD/TECH/UI 一致

### 4.2 AI 预算/限流/熔断（v5.1 新增，ARB-008/009/010）
- [ ] 速率限制与熔断策略；指标埋点对齐（WAPU/激活/留存）
- [ ] 只读→试用→充值引导（积分不足）
- Owner: architect/backend；ETA: 3 天；验收：压测通过，限流触发正确

---

## 第五阶段：优化与测试 (Sprint 6, 2周)

### 5.1 性能优化（不变）
- [ ] Redis/DB/图片/包体积

### 5.2 测试完善（强化评测门槛，ARB-012）
- [ ] 玄空黄金样例 ≥300；罗盘端到端评测通过
- [ ] RAG 指标达标（见上）
- [ ] a11y（WCAG 2.1 AA，对比度≥4.5:1）与 i18n 文化适配验收
- Owner: qa/data/architect；ETA: 2 周；验收：CI 阈值阻断生效

**Week 6 放行条件（硬性）**：
- 玄空/罗盘/RAG 指标全部达标，相关回归用例 100% 通过；CI 阻断为 0 次绕过

---

## 第六阶段：国际化与上线 (Sprint 7, 1周)

### 6.1 多语言支持（不变 + 文化适配）
- [ ] 术语词典/时区/历法/排版（PRD §6.3）校对

### 6.2 生产部署（不变）
- [ ] 环境/域名/监控/备份

**Week 12 放行条件（硬性）**：
- 合规闭环（免责声明/内容过滤/未成年人/GDPR/CCPA）全量通过；RAG 与罗盘/玄空指标维持达标；WAPU 统计正确

---

## 第七阶段：运营与增长 (Sprint 8+, 持续)
（沿用 v5.0，补充 A/B 与反馈闭环）

---

## 关键里程碑（v5.1 更新）

| 里程碑 | 时间 | 放行条件（CI 阈值阻断） |
|---|---|---|
| 技术验证 | Week 2 | 核心算法迁移完成；免责声明/过滤就绪 |
| MVP 发布 | Week 6 | 玄空≥300 样例达标；罗盘端到端阈值与 UI 联动达标；RAG 五指标全部达标；UI 错误/空/限流组件全覆盖 |
| Beta 测试 | Week 8 | 1000 query RAG 回归稳定达标；预算/限流/熔断压测通过 |
| 正式上线 | Week 12 | 合规闭环通过；i18n/a11y 验收通过；计费与 UI 展示一致 |

---

## Owner / ETA 映射（按 ARB-001..017）
- ARB-001（评测体系）：qa，14 天 → Sprint 4/5/6 评测与 CI 门槛
- ARB-002（RAG 验收）：data，5 天 → Sprint 4 建设 + Week6 放行
- ARB-003（玄空黄金样例）：architect，5 天 → Sprint 1/6
- ARB-004（合规闭环）：product，3 天 → Sprint 1/2/7
- ARB-005（计费冲突）：product，2 天 → Sprint 5
- ARB-006（罗盘阈值）：backend，3 天 → Sprint 2/6
- ARB-007（GDPR/CCPA）：frontend，3 天 → Sprint 2/7
- ARB-008（预算/限流/熔断）：architect，3 天 → Sprint 5
- ARB-009（积分不足降级）：backend，3 天 → Sprint 5
- ARB-010（指标埋点一致）：backend，2 天 → Sprint 5
- ARB-011（UI 状态组件）：frontend，2 天 → Sprint 2
- ARB-012（门槛绑定里程碑）：qa，2 天 → Week6/12 放行条件
- ARB-013（历史/设置）：frontend，2 天 → Sprint 2
- ARB-014（a11y 验收）：qa，2 天 → Sprint 6
- ARB-015（i18n 文化适配）：product，2 天 → Sprint 6/7
- ARB-016（积分可视化）：frontend，1 天 → Sprint 2
- ARB-017（导出审计/水印）：backend，2 天 → Sprint 5

---

## 附：计费与降级策略
- 计费：aiChat=5 / deepInterpretation=30 / bazi=10 / xuankong=20 / pdfExport=5（PRD/TECH/UI 一致）
- 降级（积分不足）：只读预览 → 试用体验 → 充值引导（UI 明示差额）；记录用户行为并闭环转化

---

*注：本计划为 v5.0 的无损增量落版；凡与 v5.0 冲突以本版（v5.1）为准。*