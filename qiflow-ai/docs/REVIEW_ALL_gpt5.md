# QiFlow v5.0 跨文档一致性评审（功能→架构→任务→UI 映射）

评审角色：资深架构师 + 交付经理
评审范围：PRD_v5.0.md + TECH_GUIDE_v5.0.md + TASK_PLAN_v5.0.md + UI_DESIGN_v5.0.md
结论：需修订（Revise）

—

一、一对一映射表（功能/非功能 → 架构/数据/接口 → 任务/里程碑 → UI组件）

说明：每条映射包含“状态（覆盖/缺失/冲突/一对多）”与“修复方案（Owner/ETA/影响面）”。

1) 八字分析（Bazi）
- 架构/数据/接口：
  - Action: src/actions/qiflow/calculate-bazi.ts（PRD §3.1.1；TECH §13.2）
  - Lib: src/lib/qiflow/bazi（TECH §2.1）
  - 表：bazi_calculations（PRD §4.2）
- 任务/里程碑：Sprint1(1.3 核心算法迁移)、Sprint2(2.1 页面)、验收“准确率>99%”（TASK §52）
- UI组件：SteppedForm、LunarDatePicker、ShichenPicker、FourPillarsDisplay、ElementRadar、YinYangSpinner（UI §3.2）
- 状态：覆盖
- 修复方案：
  - 建议在TECH增加checksum/幂等与重放保护（TECH §13.2已提到checksum，但未串至TASK验收）；Owner: backend；ETA: 2天；影响面：支付对账、幂等。

2) 玄空风水（Flying Star/XuanKong）
- 架构/数据/接口：
  - Action: src/actions/qiflow/xuankong-analysis.ts（PRD §3.1.2；TECH §13.3）
  - Lib: src/lib/qiflow/xuankong（TECH §2.1）
  - 表：fengshui_analysis（PRD §4.2）
- 任务/里程碑：Sprint1(1.3 玄空引擎迁移)、Sprint2(2.2 页面)、Sprint3(3.2 可视化)
- UI组件：CompassView、FlyingStarGrid、AnalysisOverlay（UI §3.3）
- 状态：缺失（算法公式/24山/兼线/阈值/黄金样例未在PRD/TECH落地）
- 修复方案：补“数据正确性与评测体系”（PRD新增§13；TECH新增常量与单测）；Owner: architect+data；ETA: 5天；影响面：核心可信度与复测。

3) 罗盘传感器（多通道融合+校准）
- 架构/数据/接口：
  - Client采样 + 可选归一化Route（TECH §13.4；§16.2）
  - 字段：compassReading/compassConfidence（PRD §4.2）
- 任务/里程碑：Sprint2(2.2 罗盘界面)、Sprint5(5.1 性能优化)
- UI组件：Compass3D、CalibrationButton、ConfidenceIndicator、ManualCompassInput（UI §3.3）
- 状态：缺失（σ、漂移、Q/R、置信度公式与4级降级未量化到PRD；TECH仅示意）
- 修复方案：在PRD新增阈值与拒答/回退链路；TECH新增KalmanConfig与calculateConfidence实现；Owner: frontend+backend；ETA: 3天；影响面：罗盘可用性/准确度KPI。

4) AI Orchestrator + RAG
- 架构/数据/接口：
  - Orchestrator配置与流式接口（PRD §3.2；TECH §6）
  - RAG数据源/评测未定（PRD §3.2.2 概述）
- 任务/里程碑：Sprint4(3.1 Orchestrator)、Sprint4(3.1 RAG)
- UI组件：AIChatInterface、ContextBadges、SourceCards（UI §3.4）
- 状态：缺失（召回/精确/拒答/引用正确率与回归基线未定义）
- 修复方案：补“RAG评测合同”（PRD新增§13.3；TECH增加评测脚本与数据集清单；TASK加入基准门槛）；Owner: data；ETA: 5天；影响面：成本/质量闭环。

5) 支付与积分（Stripe + Credits）
- 架构/数据/接口：
  - qiflowPricing配置（PRD §3.4.1/3.4.2；TECH §7.1）
- 任务/里程碑：Sprint5(4.1/4.2)
- UI组件：CreditCounter、UnlockButton（UI §3.2, §3.4）
- 状态：冲突（PRD“AI深度解读:30积分”，TECH“aiChat:5积分”；PRD含lifetime计划，TECH无lifetime、但有master月付）
- 修复方案：
  - 统一：将“AI对话(5积分)”与“AI深度解读(30积分)”并存，区分聊天与深度报告付费；TECH补lifetime；Owner: product+architect；ETA: 2天；影响面：价格与转化漏斗。

6) PDF导出
- 架构/数据/接口：
  - 积分：pdfExport: 5（PRD §3.4.2；TECH §7.1）
- 任务/里程碑：Sprint4(3.2 可视化+PDF)
- UI组件：导出按钮（隐含于结果页）
- 状态：覆盖
- 修复方案：增加水印/审计字段（TECH 增加导出审计打点）；Owner: backend；ETA: 1天；影响面：合规追溯。

7) 历史记录（History）
- 架构/数据/接口：
  - 表：bazi_calculations/fengshui_analysis/ai_conversations（PRD §4.2）
- 任务/里程碑：TASK未显式包含“分析历史页”，仅有“积分历史页面”（TASK §4.2）
- UI组件：/history 页面（PRD §5.2 结构）
- 状态：缺失（任务）
- 修复方案：TASK新增“分析历史页面”与筛选/分页/导出；Owner: frontend；ETA: 2天；影响面：留存与复购。

8) 设置（Settings）
- 架构/数据/接口：
  - 账号、订阅、语言等（各文档结构明确）
- 任务/里程碑：TASK未显式列出设置页交付项
- UI组件：/settings 页面（PRD §5.2 结构）
- 状态：缺失（任务）
- 修复方案：TASK新增“设置页”子任务（语言、主题、隐私、导出/删除）；Owner: frontend；ETA: 2天；影响面：合规/i18n。

9) 国际化与无障碍（i18n+a11y）
- 架构/数据/接口：
  - 路由段[locale]、next-intl（PRD §6；TECH §14.1）
- 任务/里程碑：Sprint7(6.1 多语言)
- UI组件：高对比、aria、键盘可用（UI §7）
- 状态：覆盖但细节需强化（四柱中文竖排 vs 英文横排、农历/时区/单位转换验收）
- 修复方案：PRD补“历法/时区/单位适配”验收清单；Owner: product；ETA: 2天；影响面：多语言体验。

10) 监控与可观测性
- 架构/数据/接口：
  - Sentry/OpenTelemetry/OpenPanel（TECH §15）
- 任务/里程碑：Sprint6(6.2 生产部署含告警)
- UI组件：无
- 状态：覆盖
- 修复方案：补算法/罗盘/RAG专项指标（见PRD新增§13.4）；Owner: backend；ETA: 2天；影响面：质量门槛上线前可验收。

11) 安全与合规（免责声明/内容安全）
- 架构/数据/接口：
  - PRD仅有GDPR/CCPA/支付（PRD §7），无“算命服务免责声明/拒答策略”
- 任务/里程碑：未显式
- UI组件：结果页底部提示、对话拒答提示
- 状态：缺失（PRD+TASK）
- 修复方案：PRD新增“7.4 免责声明与敏感内容策略”；TASK补“法务审查+文案落地”；Owner: product；ETA: 3天；影响面：法律风险、上架审核。

12) 评测与测试（数据正确性/回归）
- 架构/数据/接口：
  - TECH §20 测试体系（通用），但未包含玄空/RAG量化门槛
- 任务/里程碑：Sprint5(5.2 测试完善)，门槛不含数据合同
- UI组件：无
- 状态：缺失（门槛）
- 修复方案：PRD新增§13“数据与评测合同”，TASK加入门槛/基线/E2E；Owner: qa+data；ETA: 4天；影响面：稳定交付与验收。

—

二、主要跨文档问题（Top 10）

1) 定价/积分不一致（PRD vs TECH）：AI深度解读(30) vs aiChat(5)，以及PRD含lifetime计划而TECH缺失；
- 修复：拆分“AI对话(5)”与“AI深度解读(30)”，TECH补lifetime；Owner: product；ETA: 2天。

2) 玄空算法定义缺失（PRD/TECH均未给公式、阈值与黄金样例）；
- 修复：PRD+TECH新增§13算法与测试；Owner: architect+data；ETA: 5天。

3) 传感器阈值/置信度/降级链路缺失（PRD定性、TECH示意，不可验收）；
- 修复：PRD加入σ/漂移/Q-R/置信度公式与拒答策略；TECH补实现；Owner: backend+frontend；ETA: 3天。

4) RAG评测指标与数据集缺失（PRD无门槛，TECH无脚本，TASK无验收）；
- 修复：PRD设Recall/Precision/Ref-Cite/Reject门槛，TECH上脚本，TASK加基准；Owner: data；ETA: 5天。

5) 历史/设置页面未在TASK显式交付；
- 修复：TASK新增“分析历史页/设置页”任务；Owner: frontend；ETA: 2天。

6) 免责声明/拒答与合规策略缺失（PRD）；
- 修复：PRD新增7.4；TASK加入法务与风控落地；Owner: product；ETA: 3天。

7) 评测门槛未纳入“质量门槛/里程碑”验收；
- 修复：TASK在阶段验收中加入“算法/罗盘/RAG”量化门槛；Owner: qa；ETA: 2天。

8) i18n细节缺失（历法/时区/单位/术语语义化说明）；
- 修复：PRD补适配清单与示例；TECH在14.1加入实现要点；Owner: product；ETA: 2天。

9) 成本/速率与熔断缺失（AI预算/限流/降级未入PRD/TASK）；
- 修复：PRD新增AI预算/限流/降级条款；TASK加入压测与限流验证；Owner: architect；ETA: 3天。

10) 导出合规与审计缺失（PDF导出未定义审计/水印/追踪）；
- 修复：TECH新增导出审计中间件；TASK加入安全复核；Owner: backend；ETA: 2天。

—

三、Quick Wins（1周内）
- 对齐积分：PRD补AI对话(5)与深度解读(30)并存；TECH增加lifetime；
- 增加免责声明模板与拒答清单（PRD §7.4）；
- 定义24山映射常量文件与50个黄金样例占位（TECH+fixtures）；
- 传感器置信度公式与4级降级链路最小实现（TECH）；
- TASK补“历史/设置”页面与“评测门槛”勾稽验收。

—

四、补丁摘要（将体现在 JSON 的 prd_patch/tech_patch/task_patch 字段）

- PRD补丁：
  - 新增§7.4 免责声明与敏感内容策略；
  - 新增§3.3.3 传感器阈值/降级/拒答；
  - 调整§3.4.2：区分AI对话(5)与AI深度解读(30)，保留lifetime；
  - 新增§13 数据正确性与评测体系（玄空/RAG/罗盘门槛与验收）。

- TECH补丁：
  - src/config/qiflow-pricing.ts 增加 deepInterpretation:30 与 plans.lifetime；
  - 新增 src/lib/qiflow/xuankong/constants.ts（24山/阈值）与 calculateConfidence；
  - 导出审计打点与水印；
  - AI预算与限流配置（aiRateLimits）。

- TASK补丁：
  - Sprint1 增“玄空常量/黄金样例/单测”；
  - Sprint2 增“历史页/设置页”；
  - Sprint4 增“RAG评测与数据集构建”；
  - 里程碑加入“算法/罗盘/RAG”量化门槛；
  - 合规任务：免责声明与法务审查。

—

五、结论
- 当前版本具备交付基础，但存在跨文档冲突与不可验收的空白项；
- 通过上述补丁，预计1周内可完成对齐并形成可执行的“功能→架构→任务→UI”闭环；
- 建议在进入Sprint2前合入补丁并复核映射表一次。
