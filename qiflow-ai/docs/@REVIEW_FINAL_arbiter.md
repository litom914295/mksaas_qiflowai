# 最终仲裁合并报告（跨文档 Stage B）

- 范围：PRD_v5.0.md + TECH_GUIDE_v5.0.md + TASK_PLAN_v5.0.md + UI_DESIGN_v5.0.md（A: gpt-5-high；B: claude-4.1-opus；C: gemini-2.5-pro）
- 结论：修订（Revise）
- 方法：
  - 冲突裁决：优先“证据充分 + 可执行性高”的结论；无法裁决入 open_questions 并附验证方案。
  - 分数合并：各维度取中位数；若分歧>1分，解释原因并给出缓解方案。
  - 问题去重：基于三方JSON issues 合并去重并排序（blocker→high→medium→low）。
  - 产出补丁：提供 prd_patch/tech_patch/task_patch（Markdown，可直接替换）。
  - 路线图与职责：提供T0/T1/T2路线图与RACI矩阵。

---

## 1) 冲突裁决与无法裁决项

已裁决为“修订”的关键点：
- 必须新增“AI评测体系（黄金集+回归）”与“RAG端到端验收门槛”。
- 计费冲突统一：区分 aiChat(5积分) 与 deepInterpretation(30积分)，并在TECH补充 lifetime 计划；UI显式展示消耗与余额。
- 罗盘阈值/置信度/降级链路量化，并与UI三色提示联动；低置信度强制校准或转手动。
- 合规闭环：免责声明、内容审核、未成年人保护，PRD/TECH/TASK/UI全链落地。

无法一次性裁决（进入 open_questions 的争议与验证方案）：
- lifetime 与 master 并存策略、是否需KYC/地区限制：价格A/B + 流水与退款监控。
- RAG知识库版权与更新频率：版权清单审计 + 法务评审 + 数据源追溯。
- 罗盘“低置信度勉强使用模式”是否放行：可用性测试 + 误差对照（实测地磁噪声）。
- AI深度解读的模型成本差异化与折扣体系：成本监控 + ARPU实验。

---

## 2) 分数合并（中位值）与>1分分歧说明

- value：4（三方一致）
- fengshui_correctness：3（GPT=2，Claude=3，Gemini=3）
- rag_quality：2（三方一致）
- multi_tenant_billing：3（Claude=2，GPT=3，Gemini=5；分歧>1，原因：Gemini偏重MKSaaS成熟度，忽视跨文档冲突；缓解：统一计费口径并落地UI展示）
- compliance_safety：2（Claude=1，GPT=2，Gemini=4；分歧>1，原因：合规内容在文档未落地但底层能力存在；缓解：新增免责声明/内容过滤/18+与GDPR/CCPA闭环）
- perf_cost：3（三方一致）
- i18n：4（Claude=3，其余=4；差异=1）
- evaluation_plan：2（Gemini=1，其余=2；差异=1）
- ux：4（Claude=3，其余=4；差异=1）
- growth_ops：3（三方一致）

---

## 3) 合并去重后的问题清单（按严重级别排序）

Blocker：
1. AI评测体系与回归框架缺失（ARB-001）
2. RAG端到端验收标准缺失（ARB-002）
3. 玄空算法公式/24山/兼线与黄金样例缺失，无法验收（ARB-003）
4. 合规与内容安全闭环缺失（免责声明/未成年人/内容审核）（ARB-004）

High：
5. AI计费/积分跨文档冲突（聊天5 vs 深度解读30；lifetime定义不一致）（ARB-005）
6. 罗盘阈值/置信度/降级未量化（ARB-006）
7. GDPR/CCPA合规功能断链（任务与UI入口缺失）（ARB-007）
8. AI预算/限流/熔断策略缺失（ARB-008）
9. 积分不足的降级策略缺失（只读/试用/充值引导）（ARB-009）

Medium：
10. 指标埋点不一致（WAPU/激活/留存）（ARB-010）
11. UI错误/空/超时/限流等状态缺失（ARB-011）
12. 评测门槛未绑定里程碑放行标准（ARB-012）
13. 历史/设置页面未纳入任务清单（ARB-013）
14. 无障碍（WCAG 2.1 AA）验收缺失（ARB-014）

Low：
15. i18n文化适配与术语词典缺失（ARB-015）
16. 积分消耗UI展示缺失（ARB-016）
17. 导出合规审计与水印缺失（ARB-017）

（详细owner/ETA/证据/建议均见 @REVIEW_FINAL_arbiter.json issues 段）

---

## 4) 补丁（Markdown，可直接替换）

- prd_patch：
  - 新增 3.3.3 传感器阈值与降级/拒答
  - 修订/新增 3.4.2/3.4.3 AI服务计费（区分对话5 vs 深度解读30；保留lifetime）
  - 新增 6.3 i18n文化适配验收清单
  - 新增 7.4 内容安全与免责声明（18+、拒答清单、隐私提示）
  - 新增 13 数据与评测合同（玄空/罗盘/RAG门槛与回归）

- tech_patch：
  - qiflow-pricing 增加 deepInterpretation 与 lifetime；
  - 玄空 constants/fixtures 与九宫飞星规则占位；
  - 罗盘 calculateConfidence 与阈值策略；
  - AI 速率限制与熔断；导出审计与水印；
  - WAPU 计算与统一事件；RAG评测脚本与CI阈值阻断。

- task_patch：
  - Sprint1：玄空常量/黄金样例/单测；免责声明确认+内容过滤；
  - Sprint2：历史/设置页面；UI错误/空状态组件；积分消耗UI展示；GDPR导出/CCPA删除；
  - Sprint4：RAG评测与数据集（≥1000query），AI预算/限流/熔断压测与验收；
  - Sprint5：将玄空/罗盘/RAG门槛纳入Week6/12放行；a11y与i18n文化适配验收；
  - 持续：GDPR/CCPA闭环与导出审计复核。

完整补丁文本见 @REVIEW_FINAL_arbiter.json 的 prd_patch / tech_patch / task_patch 字段。

---

## 5) 路线图（Roadmap）与职责（RACI）

T0（本周）：
- 统一计费口径（aiChat=5 / deepInterpretation=30；TECH补lifetime；UI展示积分）
- PRD新增 7.4 免责声明与内容审核；TECH 增加免责声明确认中间件；UI底部提示上线
- 罗盘最小可行阈值与三色置信度提示；触发校准/手动降级
- TASK补 history/settings 与 GDPR/CCPA“我的数据”入口

T1（本月）：
- 搭建黄金测试集（玄空≥300样例，RAG≥1000query）与自动化评测脚本（RAGAS集成）
- 将玄空/罗盘/RAG门槛纳入Week6放行，接通CI阈值阻断
- 完成AI预算/限流/熔断压测与策略固化
- UI错误/空/限流/超时状态与积分不足降级弹窗

T2（本季度）：
- 完成合规闭环（未成年人、内容审核、数据权益）第三方复审
- a11y（WCAG 2.1 AA）与i18n文化适配全量验收
- 增长闭环（A/B实验、反馈循环、社区运营）

RACI（关键工作流）：
- 评测体系（黄金集+回归+CI门槛）：R=qa，A=architect，C=data，I=product
- RAG验收与脚本：R=data，A=architect，C=backend，I=product
- 合规闭环（免责声明/内容审核/未成年人/GDPR/CCPA）：R=product，A=architect，C=backend/frontend，I=qa
- 计费与积分（含lifetime）：R=product，A=architect，C=backend，I=frontend
- 罗盘阈值/降级与UI联动：R=backend，A=architect，C=frontend，I=product
- 玄空算法可测化（constants/fixtures/单测）：R=architect，A=data，C=qa，I=product
- 指标与埋点（WAPU/激活/留存）：R=backend，A=architect，C=product，I=qa

---

来源模型：gpt-5-high、claude-4.1-opus、gemini-2.5-pro
