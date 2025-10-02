# 发布说明（Release Notes）— v5.1（仲裁整合落版）

发布日期：2025-09-27    负责人：发布经理

---

## 1) 摘要（Summary）
- 目标：以“评测合同 + 合规闭环 + 计费统一 + 降级策略”四件套，补齐 v5.0 放行短板。
- 结论：修订（Revise）；Week6/Week12 门槛以 CI 阈值硬阻断。

## 2) 关键改动（What’s New）
- PRD：
  - 新增 3.3.3 传感器阈值/置信度三色/降级/拒答。
  - 计费口径统一：aiChat=5 / deepInterpretation=30 / bazi=10 / xuankong=20 / pdf=5；新增 3.4.3。
  - 新增 7.4 免责声明与内容安全；新增 13 数据与评测合同（玄空≥300；RAG 五指标门槛）。
- TECH：
  - pricing 扩展 + lifetime；导出合规审计与水印；罗盘 calculateConfidence；aiRateLimits/熔断；WAPU 计算与统一事件；RAG 评测与 CI 阈值。
- TASK：
  - Sprint1/2/4/5 强化评测与合规落地；Week6/12 放行条件明确并接入 CI 阈值。
- UI：
  - 错误/空/限流/超时组件；积分可视化与三段降级；置信度三色与校准联动；合规模块与 18+ 提示。

## 3) 放行门槛（Gates）
- Week 6：
  - 玄空黄金样例 ≥300 达标；罗盘端到端阈值与 UI 联动达标；
  - RAG：Recall@10≥85% / Faithfulness≥95% / Answer Relevancy≥90% / 拒答≥95% / 引用 100% 可核；
  - UI 错误/空/限流组件上线；CI 未达标即阻断。
- Week 12：
  - 合规闭环（免责声明/内容过滤/未成年人/GDPR/CCPA）全量通过；
  - a11y（WCAG 2.1 AA，对比度≥4.5:1）与 i18n 文化适配验收；
  - 计费口径与 UI 展示一致；指标埋点准确。

## 4) 风控与回滚（Risk & Rollback）
- 若任一指标未达标：CI 阻断，不进入生产；保留 v5.0 文档与配置，回退开关无用户影响。
- 罗盘低置信度：强制校准或转手动输入；拒答需展示原因。
- AI 成本：启用 aiRateLimits 与熔断；监控预算与异常率。

## 5) 上线清单（Go-Live Checklist）
- [ ] PRD/TECH/TASK/UI v5.1 全量回顾完成
- [ ] RAG 评测管道接入 CI；阈值校验通过
- [ ] 玄空/罗盘回归 100% 通过；玄空 ≥300 样例
- [ ] 免责声明/内容过滤/18+ 提示已上线
- [ ] GDPR 导出/CCPA 删除入口可用；审计与水印启用
- [ ] 计费口径对齐；UI 显示积分消耗与余额不足引导
- [ ] 指标埋点校验（WAPU/激活/留存）

## 6) 参考
- @PRD_v5.1.md / @TECH_GUIDE_v5.1.md / @TASK_PLAN_v5.1.md / @UI_DESIGN_v5.1.md
- @ISSUES_MATRIX_v5.1.md / @CHANGELOG_v5.1.md / @DIFF_*