# v5.1 变更日志（从 v5.0 升级）

发布日期：2025-09-27

---

## 概览
- 结论：修订（Revise），以评测与合规为核心进行增量升级。
- 重点：评测合同（玄空/罗盘/RAG）、合规闭环、计费统一、降级策略、指标与限流熔断。

## PRD（@PRD_v5.1.md）
- 新增 3.3.3 传感器阈值与降级/拒答（置信度三色；<0.4 拒答）
- 修订 3.4.2 积分消耗，新增 3.4.3 AI 服务计费（aiChat=5 / deepInterpretation=30 / bazi=10 / xuankong=20 / pdf=5；保留 lifetime）
- 新增 6.3 i18n 文化适配验收清单
- 新增 7.4 内容安全与免责声明（18+、拒答清单、隐私提示）
- 新增 13 数据与评测合同（玄空≥300；罗盘阈值/降级；RAG 五指标门槛与 CI 阻断）

## TECH（@TECH_GUIDE_v5.1.md）
- 扩展 pricing：credits + lifetime 计划
- 新增 12.3 导出合规审计与水印
- 新增 13.6 罗盘置信度 calculateConfidence()
- 新增 14.4 玄空 constants + fixtures（≥300 样例，占位）
- 新增 15.3 WAPU 计算与统一事件
- 新增 16.4 AI 预算/限流/熔断（aiRateLimits）
- 新增 20.4 RAG 评测与 CI 阈值

## TASK（@TASK_PLAN_v5.1.md）
- Sprint1：玄空常量/黄金样例/免责声明/内容过滤
- Sprint2：history/settings + GDPR/CCPA + 错误/空/限流/超时组件 + 积分可视化
- Sprint4：RAG Golden Set ≥1000 与评测脚本
- Sprint5：预算/限流/熔断压测与验收；计费统一
- Sprint6：评测门槛绑定 Week6 放行（硬性）；a11y + i18n 验收
- Week12：合规闭环与指标维持达标（硬性）

## UI（@UI_DESIGN_v5.1.md）
- 新增错误/空/限流/超时组件
- 积分消耗/余额可视化 + 三段降级引导
- 罗盘置信度三色 + 校准/手动降级联动
- 合规模块与 18+ 提示；引用 100% 可核呈现

## CI 与放行
- Week6/Week12 门槛在 TASK 明确并以 CI 阈值阻断实现。

## 回滚策略
- 若 RAG/罗盘/玄空任一指标未达标：阻断发布；可切回 v5.0 文档与配置，不变更生产开关；恢复默认限流策略与 AI 成本预算。
